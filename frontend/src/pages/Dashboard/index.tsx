// import { Calendar, RefreshCwIcon } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { TypographyH1 } from "@/components/ui/typographyH1";
// import { TypographyP } from "@/components/ui/typographyP";
// import { useActivitySync } from "@/hooks/useActivitySync";
// import { useAuthStore } from "@/stores/authStore";
// import { SyncErrorDialog } from "./SyncErrorDialog";
// import { SyncProgress } from "./SyncProgress";

export default function Dashboard() {
  // const navigate = useNavigate();
  // const user = useAuthStore((state) => state.user);

  // const {
  //   isConnecting,
  //   isSyncing,
  //   progress,
  //   error,
  //   startSync,
  //   cancelSync,
  //   clearError,
  // } = useActivitySync();

  // const [showErrorDialog, setShowErrorDialog] = useState(false);

  // // Redirect if user isn't already connected to Strava
  // useEffect(() => {
  //   if (user && !user.stravaAthleteId) {
  //     navigate("/strava-sync", { replace: true });
  //   }
  // }, [user, navigate]);

  // // Auto-start sync for new users (who have a user record but haven't synced yet)
  // useEffect(() => {
  //   if (user && user.stravaAthleteId && !user.lastSyncedAt) {
  //     startSync();
  //   }
  // }, [user, startSync]);

  // useEffect(() => {
  //   if (error) {
  //     setShowErrorDialog(true);
  //   }
  // }, [error]);

  // const handleCloseError = () => {
  //   setShowErrorDialog(false);
  //   clearError();
  // };

  // const handleRetry = () => {
  //   setShowErrorDialog(false);
  //   clearError();
  //   startSync();
  // };

  // const isSyncInProgress = isConnecting || isSyncing;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <TypographyH1 className="text-3xl font-bold mb-2">
        Tableau de bord
      </TypographyH1>

      {/* <div className="mb-8 text-center">
        <TypographyH1 className="text-3xl font-bold mb-2">
          Vos Activités Strava
        </TypographyH1>
        <TypographyP className="text-muted-foreground">
          Gérez et visualisez vos activités sportives
        </TypographyP>
      </div>

      <div className="space-y-6">
        {(isSyncInProgress || progress) && (
          <SyncProgress
            progress={progress!}
            showCancel={isSyncing}
            onCancel={isSyncing ? cancelSync : undefined}
            onRetry={progress?.status === "error" ? startSync : undefined}
          />
        )} */}

      {/* {!user?.lastSyncedAt && !isSyncInProgress && !progress && (
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue sur TrailFrames !</CardTitle>
              <CardDescription>
                Nous allons synchroniser vos activités Strava pour la première
                fois.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TypographyP className="text-sm text-muted-foreground mb-4">
                Cette opération peut prendre quelques minutes selon le nombre
                d'activités à récupérer.
              </TypographyP>
              <Button disabled={isSyncInProgress} onClick={startSync}>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Démarrer la synchronisation
              </Button>
            </CardContent>
          </Card>
        )} */}

      {/* État: Déjà synchronisé (afficher date + bouton re-sync) */}
      {/* {user?.lastSyncedAt &&
          !isSyncInProgress &&
          progress?.status !== "completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Synchronisation</CardTitle>
                <CardDescription>
                  Dernière synchronisation effectuée
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(user.lastSyncedAt).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <TypographyP className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Pour le moment, seule la synchronisation initiale est
                    disponible. Les synchronisations incrémentales arriveront
                    bientôt !
                  </TypographyP>
                </div> */}

      {/* Bouton pour re-sync manuelle (si besoin de debug ou futur incremental sync) */}
      {/* <Button onClick={startSync} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-synchroniser
              </Button>
              </CardContent>
            </Card>
          )} */}

      {/* TODO: Afficher la liste des activités */}
      {/* {user?.lastSyncedAt && progress?.status === "completed" && (
          <Card>
            <CardHeader>
              <CardTitle>Vos activités</CardTitle>
              <CardDescription>
                Liste de vos activités (à venir)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TypographyP className="text-muted-foreground text-sm">
                L'affichage des activités sera implémenté prochainement.
              </TypographyP>
            </CardContent>
          </Card>
        )}
      </div> */}

      {/* Dialog d'erreur */}
      {/* <SyncErrorDialog
        error={error || ""}
        open={showErrorDialog}
        onClose={handleCloseError}
        onRetry={handleRetry}
      /> */}
    </div>
  );
}
