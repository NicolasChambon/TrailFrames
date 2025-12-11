import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TypographyP } from "@/components/ui/typographyP";
import api from "@/lib/api";
import { useMutation } from "@/lib/useMutation";
import {
  getPasswordValidation,
  isPasswordStrong,
} from "@/pages/Register/passwordValidation";
import { ValidationMessage } from "@/pages/Register/ValidationMessage";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isEmailValid = z.email().safeParse(email).success;
  const passwordValidation = getPasswordValidation(password);
  const passwordStrong = isPasswordStrong(password);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const {
    mutate: registerUser,
    isLoading,
    error,
    data,
  } = useMutation(() => api.post("/auth/register", { email, password }));

  useEffect(() => {
    if (data && !error) {
      const timer = setTimeout(() => {
        navigate("/strava-sync");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, error, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerUser();
  };

  return (
    <>
      <LogoButton />
      <main className="min-h-screen flex flex-col justify-center items-center gap-7">
        <Card className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="mb-4">
              <CardTitle>S'inscrire gratuitement</CardTitle>
              <CardDescription>
                Rejoignez TrailFrames en quelques clics et commencez à explorer
                vos photos Strava.
              </CardDescription>
              <CardAction>
                <Link to="/login">
                  <Button variant="link">Connexion </Button>
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
                    placeholder="john.doe@example.com"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value.trim().toLowerCase())
                    }
                  />

                  <FieldDescription className="text-xs">
                    {isEmailValid ? (
                      <span>
                        <span className="text-green-600">✓</span> Adresse mail
                        valide
                      </span>
                    ) : (
                      <span>○ Adresse mail invalide</span>
                    )}
                  </FieldDescription>
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

                  <FieldDescription className="text-xs">
                    {passwordValidation.map((criteria) => (
                      <ValidationMessage
                        isValid={criteria.isValid}
                        key={criteria.key}
                      >
                        {criteria.label}
                      </ValidationMessage>
                    ))}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel
                    className={passwordStrong ? "" : "text-gray-400"}
                    htmlFor="confirm-password"
                  >
                    Confirmer le mot de passe
                  </FieldLabel>

                  <Input
                    required
                    disabled={!passwordStrong}
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <FieldDescription className="text-xs">
                    <ValidationMessage
                      disabledStyle={!passwordStrong}
                      isValid={passwordsMatch}
                    >
                      {passwordsMatch
                        ? "Les mots de passe correspondent"
                        : "Les mots de passe ne correspondent pas"}
                    </ValidationMessage>
                  </FieldDescription>
                </Field>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full mb-2"
                disabled={
                  !(isEmailValid && passwordStrong && passwordsMatch) ||
                  isLoading ||
                  !!data
                }
                type="submit"
              >
                {isLoading && (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Inscription en cours
                  </>
                )}
                {!isLoading && !data && "S'inscrire"}
                {data && !error && "Inscription réussie !"}
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
