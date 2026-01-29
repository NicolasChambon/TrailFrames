import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { showErrorToast } from "@/lib/toast-helpers";

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
    }

    searchParams.delete("toast");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);
}
