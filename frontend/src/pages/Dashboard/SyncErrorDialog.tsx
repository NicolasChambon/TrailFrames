import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SyncErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
  error: string;
}

export function SyncErrorDialog({
  open,
  onClose,
  onRetry,
  error,
}: SyncErrorDialogProps) {
  // Determine error type and appropriate message
  const getErrorDetails = () => {
    const errorLower = error.toLowerCase();

    if (errorLower.includes("réseau") || errorLower.includes("connexion")) {
      return {
        title: "Problème de connexion",
        description:
          "Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.",
        canRetry: true,
      };
    }

    if (errorLower.includes("token") || errorLower.includes("strava")) {
      return {
        title: "Erreur d'authentification Strava",
        description:
          "Votre connexion à Strava a expiré ou est invalide. Veuillez vous reconnecter à Strava.",
        canRetry: false,
      };
    }

    if (
      errorLower.includes("déjà synchronisé") ||
      errorLower.includes("already")
    ) {
      return {
        title: "Synchronisation déjà effectuée",
        description:
          "Vos activités ont déjà été synchronisées. La première synchronisation ne peut être effectuée qu'une seule fois.",
        canRetry: false,
      };
    }

    // Generic error fallback
    return {
      title: "Erreur de synchronisation",
      description: error,
      canRetry: true,
    };
  };

  const errorDetails = getErrorDetails();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-950/30 p-2 rounded-full">
              <AlertCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle>{errorDetails.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            {errorDetails.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {errorDetails.canRetry && onRetry && (
            <Button onClick={onRetry}>Réessayer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
