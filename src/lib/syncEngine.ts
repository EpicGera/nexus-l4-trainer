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

// Monkeypatch localStorage to transparently intercept any writes
export function setupStorageMonkeypatch() {
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

// Push all syncable local keys to the cloud
export async function pushAllLocalToCloud(userId: string) {
  const syncableKeys: { key: string; value: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isSyncableKey(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        syncableKeys.push({ key, value });
      }
    }
  }

  const promises = syncableKeys.map(async ({ key, value }) => {
    const safeDocId = getSafeDocId(key);
    const docRef = doc(db, 'users', userId, 'localStorageSync', safeDocId);
    const localTime = getLocalTimestamp(key) || Date.now();
    await setDoc(docRef, {
      key,
      value,
      updatedAt: new Date(localTime).toISOString()
    });
  });

  await Promise.all(promises);
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
        // Delete all syncable documents on auth clear
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
  onAuthStateChanged(auth, async (user) => {
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
                  // Exists in both -> Conflict resolution based on timestamps
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
              if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                // Also remove locally tracked timestamp
                try {
                  const stamps = getLocalTimestamps();
                  delete stamps[key];
                  localStorage.setItem('nexus_sys_sync_timestamps', JSON.stringify(stamps));
                } catch (e) {}
                changed = true;
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
  };
}
