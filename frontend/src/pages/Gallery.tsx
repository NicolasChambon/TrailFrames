import { TypographyH2 } from "@/components/ui/typographyH2";
import { TypographySubtitle } from "@/components/ui/typographySubtitle";

export default function Gallery() {
  return (
    <div className="flex flex-col items-center gap-7">
      <TypographyH2 className="px-4">Ma galerie de photos</TypographyH2>
      <TypographySubtitle className="px-4 text-center">
        Retrouvez ici toutes les photos de vos activités synchronisées depuis
        Strava.
      </TypographySubtitle>
    </div>
  );
}
