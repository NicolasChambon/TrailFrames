import { useState } from "react";
import { Link } from "react-router-dom";
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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isEmailValid = z.email().safeParse(email).success;

  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  const isPasswordStrong =
    hasMinLength && hasLowercase && hasUppercase && hasDigit && hasSpecialChar;

  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to register the user would go here
  };

  return (
    <>
      <LogoButton />
      <main className="min-h-screen flex flex-col justify-center items-center gap-7">
        <Card className="w-full max-w-md">
          <CardHeader>
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
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                    <span className="block">
                      <span className={hasMinLength ? "text-green-600" : ""}>
                        {hasMinLength ? "✓" : "○"}
                      </span>{" "}
                      8 caractères minimum
                    </span>

                    <span className="block">
                      <span className={hasLowercase ? "text-green-600" : ""}>
                        {hasLowercase ? "✓" : "○"}
                      </span>{" "}
                      Une lettre minuscule
                    </span>

                    <span className="block">
                      <span className={hasUppercase ? "text-green-600" : ""}>
                        {hasUppercase ? "✓" : "○"}
                      </span>{" "}
                      Une lettre majuscule
                    </span>

                    <span className="block">
                      <span className={hasDigit ? "text-green-600" : ""}>
                        {hasDigit ? "✓" : "○"}
                      </span>{" "}
                      Un chiffre
                    </span>

                    <span className="block">
                      <span className={hasSpecialChar ? "text-green-600" : ""}>
                        {hasSpecialChar ? "✓" : "○"}
                      </span>{" "}
                      Un caractère spécial (@$!%*?&)
                    </span>
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel
                    className={isPasswordStrong ? "" : "text-gray-400"}
                    htmlFor="confirm-password"
                  >
                    Confirmer le mot de passe
                  </FieldLabel>

                  <Input
                    required
                    disabled={!isPasswordStrong}
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <FieldDescription className="text-xs">
                    {passwordsMatch ? (
                      <span>
                        <span className="text-green-600">✓</span> Les mots de
                        passe correspondent
                      </span>
                    ) : (
                      <span className={isPasswordStrong ? "" : "text-gray-400"}>
                        ○ Les mots de passe ne correspondent pas
                      </span>
                    )}
                  </FieldDescription>
                </Field>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              className="w-full"
              disabled={!(isEmailValid && isPasswordStrong && passwordsMatch)}
              type="submit"
            >
              S'inscrire
            </Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
