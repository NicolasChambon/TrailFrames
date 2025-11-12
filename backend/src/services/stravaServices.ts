import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
  };
}

export class StravaService {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;

  constructor() {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const apiUrl = process.env.STRAVA_API_URL;

    if (!clientId || !clientSecret) {
      throw new Error(
        "Missing required environment variables: STRAVA_CLIENT_ID or/and STRAVA_CLIENT_SECRET"
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiUrl = apiUrl || "https://www.strava.com";
  }

  async exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
    const response = await axios.post(`${this.apiUrl}/oauth/token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: "authorization_code",
    });

    return response.data;
  }
}
