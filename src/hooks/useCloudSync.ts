import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { initAuth } from "../lib/firebase";
import { initializeSyncEngine } from "../lib/syncEngine";
import { getProgramTodayPosition } from "../lib/programStart";
import { getAutoFollow, setAutoFollow } from "../lib/storageKeys";

// ponytail: reloadAllLocalStorageState stays in App.tsx — it writes state owned
// by several hooks/App; move it only when each piece has a single owner.
export function useCloudSync(
  setCurrentWeek: (week: string) => void,
  setCurrentDayIndex: (idx: number) => void,
) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState({
    hasPendingWrites: false,
    fromCache: false,
    isOnline: navigator.onLine,
    lastSyncTime: Date.now(),
  });

  const [syncWithRealTime, setSyncWithRealTime] = useState<boolean>(() =>
    getAutoFollow(),
  );

  const [manualSyncState, setManualSyncState] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  // --- CLOUD SYNC LIFE CYCLES ---
  useEffect(() => {
    const authCleanup = initAuth();
    const cleanup = initializeSyncEngine((user, isSyncing) => {
      setCurrentUser(user);
      setIsCloudSyncing(isSyncing);
    });
    return () => {
      authCleanup();
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSyncStatus(customEvent.detail);
      }
    };
    window.addEventListener("nexus_sync_status", handleSyncStatus);
    return () => {
      window.removeEventListener("nexus_sync_status", handleSyncStatus);
    };
  }, []);

  const handleToggleSync = () => {
    const nextSync = !syncWithRealTime;
    setSyncWithRealTime(nextSync);
    setAutoFollow(nextSync);
    if (nextSync) {
      // posición REAL del programa (ancla del capítulo), no semana calendario
      const pos = getProgramTodayPosition();
      setCurrentWeek(pos.week);
      setCurrentDayIndex(pos.dayIndex);
    }
  };

  return {
    currentUser,
    isCloudSyncing,
    setIsCloudSyncing,
    syncStatus,
    syncWithRealTime,
    setSyncWithRealTime,
    manualSyncState,
    setManualSyncState,
    handleToggleSync,
  };
}
