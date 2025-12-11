import jwt from "jsonwebtoken";
import { beforeAll, describe, expect, it } from "vitest";
import { generateAccessToken, JwtPayload, verifyAccessToken } from "@/lib/jwt";

describe("JWT utilities", () => {
  const mockPayload: JwtPayload = {
    userId: "user_123",
    email: "test@example.com",
  };

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test_access_secret";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
  });

  describe("generateAccessToken", () => {
    it("should generate a valid access token", () => {
      const token = generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should encode userId and email in the token", () => {
      const token = generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as JwtPayload;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const token = generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    describe("verifyAccessToken", () => {
      it("should verify a valid access token", () => {
        const token = generateAccessToken(mockPayload);
        const payload = verifyAccessToken(token);

        expect(payload.userId).toBe(mockPayload.userId);
        expect(payload.email).toBe(mockPayload.email);
      });

      it("should throw an error for an invalid token", () => {
        const invalidToken = "invalid.token.here";

        expect(() => verifyAccessToken(invalidToken)).toThrow();
      });

      it("should throw an error for an expired token", () => {
        const expiredToken = jwt.sign(
          mockPayload,
          process.env.JWT_ACCESS_SECRET!,
          {
            expiresIn: "-1s",
          }
        );

        expect(() => verifyAccessToken(expiredToken)).toThrow();
      });
    });

    describe("verifyRefreshToken", () => {
      it("should verify a valid refresh token", () => {
        const token = generateAccessToken(mockPayload);
        const payload = verifyAccessToken(token);

        expect(payload.userId).toBe(mockPayload.userId);
        expect(payload.email).toBe(mockPayload.email);
      });

      it("should throw an error for an invalid token", () => {
        const invalidToken = "invalid.token.here";

        expect(() => verifyAccessToken(invalidToken)).toThrow();
      });
    });
  });
});
