import { SportType } from "@/generated/prisma";

export interface MetaAthlete {
  id: number;
  resource_state: number;
}

export interface SummaryAthlete extends MetaAthlete {
  username: string;
  firstname: string;
  lastname: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  sex: "M" | "F" | "O" | null;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id: number;
  weight: number;
  profile_medium: string;
  profile: string;
  friend: number | null;
  follower: number | null;
}

export type PolylineMap = {
  id: string;
  polyline: string;
  summary_polyline: string;
};

export type LatLng = [number, number];

export type ActivityType =
  | "AlpineSki"
  | "BackcountrySki"
  | "Canoeing"
  | "Crossfit"
  | "EBikeRide"
  | "Elliptical"
  | "Golf"
  | "Handcycle"
  | "Hike"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "NordicSki"
  | "Ride"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Run"
  | "Sail"
  | "Skateboard"
  | "Snowboard"
  | "Snowshoe"
  | "Soccer"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "Swim"
  | "Velomobile"
  | "VirtualRide"
  | "VirtualRun"
  | "Walk"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

export type PhotosSummary = {
  count: number;
  primary: {
    id: number;
    source: number;
    unique_id: string;
    urls: {
      "100": string;
      "600": string;
    };
  };
};

export type StravaPhoto = {
  unique_id: string;
  athlete_id: number;
  activity_id: number;
  activity_name: string;
  post_id: number | null;
  ressource_state: number;
  caption: string;
  type: number;
  source: number;
  status: number;
  uploaded_at: string;
  created_at: string;
  created_at_local: string;
  urls: {
    [size: string]: string; // e.g., "2048": "https://..."
  };
  placeholder_image: string | null;
  sizes: {
    [size: string]: [number, number]; // e.g., "2048": [width, height]
  };
  default_photo: boolean;
  cursor: string | null;
  is_strava_strength: boolean;
  location: LatLng | null;
};

export type SummaryGear = {
  id: string;
  resource_state: 2 | 3; // 2 = summary, 3 = detailed
  primary: boolean;
  name: string;
  distance: number;
};
export type MetaActivity = {
  id: number;
};

export interface SummaryActivity extends MetaActivity {
  id: number;
  external_id: string;
  upload_id: number;
  athlete: MetaAthlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  elev_high: number;
  elev_low: number;
  sport_type: SportType;
  start_date: string;
  start_date_local: string;
  timezone: string;
  start_latlng: LatLng;
  end_latlng: LatLng;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: PolylineMap;
  device_name: string;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type: number;
  upload_id_str: string;
  average_speed: number;
  max_speed: number;
  has_kudoed: boolean;
  hide_from_home: boolean;
  gear_id: string;
  kilojoules: number;
  average_watts: number;
  device_watts: boolean;
  max_watts: number;
  weighted_average_watts: number;
}

export type Split = {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  pace_zone: number;
};

export type Lap = {
  id: number;
  activity: MetaActivity;
  athlete: MetaAthlete;
  average_cadence: number;
  average_speed: number;
  distance: number;
  elapsed_time: number;
  start_index: number;
  end_index: number;
  lap_index: number;
  max_speed: number;
  moving_time: number;
  name: string;
  pace_zone: number;
  split: number;
  start_date: string;
  start_date_local: string;
  total_elevation_gain: number;
};

export type SummaryPRSegmentEffort = {
  pr_activity_id: number;
  pr_elapsed_time: number;
  pr_date: string;
  effort_count: number;
};

export type SummarySegmentEffort = {
  id: number;
  activity_id: number;
  elapsed_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  is_kom: boolean;
};

export type SummarySegment = {
  id: number;
  name: string;
  activity_type: "Ride" | "Run";
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: LatLng;
  end_latlng: LatLng;
  climb_category: 0 | 1 | 2 | 3 | 4 | 5;
  city: string;
  state: string;
  country: string;
  private: boolean;
  athlete_pr_effort: SummaryPRSegmentEffort;
  athlete_segment_stats: SummarySegmentEffort;
};

export type DetailedSegmentEffort = {
  id: number;
  activity_id: number;
  elapsed_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  is_kom: boolean;
  name: string;
  activity: MetaActivity;
  athlete: MetaAthlete;
  moving_time: number;
  start_index: number;
  end_index: number;
  average_cadence: number;
  average_watts: number;
  device_watts: boolean;
  average_heartrate: number;
  max_heartrate: number;
  segment: SummarySegment;
  kom_rank: number | null;
  pr_rank: number | null;
  hidden: boolean;
};

export type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: SummaryAthlete;
};

export interface DetailedActivity extends SummaryActivity {
  type: ActivityType;
  description: string;
  photos: PhotosSummary;
  gear: SummaryGear;
  calories: number;
  segment_efforts: DetailedSegmentEffort[];
  embed_token: string;
  splits_metric: Split[];
  splits_standard: Split[];
  laps: Lap[];
  best_efforts: DetailedSegmentEffort[];
}
