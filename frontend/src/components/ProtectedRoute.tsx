import { useEffect, useRef, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { showErrorToast } from "@/lib/toast-helpers";
import { useAuthStore } from "@/stores/authStore";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Spinner } from "./ui/spinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isLoading = useAuthStore((state) => state.isLoading);

  const hasShownToast = useRef(false); // Because hasShownToast should not trigger re-render

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownToast.current) {
      showErrorToast("Vous devez être connecté pour accéder à cette page.");
      hasShownToast.current = true;
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Chargement...</EmptyTitle>
            <EmptyDescription>
              Veuillez patienter pendant que nous vérifions votre
              authentification.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}
