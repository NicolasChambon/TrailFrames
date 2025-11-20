import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackTitle,
} from "@/components/ui/shadcn-io/dialog-stack";

export function ApiAppStep() {
  return (
    <>
      <DialogStackHeader className="mb-4">
        <DialogStackTitle>Application API</DialogStackTitle>
      </DialogStackHeader>

      <DialogStackDescription className="mb-4">
        Pour autoriser l&apos;accès à vos photos, Strava demande de créer une
        petite 'Application API'. Cela prend 1 minute et c&apos;est gratuit.
      </DialogStackDescription>

      <DialogStackDescription className="mb-4">
        Si vous n&apos;avez pas encore créé d&apos;Application API, cliquez sur
        le bouton ci-dessous pour être redirigé vers la page de création
        d&apos;application Strava (sinon cliquez sur le bouton en bas "J'ai déjà
        créé une Application API").
      </DialogStackDescription>

      <DialogStackDescription className="mb-4">
        Vous pourrez ensuite remplir les champs comme suit :
        <ul className="list-disc pl-6 mt-2">
          <li>Nom de l&apos;application : My Pictures</li>
          <li>Catégorie : Outil d'importation de données</li>
          <li>Club : [None]</li>
          {/* TODO: update URL */}
          <li>Site web : https://TrailFrames.vercel.app/</li>
          <li>
            Description de l'application : Application pour visualiser mes
            photos Strava.
          </li>
          {/* TODO: update URL */}
          <li>
            Domaine du rappel pour l'autorisation : TrailFrames.vercel.app/
          </li>
        </ul>
      </DialogStackDescription>

      <DialogStackDescription className="mb-4 text-center">
        <a
          href="https://www.strava.com/settings/api"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Button variant="outline">Créer mon Application API</Button>
        </a>
      </DialogStackDescription>

      <DialogStackFooter className="mt-6">
        <DialogStackNext>
          <Button>
            J&apos;ai déjà créé une Application API
            <ArrowRight />
          </Button>
        </DialogStackNext>
      </DialogStackFooter>
    </>
  );
}
