import { useCallback, useEffect, useState, useRef } from "react";
import { fetchCsrfToken, getCsrfToken } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

// TODO: can we sync this type for backend and frontend (it's the same as ProgressEvent in backend/src/services/activitiesService.ts) without creating a new package for shared types?
type SSEEvent =
  | { type: "started"; data: { message: string } }
  | { type: "fetching_page"; data: { page: number; activitiesCount: number } }
  | {
      type: "saving_activities";
      data: { total: number; newActivities: number };
    }
  | { type: "completed"; data: { totalSynced: number; syncedAt: string } }
  | { type: "error"; data: { message: string } };

interface SyncProgress {
  status: "connecting" | "syncing" | "completed" | "error";
  message: string;
  currentPage?: number;
  activitiesCount?: number;
  totalActivities?: number;
  newActivities?: number;
  totalSynced?: number;
  syncedAt?: string;
}

interface UseActivitySyncReturn {
  isConnecting: boolean;
  isSyncing: boolean;
  progress: SyncProgress | null;
  error: string | null;

  startSync: () => void;
  cancelSync: () => void;
  clearError: () => void;
}

export const useActivitySync = (): UseActivitySyncReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const { user, setUser } = useAuthStore();

  // SSE message handler
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case "started":
            setIsConnecting(false);
            setIsSyncing(true);
            setProgress({
              status: "syncing",
              message: data.data.message,
            });
            break;

          case "fetching_page":
            setProgress((prev) => ({
              status: "syncing",
              message: `Chargement de la page ${data.data.page}...`,
              currentPage: data.data.page,
              activitiesCount: data.data.activitiesCount,
              totalActivities:
                (prev?.totalActivities || 0) + data.data.activitiesCount,
            }));
            break;

          case "saving_activities":
            setProgress((prev) => ({
              ...prev,
              status: "syncing",
              message: `Sauvegarde de ${data.data.newActivities} nouvelles activités...`,
              totalActivities: data.data.total,
              newActivities: data.data.newActivities,
            }));
            break;

          case "completed":
            setIsSyncing(false);
            setProgress({
              status: "completed",
              message: `Synchronisation terminée! ${data.data.totalSynced} activités ajoutées.`,
              totalSynced: data.data.totalSynced,
              syncedAt: data.data.syncedAt,
            });

            // Update user's lastSyncedAt in auth store
            if (user) {
              setUser({
                ...user,
                lastSyncedAt: data.data.syncedAt,
              });
            }
            break;

          case "error":
            setIsConnecting(false);
            setIsSyncing(false);
            setError(data.data.message);
            setProgress({
              status: "error",
              message: data.data.message,
            });
            break;
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
        setError("Erreur de communication avec le serveur.");
      }
    },
    [setUser, user],
  );

  // Connection error handler
  const handleError = useCallback((event: Event) => {
    console.error("SSE connection error:", event);
    setIsConnecting(false);
    setIsSyncing(false);
    setError("Erreur de connexion au serveur.");
    setProgress({
      status: "error",
      message: "La connexion au serveur a été perdue.",
    });
  }, []);

  // Start synchronization
  const startSync = useCallback(async () => {
    if (!user) {
      setError("Vous devez être connecté pour synchroniser");
      return;
    }

    // Clean potential existing connexion
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsConnecting(true);
    setIsSyncing(false);
    setError(null);
    setProgress(null);

    try {
      // 1. Fetch CSRF token from API
      await fetchCsrfToken();
      const csrfToken = getCsrfToken();

      if (!csrfToken) {
        throw new Error("CSRF token unavailable");
      }

      // 2. Build URL with CSRF token as query parameter
      // EventSource cannot send custom headers, so CSRF must be in query param
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const url = `${apiUrl}/activities/sync/stream?csrfToken=${encodeURIComponent(csrfToken)}`;

      // 3. Create SSE connection with secured URL
      const eventSource = new EventSource(url, {
        withCredentials: true, // Send cookies (JWT + session)
      });

      eventSourceRef.current = eventSource;

      // Attach event listeners
      eventSource.addEventListener("message", handleMessage);
      eventSource.addEventListener("error", handleError);

      // Automatic cleanup if connection is closed properly
      eventSource.addEventListener("close", () => {
        eventSource.close();
        eventSourceRef.current = null;
      });
    } catch (error) {
      setIsConnecting(false);
      setError("Impossible de démarrer la synchronisation.");
      console.error("Failed to start sync:", error);
    }
  }, [handleError, handleMessage, user]);

  // Cancel synchronization
  const cancelSync = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnecting(false);
    setIsSyncing(false);
    setProgress(null);
    setError("Synchronisation annulée");
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    if (progress?.status === "error") {
      setProgress(null);
    }
  }, [progress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    isConnecting,
    isSyncing,
    progress,
    error,
    startSync,
    cancelSync,
    clearError,
  };
};
