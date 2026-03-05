import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypographyH1 } from "@/components/ui/typographyH1";
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
    const hasCompleted = progress.some((p) => p.type === "success");
    if (!hasCompleted) return;

    const timer = setTimeout(async () => {
      await checkAuth();
      setShowSyncOverlay(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSyncing, progress, showSyncOverlay, checkAuth]);

  // Display in reverse order: the most recent message at the top
  const reversedProgress = [...progress].reverse();
  const syncCompleted =
    !isSyncing && progress.some((p) => p.type === "success");

  if (showSyncOverlay) {
    return (
      <div className="flex flex-col items-center px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center space-y-6 mb-10">
            {/* Icon */}
            <div className="flex justify-center">
              {syncCompleted ? (
                <CheckCircle2 className="h-12 w-12 text-gray-900 transition-all duration-500" />
              ) : (
                <Loader2 className="h-12 w-12 animate-spin text-gray-700" />
              )}
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {syncCompleted
                  ? "Synchronisation terminée"
                  : "Synchronisation initiale"}
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Aucune activité n&apos;a encore été synchronisée avec
                TrailFrames.
                <br />
                Nous récupérons automatiquement vos activités Strava.
              </p>
            </div>
          </div>

          {/* Messages which accumulate below */}
          {reversedProgress.length > 0 && (
            <div className="space-y-1.5">
              {reversedProgress.map((item, displayIndex) => {
                const itemKey =
                  item.key ?? String(progress.length - 1 - displayIndex);
                const isCurrent = displayIndex === 0;
                return (
                  <div
                    className={cn(
                      "animate-slide-down-in text-sm px-3 py-2 rounded-lg transition-colors duration-500",
                      isCurrent
                        ? "text-gray-900 font-medium bg-gray-50"
                        : "text-gray-400 bg-transparent",
                    )}
                    key={itemKey}
                  >
                    {item.message}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TypographyH1 className="text-3xl font-bold mb-2">
          Tableau de bord
        </TypographyH1>
      </div>
    </div>
  );
}
