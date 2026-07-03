import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  collection, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export function isSyncableKey(key: string): boolean {
  if (key === 'nexus_sys_sync_timestamps') return false;
  // nexus_* covers everything prefixed; the second pattern matches the
  // day-completed markers, which are stored bare as `w1d1`…`w4d7` (and the
  // legacy `w1_day1` form). Without this they never roamed across devices.
  return key.startsWith('nexus_') || /^[wW]\d+(?:_day|d)\d+$/.test(key);
}

function getSafeDocId(key: string): string {
  return key.replace(/\//g, '___SLASH___');
}

let isSyncingFromCloud = false;
let currentUnsubscribe: Unsubscribe | null = null;
const writeTimeouts = new Map<string, any>();

// Helper functions for tracking local modification timestamps
function getLocalTimestamps(): Record<string, number> {
  try {
    const raw = localStorage.getItem('nexus_sys_sync_timestamps');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setLocalTimestamp(key: string, timestamp: number) {
  try {
    const stamps = getLocalTimestamps();
    stamps[key] = timestamp;
    localStorage.setItem('nexus_sys_sync_timestamps', JSON.stringify(stamps));
  } catch (e) {
    console.error('Error saving local sync timestamp:', e);
  }
}

function getLocalTimestamp(key: string): number {
  return getLocalTimestamps()[key] || 0;
}

// Monkeypatch localStorage to transparently intercept any writes.
// Guarded: re-running initializeSyncEngine (StrictMode/HMR) must not re-wrap
// the already-wrapped methods, or every write dispatches duplicate events.
let monkeypatchInstalled = false;
export function setupStorageMonkeypatch() {
  if (monkeypatchInstalled) return;
  monkeypatchInstalled = true;
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    if (!isSyncingFromCloud && isSyncableKey(key)) {
      setLocalTimestamp(key, Date.now());
      window.dispatchEvent(new CustomEvent('nexus_storage_changed', { 
        detail: { key, value } 
      }));
    }
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key: string) {
    originalRemoveItem.apply(this, [key]);
    if (!isSyncingFromCloud && isSyncableKey(key)) {
      setLocalTimestamp(key, Date.now());
      window.dispatchEvent(new CustomEvent('nexus_storage_changed', { 
        detail: { key, value: null } 
      }));
    }
  };

  const originalClear = localStorage.clear;
  localStorage.clear = function() {
    originalClear.apply(this);
    if (!isSyncingFromCloud) {
      window.dispatchEvent(new CustomEvent('nexus_storage_changed', { 
        detail: { clearAll: true } 
      }));
    }
  };
}

// ponytail: one toast per failure streak (resets on the next successful push)
// — enough to stop silent data-loss surprises without a retry queue.
let pushFailureNotified = false;
function notifyPushFailure() {
  if (pushFailureNotified) return;
  pushFailureNotified = true;
  window.dispatchEvent(
    new CustomEvent('nexus_toast', {
      detail: {
        message:
          '⚠️ La sincronización a la nube falló — tus datos siguen guardados en este dispositivo',
        kind: 'error',
        durationMs: 8000,
      },
    }),
  );
}

// Queue a Firestore update with a 300ms debounce
function queueCloudPush(userId: string, key: string, value: string | null) {
  if (writeTimeouts.has(key)) {
    clearTimeout(writeTimeouts.get(key));
  }

  const timeout = setTimeout(async () => {
    writeTimeouts.delete(key);
    try {
      const safeDocId = getSafeDocId(key);
      const docRef = doc(db, 'users', userId, 'localStorageSync', safeDocId);
      
      const localTime = getLocalTimestamp(key) || Date.now();
      const updatedAtStr = new Date(localTime).toISOString();

      if (value === null) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          key,
          value,
          updatedAt: updatedAtStr
        });
      }
      pushFailureNotified = false;
    } catch (error) {
      console.error(`Error syncing key ${key} to Firestore:`, error);
      notifyPushFailure();
      // Suppress alert popups using the silent handleFirestoreError pattern
      try {
        const safeDocId = getSafeDocId(key);
        handleFirestoreError(error, value === null ? OperationType.DELETE : OperationType.WRITE, `users/${userId}/localStorageSync/${safeDocId}`);
      } catch (e) {
        // Suppress thrown exception to prevent crashing main thread
      }
    }
  }, 300);

  writeTimeouts.set(key, timeout);
}

