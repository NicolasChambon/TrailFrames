import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Spinner } from "./ui/spinner";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center gap-4">
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
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}
