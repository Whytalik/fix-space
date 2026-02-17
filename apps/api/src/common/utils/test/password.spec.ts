import { describe, expect, it } from '@jest/globals';
import { comparePassword, hashPassword } from '../password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe('string');
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'Test123!@#';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should use bcrypt with correct salt rounds', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      // Verify it's a valid bcrypt hash (starts with $2b$ or $2a$)
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should hash empty string', async () => {
      const password = '';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should hash very long password', async () => {
      const password = 'A'.repeat(100) + '123!@#';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should hash password with special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(await comparePassword(password, hash)).toBe(true);
    });

    it('should hash password with unicode characters', async () => {
      const password = 'Пароль123!ąćęłńóśźż';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(await comparePassword(password, hash)).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const result = await comparePassword('WrongPassword123!', hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password against valid hash', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const result = await comparePassword('test123!@#', hash);

      expect(result).toBe(false);
    });

    it('should return false for similar but different passwords', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const result = await comparePassword('Test123!@', hash);

      expect(result).toBe(false);
    });

    it('should handle invalid hash format gracefully', async () => {
      const password = 'Test123!@#';
      const invalidHash = 'not-a-valid-bcrypt-hash';

      const result = await comparePassword(password, invalidHash);
      expect(result).toBe(false);
    });

    it('should validate password with special characters correctly', async () => {
      const password = '!@#$%^&*()Test123';
      const hash = await hashPassword(password);

      expect(await comparePassword(password, hash)).toBe(true);
      expect(await comparePassword('!@#$%^&*()Test124', hash)).toBe(false);
    });

    it('should validate unicode passwords correctly', async () => {
      const password = 'Пароль123!';
      const hash = await hashPassword(password);

      expect(await comparePassword(password, hash)).toBe(true);
      expect(await comparePassword('Пароль124!', hash)).toBe(false);
    });

    it('should return false for whitespace differences', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      expect(await comparePassword(' Test123!@#', hash)).toBe(false);
      expect(await comparePassword('Test123!@# ', hash)).toBe(false);
      expect(await comparePassword(' Test123!@# ', hash)).toBe(false);
    });
  });

  describe('Security Properties', () => {
    it('should produce hash with sufficient entropy', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      // Bcrypt hashes are 60 characters long
      expect(hash.length).toBe(60);
    });

    it('should be computationally expensive (timing test)', async () => {
      const password = 'Test123!@#';
      const start = Date.now();
      await hashPassword(password);
      const duration = Date.now() - start;

      // Bcrypt with 10 rounds should take at least 50ms
      expect(duration).toBeGreaterThan(50);
    });

    it('should verify password in reasonable time', async () => {
      const password = 'Test123!@#';
      const hash = await hashPassword(password);

      const start = Date.now();
      await comparePassword(password, hash);
      const duration = Date.now() - start;

      // Verification should complete within 500ms
      expect(duration).toBeLessThan(500);
    });
  });
});
