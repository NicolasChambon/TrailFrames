const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL;
const STRAVA_URL = import.meta.env.VITE_STRAVA_URL;
const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const SCOPES = "activity:read_all,profile:read_all";

export function generateStravaAuthUrl(): string {
  const redirectUri = encodeURIComponent(`${WEB_APP_URL}/callback`);
  return `${STRAVA_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${SCOPES}`;
}
