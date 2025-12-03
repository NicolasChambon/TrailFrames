import { LogInIcon, SquarePenIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographySubtitle } from "@/components/ui/typographySubtitle";

export default function Entry() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-7">
      <TypographyH1>Bienvenue sur TrailFrames</TypographyH1>

      <TypographySubtitle>
        Votre passerelle pour vous connecter à Strava et voir vos photos.
      </TypographySubtitle>

      <div className="flex gap-4">
        <Link to="/login">
          <Button variant="default">
            <LogInIcon />
            Se connecter
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="outline">
            <SquarePenIcon />
            S'inscrire
          </Button>
        </Link>
      </div>
    </main>
  );
}
