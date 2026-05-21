export type PhotoSyncStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "ERROR";

// Anwer of GET /activities/photos/sync/status
export interface PhotoSyncStatusResponse {
  success: true;
  data: {
    photoSyncStatus: PhotoSyncStatus;
    photoSyncTotal: number;
    photoSyncResumedAt: string | null;
  };
}

export interface Photo {
  id: number;
  stravaUniqueId: string;
  url: string;
  caption: string | null;
  stravaCreatedAt: string;
  activity: {
    name: string;
    startDate: string;
    sportType: string;
  };
}

// Answer of GET /activities/photos
export interface PhotosResponse {
  success: true;
  data: {
    photos: Photo[];
    total: number;
    page: number;
    totalPages: number;
  };
}
