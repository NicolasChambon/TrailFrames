import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubEnv("VITE_API_URL", "http://localhost:3000");
vi.stubEnv("VITE_WEB_APP_URL", "http://localhost:5173");
vi.stubEnv("VITE_STRAVA_URL", "https://www.strava.com");
vi.stubEnv("VITE_STRAVA_CLIENT_ID", "test-client-id");
