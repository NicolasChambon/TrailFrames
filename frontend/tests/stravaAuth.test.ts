import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateStravaAuthUrl } from "../src/lib/stravaAuth";

describe("stravaAuth", () => {
  beforeEach(() => {
    // Reset env vars before each test
    vi.stubEnv("VITE_WEB_APP_URL", "http://localhost:5173");
    vi.stubEnv("VITE_STRAVA_URL", "https://www.strava.com");
    vi.stubEnv("VITE_STRAVA_CLIENT_ID", "test-client-id");
  });

  describe("generateStravaAuthUrl", () => {
    it("should generate correct Strava OAuth URL", () => {
      const url = generateStravaAuthUrl();

      expect(url).toContain("https://www.strava.com/oauth/authorize");
      expect(url).toContain("client_id=test-client-id");
      expect(url).toContain("response_type=code");
    });

    it("should include all required scopes", () => {
      const url = generateStravaAuthUrl();
      const expectedScopes = [
        "read",
        "read_all",
        "profile:read_all",
        "profile:write",
        "activity:read",
        "activity:read_all",
        "activity:write",
      ];

      expectedScopes.forEach((scope) => {
        expect(url).toContain(scope);
      });
    });

    it("should properly encode redirect URI", () => {
      const url = generateStravaAuthUrl();
      const expectedRedirectUri = encodeURIComponent(
        "http://localhost:5173/callback"
      );

      expect(url).toContain(`redirect_uri=${expectedRedirectUri}`);
    });

    it("should construct URL with correct format", () => {
      const url = generateStravaAuthUrl();
      const urlObj = new URL(url);

      expect(urlObj.protocol).toBe("https:");
      expect(urlObj.hostname).toBe("www.strava.com");
      expect(urlObj.pathname).toBe("/oauth/authorize");
      expect(urlObj.searchParams.get("client_id")).toBe("test-client-id");
      expect(urlObj.searchParams.get("response_type")).toBe("code");
      expect(urlObj.searchParams.get("redirect_uri")).toBe(
        "http://localhost:5173/callback"
      );
    });

    // Prevent regression while changing handling of env vars
    it("should use environment variables correctly", async () => {
      // Reset modules to pick up new env vars
      vi.resetModules();

      vi.stubEnv("VITE_WEB_APP_URL", "https://myapp.com");
      vi.stubEnv("VITE_STRAVA_URL", "https://strava.example.com");
      vi.stubEnv("VITE_STRAVA_CLIENT_ID", "custom-client-id");

      // Re-import to get new env values
      const { generateStravaAuthUrl: freshGenerate } = await import(
        "../src/lib/stravaAuth"
      );

      const url = freshGenerate();

      expect(url).toContain("https://strava.example.com/oauth/authorize");
      expect(url).toContain("client_id=custom-client-id");
      expect(url).toContain(encodeURIComponent("https://myapp.com/callback"));
    });
  });
});
