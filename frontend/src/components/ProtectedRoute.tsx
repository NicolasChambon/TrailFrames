import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Toast } from "./Toast";
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
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast(
        <Toast
          message="Vous devez être connecté pour accéder à cette page."
          type="error"
        />
      );
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
