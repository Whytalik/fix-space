import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.CREDENTIALS_ENCRYPTION_KEY ?? "0".repeat(64);
  return Buffer.from(hex, "hex");
}

export function encryptCredentials(credentials: Record<string, unknown>): Record<string, string> {
  const initVector = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), initVector);
  const payload = JSON.stringify(credentials);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return {
    iv: initVector.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    data: encrypted.toString("hex"),
  };
}

export function decryptCredentials(stored: Record<string, string>): Record<string, unknown> {
  const { iv: initVector, tag: authTag, data } = stored;
  if (!initVector || !authTag || !data) {
    throw new Error("Invalid stored credentials");
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(initVector, "hex"));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(data, "hex")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as Record<string, unknown>;
}
