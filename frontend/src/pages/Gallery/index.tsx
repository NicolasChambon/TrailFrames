import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { TypographyH2 } from "@/components/ui/typographyH2";
import { TypographySubtitle } from "@/components/ui/typographySubtitle";
import { usePhotoSync } from "@/hooks/usePhotoSync";
import { fetcher } from "@/lib/api";
import type {
  PhotoSyncStatus,
  PhotoSyncStatusResponse,
  PhotosResponse,
} from "@/types/photos";

// SWR polling interval depending sync status
function getPhotoRefreshInterval(status: PhotoSyncStatus): number {
  if (status === "IN_PROGRESS") return 5000; // 5s when sync is in progress
  // TODO: we could use the photoSyncResumeAt field to calculate a more precise interval until next retry
  if (status === "PAUSED") return 30000; // 30s when sync is paused (waiting for Strava rate limit reset)
  return 0; // No polling when not started, completed or on error
}

// ex. isoDate = "2024-06-30T12:34:56Z"
function minutesUntil(isoDate: string): number {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(1, Math.ceil(diffMs / 60000));
}

export default function Gallery() {
  // 1. Read initial sync status from DB on page load
  const { data: statusData } = useSWR<PhotoSyncStatusResponse>(
    "/activities/photos/sync/status",
    fetcher,
    { revalidateOnFocus: false }, // We will handle revalidation manually with the interval
  );

  const initialStatus = statusData?.data.photoSyncStatus;

  // 2. SSE hook reveive real-time updates
  const { syncState, startSync, isConnected } = usePhotoSync(initialStatus);

  const { status, processed, total, resumeAt } = syncState;
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

  // 3. Photos already in DB - conditional polling depending on sync status
  // TODO: find a way to avoid refetching all photos at each interval when sync is in progress
  const { data: photosData, isLoading: photosLoading } = useSWR<PhotosResponse>(
    status !== "NOT_STARTED" ? "/activities/photos" : null,
    fetcher,
    {
      refreshInterval: getPhotoRefreshInterval(status),
    },
  );

  const photos = photosData?.data?.photos ?? [];
  const totalPhotos = photosData?.data?.total ?? 0;

  if (!statusData) {
    // TODO: implement a better loading state
    return (
      <div className="flex flex-col items-center gap-7">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <TypographyH2>Ma galerie de photos</TypographyH2>
        <TypographySubtitle>
          Retrouvez ici toutes les photos de vos activités synchronisées depuis
          Strava.
        </TypographySubtitle>
      </div>

      {status === "NOT_STARTED" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-sm">
            Aucune photo synchronisée pour le moment.
          </p>
          <Button onClick={startSync}>Charger mes photos</Button>
        </div>
      )}

      {(status === "IN_PROGRESS" || status === "PAUSED") && (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {status === "IN_PROGRESS" && isConnected && (
                <Spinner className="size-4" />
              )}
              {status === "IN_PROGRESS"
                ? `Récupération des photos… ${processed}/${total} activités`
                : resumeAt
                  ? `Limite Strava atteinte — reprise dans ${minutesUntil(resumeAt)} min`
                  : "Sync en pause"}
            </span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
          {totalPhotos > 0 && (
            <p className="text-muted-foreground text-xs">
              {totalPhotos} photo{totalPhotos > 1 ? "s" : ""} déjà disponible
              {totalPhotos > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {status === "ERROR" && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive p-4">
          <p className="text-destructive text-sm">
            Une erreur est survenue pendant la récupération des photos.
          </p>
          <Button variant="outline" onClick={startSync}>
            Réessayer
          </Button>
        </div>
      )}

      {status === "COMPLETED" && totalPhotos > 0 && (
        <p className="text-muted-foreground text-center text-sm">
          {totalPhotos} photo{totalPhotos > 1 ? "s" : ""} au total
        </p>
      )}

      <PhotoGrid isLoading={photosLoading} photos={photos} />
    </div>
  );
}
