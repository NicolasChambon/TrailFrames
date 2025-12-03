import LogoButton from "@/components/LogoButton";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographySubtitle } from "@/components/ui/typographySubtitle";

export default function Login() {
  return (
    <>
      <LogoButton />
      <main className="min-h-screen flex flex-col justify-center items-center gap-7">
        <TypographyH1>Se connecter à TrailFrames</TypographyH1>

        <TypographySubtitle>
          Connectez-vous pour accéder à vos photos Strava et revivre vos
          aventures
        </TypographySubtitle>
      </main>
    </>
  );
}
