import { describe, it, expect } from '@jest/globals';
import { validate } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { LoginUserDto } from './login-user.dto';

describe('DTO Validation', () => {
  describe('RegisterUserDto', () => {
    describe('email validation', () => {
      it('should accept valid email', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors).toHaveLength(0);
      });

      it('should reject invalid email format', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'invalid-email';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0].constraints).toHaveProperty('isEmail');
      });

      it('should reject email without domain', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors.length).toBeGreaterThan(0);
      });

      it('should reject email without @ symbol', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'testexample.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors.length).toBeGreaterThan(0);
      });

      it('should accept email with subdomains', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@mail.example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors).toHaveLength(0);
      });

      it('should accept email with plus sign', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test+tag@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors).toHaveLength(0);
      });

      it('should accept email with dots', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test.user@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors).toHaveLength(0);
      });
    });

    describe('username validation', () => {
      it('should accept valid username', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors).toHaveLength(0);
      });

      it('should reject username shorter than 3 characters', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'ab';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors.length).toBeGreaterThan(0);
        expect(usernameErrors[0].constraints).toHaveProperty('minLength');
      });

      it('should reject username longer than 50 characters', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'a'.repeat(51);
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors.length).toBeGreaterThan(0);
        expect(usernameErrors[0].constraints).toHaveProperty('maxLength');
      });

      it('should accept username with numbers', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser123';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors).toHaveLength(0);
      });

      it('should accept username with underscores', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'test_user';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors).toHaveLength(0);
      });

      it('should accept username with hyphens', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'test-user';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors).toHaveLength(0);
      });

      it('should reject username with spaces', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'test user';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors.length).toBeGreaterThan(0);
        expect(usernameErrors[0].constraints).toHaveProperty('matches');
      });

      it('should reject username with special characters', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'test@user';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors.length).toBeGreaterThan(0);
        expect(usernameErrors[0].constraints).toHaveProperty('matches');
      });

      it('should accept username with mixed case', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'TestUser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const usernameErrors = errors.filter((e) => e.property === 'username');

        expect(usernameErrors).toHaveLength(0);
      });
    });

    describe('password validation', () => {
      it('should accept valid strong password', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should reject password shorter than 8 characters', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test1!';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('minLength');
      });

      it('should reject password longer than 128 characters', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#' + 'a'.repeat(120);

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('maxLength');
      });

      it('should reject password without uppercase letter', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'test123!@#';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('matches');
      });

      it('should reject password without lowercase letter', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'TEST123!@#';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('matches');
      });

      it('should reject password without number', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'TestTest!@#';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('matches');
      });

      it('should reject password without special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test1234567';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('matches');
      });

      it('should accept password with @ special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123@abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept password with $ special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123$abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept password with ! special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept password with % special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123%abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept password with * special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123*abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept password with ? special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123?abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept password with & special character', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123&abc';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should reject password with only allowed special characters but missing other requirements', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = '!@#$%^&*';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
      });
    });

    describe('combined validation', () => {
      it('should accept all valid fields', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'test@example.com';
        dto.username = 'testuser';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should reject all invalid fields', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'invalid';
        dto.username = 'ab';
        dto.password = 'weak';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(3);
      });

      it('should validate all fields independently', async () => {
        const dto = new RegisterUserDto();
        dto.email = 'invalid';
        dto.username = 'validusername';
        dto.password = 'Test123!@#';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
      });
    });
  });

  describe('LoginUserDto', () => {
    describe('email validation', () => {
      it('should accept valid email', async () => {
        const dto = new LoginUserDto();
        dto.email = 'test@example.com';
        dto.password = 'anypassword';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors).toHaveLength(0);
      });

      it('should reject invalid email', async () => {
        const dto = new LoginUserDto();
        dto.email = 'invalid-email';
        dto.password = 'anypassword';

        const errors = await validate(dto);
        const emailErrors = errors.filter((e) => e.property === 'email');

        expect(emailErrors.length).toBeGreaterThan(0);
        expect(emailErrors[0].constraints).toHaveProperty('isEmail');
      });

      it('should accept email with various formats', async () => {
        const validEmails = [
          'test@example.com',
          'test.user@example.com',
          'test+tag@example.com',
          'test@mail.example.com',
        ];

        for (const email of validEmails) {
          const dto = new LoginUserDto();
          dto.email = email;
          dto.password = 'anypassword';

          const errors = await validate(dto);
          const emailErrors = errors.filter((e) => e.property === 'email');

          expect(emailErrors).toHaveLength(0);
        }
      });
    });

    describe('password validation', () => {
      it('should accept any string password', async () => {
        const dto = new LoginUserDto();
        dto.email = 'test@example.com';
        dto.password = 'anypassword';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should accept weak password (no strength validation on login)', async () => {
        const dto = new LoginUserDto();
        dto.email = 'test@example.com';
        dto.password = '123';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors).toHaveLength(0);
      });

      it('should reject non-string password', async () => {
        const dto = new LoginUserDto();
        dto.email = 'test@example.com';
        (dto as any).password = 12345;

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        expect(passwordErrors.length).toBeGreaterThan(0);
        expect(passwordErrors[0].constraints).toHaveProperty('isString');
      });

      it('should accept empty string password', async () => {
        const dto = new LoginUserDto();
        dto.email = 'test@example.com';
        dto.password = '';

        const errors = await validate(dto);
        const passwordErrors = errors.filter((e) => e.property === 'password');

        // No validation error, but login will fail
        expect(passwordErrors).toHaveLength(0);
      });
    });

    describe('combined validation', () => {
      it('should accept valid login credentials', async () => {
        const dto = new LoginUserDto();
        dto.email = 'test@example.com';
        dto.password = 'anypassword';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should reject invalid email with valid password', async () => {
        const dto = new LoginUserDto();
        dto.email = 'invalid';
        dto.password = 'anypassword';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
      });

      it('should validate independently', async () => {
        const dto = new LoginUserDto();
        dto.email = 'invalid';
        (dto as any).password = 12345;

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Security Considerations', () => {
    it('should not expose password validation rules in login DTO', async () => {
      // Login DTO should not validate password strength to avoid leaking info
      const dto = new LoginUserDto();
      dto.email = 'test@example.com';
      dto.password = 'weak';

      const errors = await validate(dto);
      const passwordErrors = errors.filter((e) => e.property === 'password');

      expect(passwordErrors).toHaveLength(0);
    });

    it('should enforce strong password only on registration', async () => {
      const weakPassword = 'weak';

      // Register DTO should reject
      const registerDto = new RegisterUserDto();
      registerDto.email = 'test@example.com';
      registerDto.username = 'testuser';
      registerDto.password = weakPassword;

      const registerErrors = await validate(registerDto);
      const registerPasswordErrors = registerErrors.filter((e) => e.property === 'password');

      expect(registerPasswordErrors.length).toBeGreaterThan(0);

      // Login DTO should accept
      const loginDto = new LoginUserDto();
      loginDto.email = 'test@example.com';
      loginDto.password = weakPassword;

      const loginErrors = await validate(loginDto);
      const loginPasswordErrors = loginErrors.filter((e) => e.property === 'password');

      expect(loginPasswordErrors).toHaveLength(0);
    });
  });
});
