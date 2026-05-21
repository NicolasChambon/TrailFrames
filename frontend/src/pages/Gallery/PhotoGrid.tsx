import { cn } from "@/lib/utils";
import type { Photo } from "@/types/photos";

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
}

const SKELETON_COUNT = 12;

export function PhotoGrid({ photos, isLoading = false }: PhotoGridProps) {
  if (isLoading && photos.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            className="aspect-square animate-pulse rounded-lg bg-muted"
            key={i}
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {photos.map((photo) => (
        <div
          className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          key={photo.stravaUniqueId}
        >
          <img
            alt={photo.caption ?? photo.activity.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            src={photo.url}
          />
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-end",
              "bg-gradient-to-t from-black/60 to-transparent",
              "p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            )}
          >
            <p className="truncate text-xs font-medium text-white">
              {photo.activity.name}
            </p>
            {photo.caption && (
              <p className="truncate text-xs text-white/80">{photo.caption}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
