import { describe, expect, it } from "@jest/globals";
import { createHash } from "crypto";
import { generateRandomToken, hashToken } from "../token.helper";

describe("Token Helper Utilities", () => {
  describe("generateRandomToken", () => {
    it("should generate a random token with default length", () => {
      const token = generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      // Default 32 bytes = 64 hex characters
      expect(token.length).toBe(64);
    });

    it("should generate a random token with custom length", () => {
      const token = generateRandomToken(16);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      // 16 bytes = 32 hex characters
      expect(token.length).toBe(32);
    });

    it("should generate different tokens on consecutive calls", () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      const token3 = generateRandomToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it("should generate tokens with only hexadecimal characters", () => {
      const token = generateRandomToken();

      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate unique tokens in batch", () => {
      const tokens = new Set<string>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        tokens.add(generateRandomToken());
      }

      // All tokens should be unique
      expect(tokens.size).toBe(count);
    });

    it("should generate token with very small byte size", () => {
      const token = generateRandomToken(1);

      expect(token).toBeDefined();
      expect(token.length).toBe(2); // 1 byte = 2 hex chars
    });

    it("should generate token with large byte size", () => {
      const token = generateRandomToken(128);

      expect(token).toBeDefined();
      expect(token.length).toBe(256); // 128 bytes = 256 hex chars
    });

    it("should have high entropy", () => {
      const tokens = [];
      for (let i = 0; i < 100; i++) {
        tokens.push(generateRandomToken());
      }

      // Check that all characters 0-9 and a-f appear
      const allChars = tokens.join("");
      const uniqueChars = new Set(allChars);

      // Should have good distribution of all hex characters
      expect(uniqueChars.size).toBe(16); // 0-9, a-f
    });

    it("should handle zero bytes gracefully", () => {
      const token = generateRandomToken(0);

      expect(token).toBe("");
    });
  });

  describe("hashToken", () => {
    it("should hash a token consistently", () => {
      const token = "test-token-123";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different tokens", () => {
      const token1 = "test-token-1";
      const token2 = "test-token-2";

      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce SHA-256 hash (64 hex characters)", () => {
      const token = "test-token";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(64); // SHA-256 = 32 bytes = 64 hex chars
    });

    it("should produce hash with only hexadecimal characters", () => {
      const token = "test-token";
      const hash = hashToken(token);

      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it("should hash empty string", () => {
      const token = "";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should be case sensitive", () => {
      const token1 = "TestToken";
      const token2 = "testtoken";

      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle special characters", () => {
      const token = "!@#$%^&*()_+-=[]{}|;:,.<>?`~";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should handle unicode characters", () => {
      const token = "Токен123ąćęłńóśźż";
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should handle very long tokens", () => {
      const token = "a".repeat(10000);
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it("should match native crypto SHA-256 implementation", () => {
      const token = "test-token-123";
      const hash = hashToken(token);

      const expectedHash = createHash("sha256").update(token).digest("hex");

      expect(hash).toBe(expectedHash);
    });

    it("should produce avalanche effect (small input change = large hash change)", () => {
      const token1 = "test-token-1";
      const token2 = "test-token-2"; // Only last character differs

      const hash1 = hashToken(token1);
      const hash2 = hashToken(token2);

      // Count different characters
      let differentChars = 0;
      for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
          differentChars++;
        }
      }

      // At least 50% of characters should be different (avalanche effect)
      expect(differentChars).toBeGreaterThan(32);
    });

    it("should be deterministic for integration with database lookups", () => {
      const token = generateRandomToken();
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      const hash3 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });
  });

  describe("Integration: generateRandomToken + hashToken", () => {
    it("should generate and hash token successfully", () => {
      const token = generateRandomToken();
      const hash = hashToken(token);

      expect(token).toBeDefined();
      expect(hash).toBeDefined();
      expect(token).not.toBe(hash);
    });

    it("should create unique hash for each generated token", () => {
      const tokens = [];
      const hashes = new Set<string>();

      for (let i = 0; i < 100; i++) {
        const token = generateRandomToken();
        const hash = hashToken(token);
        tokens.push(token);
        hashes.add(hash);
      }

      // All hashes should be unique
      expect(hashes.size).toBe(100);
    });

    it("should allow token verification via hash comparison", () => {
      const originalToken = generateRandomToken();
      const storedHash = hashToken(originalToken);

      // Simulate verification
      const providedToken = originalToken;
      const providedHash = hashToken(providedToken);

      expect(providedHash).toBe(storedHash);
    });

    it("should reject incorrect token via hash comparison", () => {
      const originalToken = generateRandomToken();
      const storedHash = hashToken(originalToken);

      const wrongToken = generateRandomToken();
      const wrongHash = hashToken(wrongToken);

      expect(wrongHash).not.toBe(storedHash);
    });

    it("should be collision-resistant for practical use", () => {
      const hashSet = new Set<string>();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const token = generateRandomToken();
        const hash = hashToken(token);
        hashSet.add(hash);
      }

      // No collisions should occur
      expect(hashSet.size).toBe(iterations);
    });
  });

  describe("Security Properties", () => {
    it("should make token lookup secure via hashing", () => {
      const token = generateRandomToken();
      const hash = hashToken(token);

      // Hash should not reveal original token
      expect(hash).not.toContain(token);
      expect(token).not.toContain(hash);
    });

    it("should provide sufficient entropy for security", () => {
      const token = generateRandomToken();

      // 32 bytes = 256 bits of entropy
      expect(token.length).toBe(64);

      // Should be cryptographically random
      const hash = hashToken(token);
      expect(hash.length).toBe(64);
    });

    it("should resist rainbow table attacks via unique tokens", () => {
      const tokens = Array.from({ length: 1000 }, () => generateRandomToken());
      const hashes = tokens.map(hashToken);

      // All hashes should be unique (no precomputable patterns)
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1000);
    });
  });
});