// Manual "push all" (sync button): local → cloud, but with the same LWW rule
// as the sweep — never clobber a cloud copy that is newer than the local one.
export async function pushAllLocalToCloud(userId: string) {
  const cloudTimes = new Map<string, number>();
  const snapshot = await getDocs(collection(db, 'users', userId, 'localStorageSync'));
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data && data.key) {
      cloudTimes.set(data.key, data.updatedAt ? new Date(data.updatedAt).getTime() : 0);
    }
  });

  const promises: Promise<void>[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !isSyncableKey(key)) continue;
    const value = localStorage.getItem(key);
    if (!value) continue;
    const localTime = getLocalTimestamp(key);
    if ((cloudTimes.get(key) ?? 0) > localTime) continue; // cloud is newer — skip
    const docRef = doc(db, 'users', userId, 'localStorageSync', getSafeDocId(key));
    promises.push(setDoc(docRef, {
      key,
      value,
      updatedAt: new Date(localTime || Date.now()).toISOString()
    }));
  }

  await Promise.all(promises);
}

// Reset flow (`localStorage.clear()` in handleConfirmReset): mirror the wipe to
// the cloud — without this the next sweep resurrects everything from Firestore.
// ponytail: pending debounced pushes are cancelled first; the SDK write stream
// keeps delete-before-recreate ordering for the keys the reset re-seeds.
async function clearAllCloudDocs(userId: string) {
  for (const t of writeTimeouts.values()) clearTimeout(t);
  writeTimeouts.clear();
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'localStorageSync'));
    await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
  } catch (error) {
    console.error('Error clearing cloud sync docs:', error);
    notifyPushFailure();
  }
}

