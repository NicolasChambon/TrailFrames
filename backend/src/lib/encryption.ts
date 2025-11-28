import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key || key.length !== 64) {
    throw new Error(
      "Invalid ENCRYPTION_KEY. It must be a 64-character hex string."
    );
  }

  return Buffer.from(key, "hex");
}

/**
 * Encrypts the given plain text using AES-256-GCM.
 * @param plainText - The text to encrypt (e.g., a token).
 * @returns The encrypted text in the format: iv:authTag:encryptedData in hex.
 */
export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts the given encrypted text using AES-256-GCM.
 * @param encryptedText - The encrypted text in the format: iv:authTag:encryptedData in hex.
 * @returns The decrypted plain text.
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encryptedData] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
