import axios from "axios";
import "dotenv/config";
import { BadRequestError } from "@/lib/errors";
import { StravaTokenResponse, SummaryActivity } from "@/types/strava";

export class StravaService {
  private clientId: string;
  private clientSecret: string;
  private apiUrl: string;

  constructor() {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const apiUrl = process.env.STRAVA_API_URL;

    if (!clientId || !clientSecret) {
      throw new BadRequestError(
        "Missing required environment variables: STRAVA_CLIENT_ID or/and STRAVA_CLIENT_SECRET"
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiUrl = apiUrl || "https://www.strava.com/api/v3";
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

  async refreshAccessToken(
    stravaRefreshToken: string
  ): Promise<StravaTokenResponse> {
    const response = await axios.post(`${this.apiUrl}/oauth/token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: stravaRefreshToken,
      grant_type: "refresh_token",
    });

    return response.data;
  }

  async getActivities({
    stravaAccessToken,
    page = 1,
    perPage = 200,
  }: {
    stravaAccessToken: string;
    page?: number;
    perPage?: number;
  }): Promise<SummaryActivity[]> {
    const response = await axios.get(`${this.apiUrl}/athlete/activities`, {
      headers: {
        Authorization: `Bearer ${stravaAccessToken}`,
      },
      params: {
        page,
        per_page: perPage,
      },
    });

    return response.data;
  }
}
