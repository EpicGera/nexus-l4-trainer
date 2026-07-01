import { useState, useEffect } from "react";
import { User } from "firebase/auth";

export function useSyncState() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState({
    hasPendingWrites: false,
    fromCache: false,
    isOnline: navigator.onLine,
    lastSyncTime: Date.now()
  });

  const [realTime, setRealTime] = useState(new Date());
  const [syncWithRealTime, setSyncWithRealTime] = useState<boolean>(() => {
    const saved = localStorage.getItem("nexus_sync_real_time");
    return saved !== "false"; // Defaults to true
  });

  return {
    currentUser, setCurrentUser,
    isCloudSyncing, setIsCloudSyncing,
    syncStatus, setSyncStatus,
    realTime, setRealTime,
    syncWithRealTime, setSyncWithRealTime
  };
}
