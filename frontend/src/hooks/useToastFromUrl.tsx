import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "@/lib/toast-helpers";

/**
 * Hook to handle toast notifications from URL query parameters
 * Automatically shows toast and cleans up the URL
 */
export function useToastFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const toastParam = searchParams.get("toast");
    if (!toastParam) return;

    switch (toastParam) {
      case "session-expired":
        showErrorToast("Votre session a expiré. Veuillez vous reconnecter.");
        break;
      case "not-authenticated":
        showErrorToast("Vous devez être connecté pour accéder à cette page.");
        break;
      case "callback-success":
        showSuccessToast("Connexion réussie ! Bienvenue sur TrailFrames.");
        break;
      case "callback-error":
        showErrorToast(
          "Une erreur est survenue lors de la connexion à Strava. Veuillez réessayer.",
        );
        break;
      case "callback-error-param":
        showErrorToast(
          "L'autorisation a été refusée. Veuillez autoriser TrailFrames à accéder à votre compte Strava.",
        );
        break;
      case "callback-missing-code":
        showErrorToast(
          "Aucun code d'autorisation reçu. Veuillez réessayer la connexion à Strava.",
        );
        break;
      default:
        // Optionally handle unknown toast types or ignore
        break;
    }

    searchParams.delete("toast");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);
}
