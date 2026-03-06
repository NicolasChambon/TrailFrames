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
import { fetcher } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { AuthCallbackResponse } from "@/types/auth";

export default function Callback() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  // Early validation: redirect immediately if error param or missing code
  useEffect(() => {
    if (errorParam) {
      navigate("/strava-sync?toast=callback-error-param", { replace: true });
      return;
    }
    if (!code) {
      navigate("/strava-sync?toast=callback-missing-code", { replace: true });
      return;
    }
  }, [errorParam, code, navigate]);

  // Fetch Strava token and athlete info using the provided code
  const { data, error } = useSWR<AuthCallbackResponse, Error>(
    code && !errorParam ? `/auth/strava/callback?code=${code}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Handle API response
  useEffect(() => {
    if (data?.success && data.user) {
      setUser(data.user);
      navigate("/dashboard?toast=callback-success", { replace: true });
    } else if (error) {
      navigate("/strava-sync?toast=callback-error", { replace: true });
    }
  }, [data, error, navigate, setUser]);

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Connexion en cours...</EmptyTitle>
          <EmptyDescription>
            Veuillez patienter pendant que nous vous connectons à votre compte
            Strava.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
