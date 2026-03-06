import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { HEADER_HEIGHT } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TypographyH2 } from "@/components/ui/typographyH2";
import { TypographyP } from "@/components/ui/typographyP";
import { TypographySubtitle } from "@/components/ui/typographySubtitle";
import { useActivitiesSync } from "@/hooks/useActivitiesSync";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

export default function Dashboard() {
  const { isSyncing, progress, startSync } = useActivitiesSync();
  const { user, checkAuth } = useAuthStore();

  const [showSyncOverlay, setShowSyncOverlay] = useState(false);

  const syncStarted = useRef(false);

  // Automatically start sync if user has never synced before (lastSyncedAt is null)
  useEffect(() => {
    if (user?.lastSyncedAt === null && !syncStarted.current) {
      syncStarted.current = true;
      setShowSyncOverlay(true);
      startSync();
    }
  }, [user, startSync]);

  // After sync is completed, show the success message for a few seconds
  // before hiding the overlay
  useEffect(() => {
    if (!showSyncOverlay || isSyncing) return;
    const hasCompleted = progress.some(
      (progressItem) => progressItem.type === "success",
    );
    if (!hasCompleted) return;

    const timer = setTimeout(async () => {
      await checkAuth();
      setShowSyncOverlay(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSyncing, progress, checkAuth, showSyncOverlay]);

  // Display in reverse order: the most recent message at the top
  const reversedProgress = [...progress].reverse();

  const syncCompleted =
    !isSyncing &&
    progress.some((progressItem) => progressItem.type === "success");

  if (showSyncOverlay) {
    return (
      <div
        className="max-w-2xl px-4"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <div className="mt-15 flex flex-col gap-2">
          {/* Icon */}
          <div className="flex justify-center">
            {syncCompleted ? (
              <CheckCircle2 className="h-12 w-1 transition-all duration-500" />
            ) : (
              <Loader2 className="h-12 w-12 animate-spin" />
            )}
          </div>

          {/* Title & Description */}
          <div className="text-center flex flex-col gap-2">
            <TypographyH2>
              {syncCompleted
                ? "Synchronisation terminée"
                : "Synchronisation initiale"}
            </TypographyH2>
            <TypographySubtitle className="text-sm">
              Aucune activité n&apos;a encore été synchronisée avec TrailFrames.
              Nous récupérons automatiquement vos activités Strava.
            </TypographySubtitle>
          </div>
        </div>

        {/* Messages which accumulate below */}
        {reversedProgress.length > 0 && (
          <div className="mt-10">
            {reversedProgress.map((item, displayIndex) => {
              const itemKey =
                item.key ?? String(progress.length - 1 - displayIndex);
              const isCurrent = displayIndex === 0;
              return (
                <TypographyP
                  className={cn(
                    "text-sm px-3 py-2 rounded-lg flex items-center justify-between",
                    isCurrent
                      ? "text-gray-900 font-medium bg-gray-100"
                      : "text-gray-400 bg-transparent",
                  )}
                  key={`${itemKey}-${displayIndex}`}
                >
                  {item.message}
                  {isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </TypographyP>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 flex flex-col items-center text-center">
      <TypographyH2>Bienvenue sur votre tableau de bord</TypographyH2>
      <TypographySubtitle className="text-sm">
        Retrouvez ici toutes les fonctionnalités de TrailFrames.
      </TypographySubtitle>

      <Link className="mt-4" to="/gallery">
        <Button variant="default">Voir ma galerie de photos</Button>
      </Link>
    </div>
  );
}
