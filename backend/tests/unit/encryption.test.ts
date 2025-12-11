import { beforeAll, describe, expect, it } from "vitest";
import "dotenv/config";
import { decrypt, encrypt } from "@/lib/encryption";

describe("Encryption utilities", () => {
  beforeAll(() => {
    // Ensure ENCRYPTION_KEY is set for tests
    if (!process.env.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY = "a".repeat(64); // 64-char hex string
    }
  });

  describe("encryp", () => {
    it("should encrypt a plain text string", () => {
      const plainText = "my_secret_toekn_12345";
      const encrypted = encrypt(plainText);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(":"); // Format: iv:authTag:encryptedData
      expect(encrypted.split(":").length).toBe(3);
    });

    it("should produce different encrypted values for the same input", () => {
      const plainText = "same_text";
      const encrypted1 = encrypt(plainText);
      const encrypted2 = encrypt(plainText);

      expect(encrypted1).not.toBe(encrypted2); // Different IV = different output
    });
  });

  describe("decrypt", () => {
    it("should decrypt an encrypted string back to original", () => {
      const plainText = "my_secret_token_12345";
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plainText);
    });

    it("should throw an error if encrypted text is tampered", () => {
      const plainText = "my_secret_token";
      const encrypted = encrypt(plainText);
      const tampered = encrypted.replace(/.$/, "x"); // Change last char

      expect(() => decrypt(tampered)).toThrow();
    });
  });
});
