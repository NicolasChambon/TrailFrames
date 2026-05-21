import { useCallback, useEffect, useRef, useState } from "react";
import api, { fetchCsrfToken, getCsrfToken } from "@/lib/api";
import type { PhotoSyncStatus } from "@/types/photos";

interface PhotoSyncState {
  status: PhotoSyncStatus;
  processed: number;
  total: number;
  resumeAt: string | null;
}

interface UsePhotoSyncReturn {
  syncState: PhotoSyncState;
  isConnected: boolean;
  startSync: () => Promise<void>;
  disconnect: () => void;
}

const DEFAULT_STATE: PhotoSyncState = {
  status: "NOT_STARTED",
  processed: 0,
  total: 0,
  resumeAt: null,
};

export function usePhotoSync(
  initialStatus?: PhotoSyncStatus,
): UsePhotoSyncReturn {
  const [syncState, setSyncState] = useState<PhotoSyncState>({
    ...DEFAULT_STATE,
    status: initialStatus ?? "NOT_STARTED",
  });
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    // If there's an active connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Open SSE connection (only listen to progress)
  const connectSse = useCallback(() => {
    disconnect();

    let csrf = getCsrfToken();

    const openConnection = (token: string) => {
      // Build the SSE URL with the CSRF token as a query parameter
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/activities/photos/sync/stream?csrfToken=${encodeURIComponent(token)}`;

      // Create a new EventSource connection
      const eventSource = new EventSource(url, { withCredentials: true });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => setIsConnected(true);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            // Initial event sent by backend on (re)connection
            case "status":
              setSyncState({
                status: data.photoSyncStatus,
                processed: data.photoSyncProcessed,
                total: data.photoSyncTotal,
                resumeAt: data.photoSyncResumedAt,
              });
              // If job is done or errored, no need to stay connected
              if (
                data.photoSyncStatus === "COMPLETED" ||
                data.photoSyncStatus === "ERROR"
              ) {
                disconnect();
              }
              break;

            case "started":
              setSyncState((prev) => ({
                ...prev,
                status: "IN_PROGRESS",
                total: data.total,
                processed: 0,
              }));
              break;

            case "processing_activity":
              setSyncState((prev) => ({
                ...prev,
                status: "IN_PROGRESS",
                processed: data.processed,
                total: data.total,
              }));
              break;

            case "paused":
              setSyncState({
                status: "PAUSED",
                processed: data.processed,
                total: data.total,
                resumeAt: data.resumeAt,
              });
              break;

            case "resumed":
              setSyncState((prev) => ({
                ...prev,
                status: "IN_PROGRESS",
                resumeAt: null,
              }));
              break;

            case "completed":
              setSyncState((prev) => ({
                ...prev,
                status: "COMPLETED",
              }));
              disconnect();
              break;

            case "error":
              setSyncState((prev) => ({
                ...prev,
                status: "ERROR",
              }));
              disconnect();
              break;
          }
        } catch {
          // JSON.parse can fail on malformed messages - we ignore
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        // EventSource will automatically try to reconnect - we don't close it
      };
    };

    if (csrf) {
      openConnection(csrf);
    } else {
      fetchCsrfToken().then(() => {
        csrf = getCsrfToken();
        if (csrf) openConnection(csrf);
      });
    }
  }, [disconnect]);

  const startSync = useCallback(async () => {
    // 1. Trigger the job via POST request
    await api.post("/activities/photos/sync");

    // 2. Open SSE connection to listen to progress
    connectSse();
  }, [connectSse]);

  // If job is already in progress, open SSE connection directly
  useEffect(() => {
    if (syncState.status === "IN_PROGRESS" || syncState.status === "PAUSED") {
      connectSse();
    }

    // Clean up on unmount
    return () => disconnect();

    // We only want to run this effect once on mount,
    // syncState.status is updated via SSE events,
    // we don't want to re-run this effect every time it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    syncState,
    isConnected,
    startSync,
    disconnect,
  };
}
