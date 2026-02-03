import { LogInIcon, SquarePenIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographySubtitle } from "@/components/ui/typographySubtitle";
import { useAuthStore } from "@/stores/authStore";

export default function Entry() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      if (!user.stravaAthleteId) {
        navigate("/strava-sync", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center gap-7">
      <TypographyH1 className="px-4">Bienvenue sur TrailFrames</TypographyH1>

      <TypographySubtitle className="px-4 text-center">
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
    </div>
  );
}
