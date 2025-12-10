import "dotenv/config";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  mockStravaActivities,
  mockStravaTokenResponse,
} from "@tests/helpers/mockData";

const STRAVA_API_URL =
  process.env.STRAVA_API_URL || "https://www.strava.com/api/v3";

export const handlers = [
  // Mock OAuth token exchange
  http.post(`${STRAVA_API_URL}/oauth/token`, async ({ request }) => {
    const body = await request.json();

    const isBodyValid =
      body && typeof body === "object" && "grant_type" in body;

    if (isBodyValid && body.grant_type === "authorization_code") {
      return HttpResponse.json(mockStravaTokenResponse);
    }

    if (isBodyValid && body.grant_type === "refresh_token") {
      return HttpResponse.json({
        ...mockStravaTokenResponse,
        access_token: "new_mock_access_token_99999",
        refresh_token: "new_mock_refresh_token_88888",
      });
    }

    return HttpResponse.json(
      { message: "Invalid grant_type" },
      { status: 400 }
    );
  }),

  // Mock get athlete activities
  http.get(`${STRAVA_API_URL}/athlete/activities`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "30");

    // Simulate pagination
    if (page > 1) {
      return HttpResponse.json([]);
    }

    return HttpResponse.json(mockStravaActivities.slice(0, perPage));
  }),
];

export const server = setupServer(...handlers);
