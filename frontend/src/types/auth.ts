export interface User {
  id: string;
  email: string;
  stravaAthleteId: string | null;
  username: string | null;
  lastName: string | null;
  firstName: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: string | null;
  weight: number | null;
  profileMedium: string | null;
  profile: string | null;
  friend: number | null;
  follower: number | null;
  badgeTypeId: number | null;
  premium: boolean | null;
  summit: boolean | null;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
}

export interface CurrentUserResponse {
  success: boolean;
  user: User;
}

export interface AuthCallbackResponse {
  success: boolean;
  trailFramesUserId: string;
  message: string;
}
