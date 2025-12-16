import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoButton from "@/components/LogoButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TypographyP } from "@/components/ui/typographyP";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useMutation } from "@/lib/useMutation";
import type { LoginResponse } from "@/types/auth";

export default function Login() {
  const { login: setAuthUser } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    mutate: loginUser,
    isLoading,
    error,
    data,
  } = useMutation<LoginResponse>(() =>
    api.post("/auth/login", { email, password })
  );

  useEffect(() => {
    if (data && !error) {
      setAuthUser(data.user);
      const timer = setTimeout(() => {
        if (data.user.stravaAthleteId) {
          navigate("/dashboard");
        } else {
          navigate("/strava-sync");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, error, navigate, setAuthUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginUser();
  };

  return (
    <>
      <LogoButton />
      <main className="min-h-screen flex flex-col justify-center items-center gap-7">
        <Card className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="mb-4">
              <CardTitle>Se connecter à TrailFrames</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à vos photos Strava et revivre vos
                aventures
              </CardDescription>
              <CardAction>
                <Link to="/register">
                  <Button type="button" variant="link">
                    S'inscrire
                  </Button>
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="mb-4">
              <div className="flex flex-col gap-6">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <Input
                    required
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>

                  <Input
                    required
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full mb-2"
                disabled={isLoading || !!data}
                type="submit"
              >
                {isLoading && (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Connexion...
                  </>
                )}
                {!isLoading && !data && "Se connecter"}
                {data && !error && "Connecté !"}
              </Button>
              {error && (
                <TypographyP className="text-red-500 text-sm">
                  {error}
                </TypographyP>
              )}
            </CardFooter>
          </form>
        </Card>
      </main>
    </>
  );
}
