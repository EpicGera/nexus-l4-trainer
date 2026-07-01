import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { initAuth } from "../lib/firebase";
import { initializeSyncEngine } from "../lib/syncEngine";
import { getWeekOfProgram } from "../lib/constants";

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

  const [syncWithRealTime, setSyncWithRealTime] = useState<boolean>(() => {
    const saved = localStorage.getItem("nexus_sync_real_time");
    return saved !== "false"; // Defaults to true
  });

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
    localStorage.setItem("nexus_sync_real_time", String(nextSync));
    if (nextSync) {
      const now = new Date();
      const autoWeek = getWeekOfProgram(now);
      const jsDay = now.getDay();
      const autoDayIndex = jsDay === 0 ? 6 : jsDay - 1;

      setCurrentWeek(autoWeek);
      setCurrentDayIndex(autoDayIndex);
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
