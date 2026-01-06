import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TypographyH2 } from "@/components/ui/typographyH2";
import { TypographyP } from "@/components/ui/typographyP";
import { fetcher } from "@/lib/api";
import type { AuthCallbackResponse } from "@/types/auth";

export default function Callback() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  const { data, error, isLoading } = useSWR<AuthCallbackResponse, Error>(
    code && !errorParam ? `/auth/strava/callback?code=${code}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (errorParam || !code || error) {
      setTimeout(() => navigate("/strava-sync"), 3000);
      return;
    }

    if (data?.success) {
      localStorage.setItem("trailFramesUserId", data.trailFramesUserId);
      navigate("/dashboard");
    }
  }, [data, error, code, errorParam, navigate]);

  if (errorParam) {
    return <ErrorState>Authorisation refusée.</ErrorState>;
  }
  if (!code) {
    return <ErrorState>Code d'autorisation manquant.</ErrorState>;
  }
  if (error) {
    return <ErrorState>Erreur lors de l'authentification.</ErrorState>;
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>
            {isLoading ? "Connection en cours..." : "Redirection..."}
          </EmptyTitle>
          <EmptyDescription>
            {isLoading
              ? "Veuillez patienter pendant que nous vous connectons à votre compte Strava."
              : "Vous allez être redirigé vers la page d'accueil."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  );
}

function ErrorState({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-4">
      <TypographyH2>{children}</TypographyH2>
      <TypographyP>Redirection vers la page d'accueil...</TypographyP>
    </main>
  );
}
