import axios from "axios";
import dotenv from "dotenv";
import { BadRequestError } from "@/lib/errors";
import { StravaTokenResponse, SummaryActivity } from "@/types/strava";

dotenv.config({ path: ".env.development.local" });

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

  async getActivities({
    accessToken,
    page = 1,
    perPage = 200,
  }: {
    accessToken: string;
    page?: number;
    perPage?: number;
  }): Promise<SummaryActivity[]> {
    const response = await axios.get(`${this.apiUrl}/athlete/activities`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        page,
        per_page: perPage,
      },
    });

    return response.data;
  }
}
