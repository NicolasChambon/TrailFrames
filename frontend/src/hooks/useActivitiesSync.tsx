import { useState, useCallback, useRef, useEffect } from "react";
import { getCsrfToken, fetchCsrfToken } from "@/lib/api";

interface SyncProgress {
  message: string;
  current?: number;
  total?: number;
  type: "info" | "success" | "error" | "progress";
  key?: string;
}

interface UseActivitiesSyncReturn {
  isSyncing: boolean;
  progress: SyncProgress[];
  startSync: () => Promise<void>;
  stopSync: () => void;
}

export function useActivitiesSync(): UseActivitiesSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fetchedCountRef = useRef(0);

  const addProgress = useCallback((newProgress: SyncProgress) => {
    // If the new progress has a key, try to find an existing item with the same
    // key and update it instead of adding a new one
    if (newProgress.key) {
      setProgress((prev) => {
        const index = prev.findIndex(
          (progress) => progress.key === newProgress.key,
        );

        // -1 means no existing item with the same key
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = newProgress;
          return updated;
        }
        return [...prev, newProgress];
      });
    } else {
      // No key provided, simply add the new progress to the list
      setProgress((prev) => [...prev, newProgress]);
    }
  }, []);

  const stopSync = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsSyncing(false);
    }
  }, []);

  const startSync = useCallback(async () => {
    // Close any existing connection before starting a new one
    stopSync();
    fetchedCountRef.current = 0;

    try {
      // Verify if we have a CSRF token, if not fetch it
      let csrf = getCsrfToken();
      if (!csrf) {
        await fetchCsrfToken();
        csrf = getCsrfToken();
      }

      if (!csrf) {
        throw new Error("Impossible d'obtenir le token CSRF");
      }

      // Build the SSE URL with the CSRF token as a query parameter
      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/activities/sync/stream?csrf-token=${encodeURIComponent(csrf)}`;

      // Create a new EventSource connection
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsSyncing(true);
        addProgress({
          type: "info",
          message: "Connexion établie",
        });
      };

      // Listen for messages from the server
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "started":
              addProgress({
                type: "info",
                message: "Synchronisation démarrée",
              });
              break;

            case "fetching_page":
              fetchedCountRef.current += data.activitiesCount as number;
              addProgress({
                key: "fetching_page",
                type: "progress",
                message: `${fetchedCountRef.current} activité${
                  fetchedCountRef.current > 1 ? "s" : ""
                } récupérée${fetchedCountRef.current > 1 ? "s" : ""}`,
              });
              break;

            case "saving_activities":
              addProgress({
                type: "progress",
                message: `Sauvegarde de ${data.newActivities} nouvelles activités sur un total de ${data.total}`,
                current: data.newActivities,
                total: data.total,
              });
              break;

            case "completed":
              addProgress({
                type: "success",
                message: `Synchronisation terminée ! ${data.totalSynced} activités synchronisées.`,
              });
              setIsSyncing(false);
              break;

            case "error":
              addProgress({
                type: "error",
                message: `Erreur: ${data.message}`,
              });
              setIsSyncing(false);
              stopSync();
              break;

            default:
              console.error("Type d'événement inconnu:", data.type);
          }
        } catch (error) {
          console.error("Erreur de parsing du message SSE:", error);
          addProgress({
            type: "error",
            message: "Erreur lors du traitement des données",
          });
        }
      };

      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          addProgress({
            type: "error",
            message: "Connexion fermée par le serveur",
          });
          stopSync();
        }
      };
    } catch (error) {
      addProgress({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de la synchronisation",
      });
      setIsSyncing(false);
    }
  }, [addProgress, stopSync]);

  // Cleanup effect to ensure the connection is closed when the component using this hook unmounts
  useEffect(() => {
    return () => {
      stopSync();
    };
  }, [stopSync]);

  return {
    isSyncing,
    progress,
    startSync,
    stopSync,
  };
}
