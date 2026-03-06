import MockAdapter from "axios-mock-adapter";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api, { fetchCsrfToken, resetCsrfToken } from "../src/lib/api";
import * as toastHelpers from "../src/lib/toast-helpers";
import { useAuthStore } from "../src/stores/authStore";
import type { User } from "../src/types/auth";

// Helper to create a mock user with default values
const createMockUser = (overrides?: Partial<User>): User => ({
  id: "123",
  email: "test@example.com",
  stravaAthleteId: null,
  lastSyncedAt: null,
  username: null,
  lastName: null,
  firstName: null,
  bio: null,
  city: null,
  state: null,
  country: null,
  sex: null,
  weight: null,
  profileMedium: null,
  profile: null,
  friend: null,
  follower: null,
  badgeTypeId: null,
  premium: null,
  summit: null,
  ...overrides,
});

describe("api interceptors", () => {
  let mockAxios: MockAdapter;
  let originalLocation: Location;

  beforeEach(() => {
    // Create a new mock adapter instance before each test
    mockAxios = new MockAdapter(api);

    // Mock CSRF token endpoint by default (can be overridden in specific tests)
    mockAxios.onGet("/csrf-token").reply(200, { csrfToken: "test-token" });

    // Reset CSRF token state
    resetCsrfToken();

    // Mock the toast helper
    vi.spyOn(toastHelpers, "showErrorToast").mockImplementation(() => {});

    // Reset the auth store
    useAuthStore.setState({
      user: null,
      isLoading: false,
    });

    // Save and mock window.location
    originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    mockAxios.reset();
    vi.restoreAllMocks();
    // Restore window.location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  describe("CSRF token handling", () => {
    it("should fetch CSRF token for POST requests", async () => {
      mockAxios.onPost("/test").reply(200, { success: true });

      const response = await api.post("/test", { data: "test" });

      // Check response
      expect(response.data.success).toBe(true);

      // Check that the CSRF token was fetched
      expect(mockAxios.history.get.length).toBe(1);
      expect(mockAxios.history.get[0].url).toBe("/csrf-token");

      // Check that the CSRF token was included in the request
      const history = mockAxios.history.post;
      expect(history.length).toBe(1);
      expect(history[0].headers?.["X-CSRF-Token"]).toBe("test-token");
    });

    it("should retry request on CSRF error (403)", async () => {
      // Reset and reconfigure mocks for this test
      mockAxios.reset();

      // First GET /csrf-token → old-token
      mockAxios.onGet("/csrf-token").replyOnce(200, { csrfToken: "old-token" });
      // First POST /test → 403
      mockAxios.onPost("/test").replyOnce(403, { error: "CSRF token invalid" });
      // Second GET /csrf-token (after 403) → new-token
      mockAxios.onGet("/csrf-token").replyOnce(200, { csrfToken: "new-token" });
      // Second POST /test (retry) → 200
      mockAxios.onPost("/test").replyOnce(200, { success: true });

      const response = await api.post("/test", { data: "test" });

      expect(response.data.success).toBe(true);
      expect(mockAxios.history.post.length).toBe(2); // Should have retried
      // First GET for initial token, second GET after 403
      expect(mockAxios.history.get.length).toBe(2);
      // Verify the second request used the new token
      expect(mockAxios.history.post[1].headers?.["X-CSRF-Token"]).toBe(
        "new-token",
      );
    });

    it.each(["put", "patch", "delete"])(
      "should fetch CSRF token for %s requests",
      async (method) => {
        mockAxios.onAny("/test").reply(200, { success: true });

        if (method === "delete") {
          await api.delete("/test");
        } else if (method === "put") {
          await api.put("/test", { data: "test" });
        } else {
          await api.patch("/test", { data: "test" });
        }

        const history = mockAxios.history[method as "put" | "patch" | "delete"];
        expect(history.length).toBe(1);
        expect(history[0].headers?.["X-CSRF-Token"]).toBe("test-token");
      },
    );

    it("should not include CSRF token for GET requests", async () => {
      mockAxios.onGet("/test").reply(200, { success: true });

      await api.get("/test");

      // CSRF token should not be fetched for GET requests
      expect(mockAxios.history.get.length).toBe(1);
      expect(mockAxios.history.get[0].url).toBe("/test");
      expect(
        mockAxios.history.get[0].headers?.["X-CSRF-Token"],
      ).toBeUndefined();
    });
  });

  describe("401 error handling", () => {
    it("should logout and show toast on 401 error", async () => {
      vi.useFakeTimers();

      // Set up authenticated state
      useAuthStore.setState({
        user: createMockUser(),
        isLoading: false,
      });

      // Mock a successful logout
      mockAxios.onPost("/auth/logout").reply(200, { success: true });

      // Mock a 401 error response
      mockAxios.onGet("/protected-route").reply(401, {
        error: "Unauthorized",
      });

      const errorPromise = api.get("/protected-route");

      // Let the interceptor run
      await vi.runAllTimersAsync();

      // The request should be rejected
      await expect(errorPromise).rejects.toThrow();

      // Check that logout was called
      const state = useAuthStore.getState();
      expect(state.isAuthenticated()).toBe(false);
      expect(state.user).toBe(null);

      // Check that error toast was shown
      expect(toastHelpers.showErrorToast).toHaveBeenCalledWith(
        "Votre session a expiré. Veuillez vous reconnecter.",
      );

      // Check that window.location.href was set
      expect(window.location.href).toBe("/");

      vi.useRealTimers();
    });

    it("should NOT logout on 401 for /auth/current-user", async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: createMockUser(),
        isLoading: false,
      });

      // Mock a 401 error for auth check
      mockAxios.onGet("/auth/current-user").reply(401, {
        error: "Unauthorized",
      });

      await expect(api.get("/auth/current-user")).rejects.toThrow();

      // Check that logout was NOT called (user should still be authenticated)
      const state = useAuthStore.getState();
      expect(state.isAuthenticated()).toBe(true);
      expect(state.user).not.toBe(null);

      // Check that error toast was NOT shown
      expect(toastHelpers.showErrorToast).not.toHaveBeenCalled();

      // Check that window.location was NOT changed
      expect(window.location.href).toBe("");
    });

    it("should handle multiple 401 errors correctly", async () => {
      vi.useFakeTimers();

      // Set up authenticated state
      useAuthStore.setState({
        user: createMockUser(),
        isLoading: false,
      });

      // Mock successful logout (needs CSRF token)
      mockAxios.onPost("/auth/logout").reply(200, { success: true });

      // Mock multiple 401 errors
      mockAxios.onGet("/route1").reply(401);
      mockAxios.onGet("/route2").reply(401);

      const promise1 = api.get("/route1");
      const promise2 = api.get("/route2");

      await vi.runAllTimersAsync();

      await expect(promise1).rejects.toThrow();
      await expect(promise2).rejects.toThrow();

      // Should have logged out
      const state = useAuthStore.getState();
      expect(state.isAuthenticated()).toBe(false);
      // Logout should have been called (may be multiple times in parallel)
      expect(mockAxios.history.post.length).toBeGreaterThanOrEqual(1);

      // Should show toast for each 401
      expect(toastHelpers.showErrorToast).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it("should handle network errors gracefully", async () => {
      mockAxios.onGet("/test").networkError();

      await expect(api.get("/test")).rejects.toThrow();

      // Should not trigger logout on network errors
      const state = useAuthStore.getState();
      expect(state.user).toBe(null); // Still null from beforeEach
      expect(toastHelpers.showErrorToast).not.toHaveBeenCalled();
    });

    it("should handle timeout errors gracefully", async () => {
      mockAxios.onGet("/test").timeout();

      await expect(api.get("/test")).rejects.toThrow();

      // Should not trigger logout on timeout
      expect(toastHelpers.showErrorToast).not.toHaveBeenCalled();
    });
  });

  describe("fetchCsrfToken", () => {
    it("should fetch and store CSRF token", async () => {
      mockAxios.onGet("/csrf-token").reply(200, { csrfToken: "test-token" });

      await fetchCsrfToken();

      // Verify the token was stored by checking subsequent requests
      mockAxios.onPost("/test").reply(200);
      await api.post("/test");

      const history = mockAxios.history.post;
      expect(history[0].headers?.["X-CSRF-Token"]).toBe("test-token");
    });

    it("should throw error on failed CSRF token fetch", async () => {
      mockAxios.onGet("/csrf-token").reply(500);

      await expect(fetchCsrfToken()).rejects.toThrow();
    });
  });
});
