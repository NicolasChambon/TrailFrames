import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useCountdown } from "@/hooks/useCountdown";
import { fetcher } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { AuthCallbackResponse } from "@/types/auth";

const REDIRECT_TIMEOUT = 5;
const SUCCESS_REDIRECT_TIMEOUT = 2;

export default function Callback() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

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
    },
  );

  const hasError = Boolean(errorParam || !code || error);

  const errorSecondsLeft = useCountdown(
    REDIRECT_TIMEOUT,
    () => navigate("/strava-sync"),
    hasError,
  );

  const successSecondsLeft = useCountdown(
    SUCCESS_REDIRECT_TIMEOUT,
    () => navigate("/dashboard"),
    showSuccess,
  );

  useEffect(() => {
    if (data?.success && data.user) {
      setUser(data.user);
      setShowSuccess(true);
    }
  }, [data, setUser]);

  if (showSuccess) {
    return (
      <CallbackSuccessState secondsLeft={successSecondsLeft}>
        Connexion réussie !
      </CallbackSuccessState>
    );
  }

  if (errorParam) {
    return (
      <CallbackErrorState secondsLeft={errorSecondsLeft}>
        Autorisation refusée.
      </CallbackErrorState>
    );
  }
  if (!code) {
    return (
      <CallbackErrorState secondsLeft={errorSecondsLeft}>
        Code d'autorisation manquant.
      </CallbackErrorState>
    );
  }
  if (error) {
    return (
      <CallbackErrorState secondsLeft={errorSecondsLeft}>
        Erreur lors de l'authentification.
      </CallbackErrorState>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>
            {isLoading ? "Connexion en cours..." : "Redirection..."}
          </EmptyTitle>
          <EmptyDescription>
            {isLoading
              ? "Veuillez patienter pendant que nous vous connectons à votre compte Strava."
              : "Vous allez être redirigé vers la page d'accueil."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

function CallbackErrorState({
  children,
  secondsLeft,
}: {
  children: React.ReactNode;
  secondsLeft: number;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{children}</EmptyTitle>
        <EmptyDescription>
          Vous serez automatiquement redirigé dans{" "}
          <span className="text-foreground">
            {secondsLeft} {secondsLeft === 1 ? "seconde" : "secondes"}
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function CallbackSuccessState({
  children,
  secondsLeft,
}: {
  children: React.ReactNode;
  secondsLeft: number;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircle2Icon />
        </EmptyMedia>
        <EmptyTitle>{children}</EmptyTitle>
        <EmptyDescription>
          Vous allez être redirigé vers votre tableau de bord dans{" "}
          <span className="text-foreground">
            {secondsLeft} {secondsLeft === 1 ? "seconde" : "secondes"}
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
