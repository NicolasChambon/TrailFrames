import { CircleCheckIcon, LoaderIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TypographyP } from "@/components/ui/typographyP";

// TODO: globalize this interface which is currently duplicated in useActivitySync.tsx
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

interface SyncProgressProps {
  progress: SyncProgress;
  onCancel?: () => void;
  onRetry?: () => void;
  showCancel?: boolean;
}

export function SyncProgress({
  progress,
  onCancel,
  onRetry,
  showCancel = true,
}: SyncProgressProps) {
  // Compute progression approximate percentage
  const getProgressPercentage = (): number => {
    if (progress.status === "completed") return 100;
    if (progress.status === "connecting") return 5;

    // TODO: we can know the total number of activities to sync thanks
    // to the Get route api strava /athlete/{id}/stats
    // Estimation based on pages (200 activities per page)
    if (progress.currentPage) {
      const estimatedTotalPages = Math.ceil(
        (progress.totalActivities || 400) / 200,
      );
      return Math.min(90, (progress.currentPage / estimatedTotalPages) * 100);
    }

    // Saving phase
    if (progress.newActivities !== undefined) {
      return 95;
    }

    return 10; // Default to 10% when syncing starts
  };

  const progressPercentage = getProgressPercentage();

  // Icon and color based on status
  const getStatusIcon = () => {
    switch (progress.status) {
      case "connecting":
      case "syncing":
        return <LoaderIcon className="w-5 h-5 animate-spin text-blue-500" />;
      case "completed":
        return <CircleCheckIcon className="w-5 h-5 text-green-500" />;
      case "error":
        return <RefreshCcwIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <CardTitle>
              {progress.status === "connecting" && "Connection..."}
              {progress.status === "syncing" && "Synchronisation en cours"}
              {progress.status === "completed" && "Synchronisation terminée"}
              {progress.status === "error" && "Erreur de synchronisation"}
            </CardTitle>
            <CardDescription className="mt-1">
              {progress.message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progression bar */}
        {progress.status !== "error" && (
          <div className="space-y-2">
            <Progress className="h-2" value={progressPercentage} />
            <TypographyP className="text-sm text-muted-foreground text-right">
              {Math.round(progressPercentage)}%
            </TypographyP>
          </div>
        )}

        {/* Real time stats */}
        {progress.status === "syncing" && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            {progress.currentPage && (
              <div className="space-y-1">
                <TypographyP className="text-sm text-muted-foreground">
                  Page actuelle
                </TypographyP>
                <TypographyP className="text-2xl font-bold">
                  {progress.currentPage}
                </TypographyP>
              </div>
            )}
            {progress.totalActivities !== undefined && (
              <div className="space-y-1">
                <TypographyP className="text-sm text-muted-foreground">
                  Activités trouvées
                </TypographyP>
                <TypographyP className="text-2xl font-bold">
                  {progress.totalActivities}
                </TypographyP>
              </div>
            )}
          </div>
        )}

        {/* Final stats */}
        {progress.status === "completed" &&
          progress.totalSynced !== undefined && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <TypographyP className="text-green-800 dark:text-green-200 font-medium text-center">
                ✨ {progress.totalSynced} activité
                {progress.totalSynced > 1 ? "s" : ""} synchronisée
                {progress.totalSynced > 1 ? "s" : ""} avec succès !
              </TypographyP>
              {progress.syncedAt && (
                <TypographyP className="text-green-700 dark:text-green-300 text-sm text-center mt-2">
                  {new Date(progress.syncedAt).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TypographyP>
              )}
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          {progress.status === "syncing" && showCancel && onCancel && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          {progress.status === "error" && onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCcwIcon className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
