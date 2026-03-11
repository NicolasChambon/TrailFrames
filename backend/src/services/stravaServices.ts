import axios from "axios";
import "dotenv/config";
import { decrypt } from "@/lib/encryption";
import { BadRequestError, RateLimitError } from "@/lib/errors";
import {
  StravaPhoto,
  StravaTokenResponse,
  SummaryActivity,
} from "@/types/strava";

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
        "Missing required environment variables: STRAVA_CLIENT_ID or/and STRAVA_CLIENT_SECRET",
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
    encryptedStravaRefreshToken: string,
  ): Promise<StravaTokenResponse> {
    const stravaRefreshToken = decrypt(encryptedStravaRefreshToken);

    const response = await axios.post(`${this.apiUrl}/oauth/token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: stravaRefreshToken,
      grant_type: "refresh_token",
    });

    return response.data;
  }

  async getLoggedInAthleteActivities({
    encryptedStravaAccessToken,
    page = 1,
    perPage = 200,
  }: {
    encryptedStravaAccessToken: string;
    page?: number;
    perPage?: number;
  }): Promise<SummaryActivity[]> {
    const stravaAccessToken = decrypt(encryptedStravaAccessToken);

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

  async getActivityPhotos(
    encryptedStravaAccessToken: string,
    activityId: number,
  ): Promise<{
    photos: StravaPhoto[];
    rateLimitUsage: { fifteenMin: number; daily: number };
    rateLimitLimit: { fifteenMin: number; daily: number };
  }> {
    const stravaAccessToken = decrypt(encryptedStravaAccessToken);

    try {
      const response = await axios.get(
        `${this.apiUrl}/activities/${activityId}/photos`,
        {
          headers: {
            Authorization: `Bearer ${stravaAccessToken}`,
          },
          params: {
            size: 2048,
          },
        },
      );

      // Parsing rate limit headers
      const parseRateLimit = (header: string | undefined) => {
        const [fifteenMin, daily] = (header ?? "0,0").split(",").map(Number);
        return { fifteenMin, daily };
      };

      return {
        photos: response.data,
        rateLimitUsage: parseRateLimit(
          response.headers["x-ratelimit-usage"] as string,
        ),
        rateLimitLimit: parseRateLimit(
          response.headers["x-ratelimit-limit"] as string,
        ),
      };
    } catch (error) {
      // Axios put HTTP errors in error.response
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        // Compute time from next 15min window (:00, :15, :30, :45)
        const now = new Date();
        const minutes = now.getMinutes();
        const nextWindowMinutes = Math.ceil((minutes + 1) / 15) * 15;
        const minutesToWait = nextWindowMinutes - minutes;
        const retryAfterMs = minutesToWait * 60 * 1000;

        throw new RateLimitError(
          `Strava API rate limit exceeded. Restarting automatically in ${minutesToWait} minutes.`,
          retryAfterMs,
        );
      }
      throw error;
    }
  }
}