// Initialize the sync engine and auth state listeners
export function initializeSyncEngine(
  onUserUpdate: (user: User | null, isSyncing: boolean) => void
) {
  // Apply monkeypatching
  setupStorageMonkeypatch();

  // Listen to intermediate LocalStorage writes while user is logged in
  const handleStorageChange = (e: Event) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      const { key, value, clearAll } = customEvent.detail;
      if (clearAll) {
        void clearAllCloudDocs(userId);
        return;
      }
      if (key) {
        queueCloudPush(userId, key, value);
      }
    }
  };

  window.addEventListener('nexus_storage_changed', handleStorageChange);

  let activeOnlineListener: (() => void) | null = null;

  // Monitor Auth State Changes
  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    // Unsubscribe from any previous Firestore listeners and browser events to avoid resource leaks
    if (currentUnsubscribe) {
      currentUnsubscribe();
      currentUnsubscribe = null;
    }
    if (activeOnlineListener) {
      window.removeEventListener('online', activeOnlineListener);
      activeOnlineListener = null;
    }

    if (user) {
      onUserUpdate(user, true);
      const userId = user.uid;

      // Define a robust, unified bidirectional synchronization sweep
      const runFullBidirectionalSync = async () => {
        try {
          const syncPath = `users/${userId}/localStorageSync`;
          const querySnapshot = await getDocs(collection(db, syncPath));

          const cloudKeys = new Set<string>();
          isSyncingFromCloud = true;
          let changed = false;

          try {
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && data.key) {
                const key = data.key;
                cloudKeys.add(key);

                const cloudTime = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
                const localValue = localStorage.getItem(key);
                const localTime = getLocalTimestamp(key);

                if (localValue === null) {
                  // Only in cloud -> Pull to local
                  localStorage.setItem(key, data.value);
                  setLocalTimestamp(key, cloudTime);
                  changed = true;
                } else {
                  // Exists in both -> Conflict resolution based on timestamps.
                  // ponytail: LWW over device wall-clocks — a device with a
                  // skewed clock can win with older data. Accepted trade-off;
                  // the real fix (server-issued timestamps) changes the doc schema.
                  if (cloudTime > localTime) {
                    // Cloud is newer -> Pull to local
                    if (localValue !== data.value) {
                      localStorage.setItem(key, data.value);
                      setLocalTimestamp(key, cloudTime);
                      changed = true;
                    }
                  } else if (localTime > cloudTime) {
                    // Local is newer -> Push to cloud
                    queueCloudPush(userId, key, localValue);
                  }
                }
              }
            });
          } finally {
            isSyncingFromCloud = false;
          }

          // Push any local syncable keys that do not exist in the cloud
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && isSyncableKey(key) && !cloudKeys.has(key)) {
              const val = localStorage.getItem(key);
              if (val) {
                queueCloudPush(userId, key, val);
              }
            }
          }

          if (changed) {
            window.dispatchEvent(new Event('nexus_cloud_synced'));
          }
        } catch (err) {
          console.error('Error in runFullBidirectionalSync:', err);
          // Pull failed = this device is NOT synced; surface it instead of
          // letting the user believe the login sweep worked.
          notifyPushFailure();
        }
      };

      // Set up network state restoration listeners
      activeOnlineListener = () => {
        console.log('Network status online: running full bidirectional sync...');
        runFullBidirectionalSync();
      };
      window.addEventListener('online', activeOnlineListener);

      // Perform the initial bidirectional synchronization sweep
      await runFullBidirectionalSync();

      // Setup real-time dynamic sync subscription
      const syncPath = `users/${userId}/localStorageSync`;
      currentUnsubscribe = onSnapshot(collection(db, syncPath), (snapshot) => {
        isSyncingFromCloud = true;
        let changed = false;

        // Broadcast Firestore synchronization state telemetry
        try {
          window.dispatchEvent(new CustomEvent('nexus_sync_status', {
            detail: {
              hasPendingWrites: snapshot.metadata.hasPendingWrites,
              fromCache: snapshot.metadata.fromCache,
              isOnline: navigator.onLine,
              lastSyncTime: Date.now()
            }
          }));
        } catch (e) {}

        try {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data();
            if (!data || !data.key) return;
            const key = data.key;
            const value = data.value;
            const cloudTime = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;

            if (change.type === 'removed') {
              const localValue = localStorage.getItem(key);
              if (localValue !== null) {
                if (getLocalTimestamp(key) > cloudTime) {
                  // Local edit is newer than the deleted cloud copy — keep it
                  // and re-push instead of propagating a stale deletion (same
                  // LWW rule as updates).
                  queueCloudPush(userId, key, localValue);
                } else {
                  localStorage.removeItem(key);
                  // Also remove locally tracked timestamp
                  try {
                    const stamps = getLocalTimestamps();
                    delete stamps[key];
                    localStorage.setItem('nexus_sys_sync_timestamps', JSON.stringify(stamps));
                  } catch (e) {}
                  changed = true;
                }
              }
            } else {
              const localValue = localStorage.getItem(key);
              const localTime = getLocalTimestamp(key);

              if (localValue !== value) {
                if (cloudTime > localTime) {
                  localStorage.setItem(key, value);
                  setLocalTimestamp(key, cloudTime);
                  changed = true;
                } else if (localTime > cloudTime) {
                  // Local is more recent -> Push local to cloud to resolve conflict
                  queueCloudPush(userId, key, localValue);
                }
              }
            }
          });

          if (changed) {
            window.dispatchEvent(new Event('nexus_cloud_synced'));
          }
        } finally {
          isSyncingFromCloud = false;
        }
      }, (error) => {
        // Suppress snapping runtime errors on the foreground interface
        try {
          handleFirestoreError(error, OperationType.GET, syncPath);
        } catch (e) {}
      });

      onUserUpdate(user, false);
    } else {
      // User logged out
      onUserUpdate(null, false);
    }
  });

  return () => {
    window.removeEventListener('nexus_storage_changed', handleStorageChange);
    if (activeOnlineListener) {
      window.removeEventListener('online', activeOnlineListener);
    }
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
    unsubscribeAuth();
  };
}
