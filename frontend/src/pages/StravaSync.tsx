import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { generateStravaAuthUrl } from "@/lib/stravaAuth";

export default function StravaSync() {
  const handleConnectStrava = () => {
    const authUrl = generateStravaAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-7">
      <TypographyH1>
        En quelques clics, connectez votre compte Strava et retrouvez toutes vos
        photos.
      </TypographyH1>

      <div className="flex gap-4">
        <Button onClick={handleConnectStrava}>
          Je connecte mon compte Strava
        </Button>
        <a
          href="https://www.strava.com/register"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Button variant="outline">Je crée un compte Strava</Button>
        </a>
      </div>
    </main>
  );
}
