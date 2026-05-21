export interface User {
  id: string;
  email: string;
  stravaAthleteId: string | null;
  lastSyncedAt: string | null;
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

// Answer of POST /auth/login
export interface LoginResponse {
  success: boolean;
  user: User;
}

// Answer of POST /auth/register
export interface RegisterResponse {
  success: boolean;
  user: User;
}

// Answer of GET /auth/current-user
export interface CurrentUserResponse {
  success: boolean;
  user: User;
}

// Answer of GET /auth/strava/callback?code=AUTH_CODE
export interface AuthCallbackResponse {
  success: boolean;
  user: User;
  message: string;
}

// Anwer of POST /auth/logout
export interface LogoutResponse {
  success: boolean;
  message: string;
}
