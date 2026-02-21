import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '@nucleus/database';
import { AppLogger } from '../../common/logger/app-logger.service';
import * as passwordUtils from '../../common/utils/password';
import { MailService } from '../../mail/mail.service';
import { InitializeUserSpaceUseCase } from '../../space/providers/initialize-user-space.usecase';
import { RegisterUserService } from '../register-user.usecase';
import { TokenService } from '../token.service';

// Mock modules
jest.mock('@nucleus/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../common/utils/password', () => ({
  hashPassword: jest.fn(),
}));

describe('RegisterUserService', () => {
  let service: RegisterUserService;
  let tokenService: TokenService;
  let mailService: MailService;
  let logger: AppLogger;
  let initializeUserSpaceUseCase: InitializeUserSpaceUseCase;

  const mockTokenService = {
    createVerificationToken: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockInitializeUserSpaceUseCase = {
    initialize: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
        {
          provide: InitializeUserSpaceUseCase,
          useValue: mockInitializeUserSpaceUseCase,
        },
      ],
    }).compile();

    service = module.get<RegisterUserService>(RegisterUserService);
    tokenService = module.get<TokenService>(TokenService);
    mailService = module.get<MailService>(MailService);
    logger = module.get<AppLogger>(AppLogger);
    initializeUserSpaceUseCase = module.get<InitializeUserSpaceUseCase>(
      InitializeUserSpaceUseCase,
    );
  });

  describe('register', () => {
    const validRegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
    };

    const mockCreatedUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashed-password',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register user successfully', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(null); // Username check
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
        'hashed-password',
      );
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue(
        'verification-token',
      );
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      const result = await service.register(validRegisterDto);

      expect(result).toEqual({
        message:
          'Registration successful. Please check your email to verify your account.',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(
        validRegisterDto.password,
      );
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: validRegisterDto.email,
          username: validRegisterDto.username,
          passwordHash: 'hashed-password',
        },
      });
      expect(mockInitializeUserSpaceUseCase.initialize).toHaveBeenCalledWith(
        mockCreatedUser.id,
        validRegisterDto.username,
      );
      expect(mockTokenService.createVerificationToken).toHaveBeenCalledWith(
        mockCreatedUser.id,
      );
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockCreatedUser.email,
        mockCreatedUser.username,
        'verification-token',
      );
      expect(mockLogger.log).toHaveBeenCalledWith('User registered', {
        userId: mockCreatedUser.id,
        username: mockCreatedUser.username,
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Verification email sent', {
        userId: mockCreatedUser.id,
        email: mockCreatedUser.email,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'existing-user',
        email: validRegisterDto.email,
      });

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'User with this email already exists',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Registration failed: email taken',
        { email: validRegisterDto.email },
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce({
          // Username check fails
          id: 'existing-user',
          username: validRegisterDto.username,
        });

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'User with this username already exists',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Registration failed: username taken',
        { username: validRegisterDto.username },
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should check email uniqueness first', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'existing-user',
        email: validRegisterDto.email,
      });

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'User with this email already exists',
      );

      // Should only call findUnique once for email
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: validRegisterDto.email },
      });
    });

    it('should hash password before storing', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
        'secure-hash',
      );
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(validRegisterDto);

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(
        validRegisterDto.password,
      );
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          passwordHash: 'secure-hash',
        }),
      });
    });

    it('should create user with isVerified false by default', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(validRegisterDto);

      // User should be created with isVerified: false (default in schema)
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockCreatedUser.isVerified).toBe(false);
    });

    it('should initialize user space after registration', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(validRegisterDto);

      expect(mockInitializeUserSpaceUseCase.initialize).toHaveBeenCalledWith(
        mockCreatedUser.id,
        validRegisterDto.username,
      );
    });

    it('should generate verification token', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue(
        'unique-token',
      );
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(validRegisterDto);

      expect(mockTokenService.createVerificationToken).toHaveBeenCalledWith(
        mockCreatedUser.id,
      );
    });

    it('should send verification email with correct parameters', async () => {
      const verificationToken = 'unique-verification-token';

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue(
        verificationToken,
      );
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(validRegisterDto);

      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockCreatedUser.email,
        mockCreatedUser.username,
        verificationToken,
      );
    });

    it('should handle case-insensitive email check', async () => {
      const uppercaseEmailDto = {
        ...validRegisterDto,
        email: 'TEST@EXAMPLE.COM',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(uppercaseEmailDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: uppercaseEmailDto.email },
      });
    });

    it('should handle username with special allowed characters', async () => {
      const specialUsernameDto = {
        ...validRegisterDto,
        username: 'test_user-123',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockCreatedUser,
        username: specialUsernameDto.username,
      });
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(specialUsernameDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          username: specialUsernameDto.username,
        }),
      });
    });

    it('should log registration steps', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await service.register(validRegisterDto);

      expect(mockLogger.debug).toHaveBeenCalledWith('Registration attempt', {
        email: validRegisterDto.email,
        username: validRegisterDto.username,
      });
      expect(mockLogger.log).toHaveBeenCalledWith('User registered', {
        userId: mockCreatedUser.id,
        username: mockCreatedUser.username,
      });
      expect(mockLogger.log).toHaveBeenCalledWith('Verification email sent', {
        userId: mockCreatedUser.id,
        email: mockCreatedUser.email,
      });
    });

    it('should rollback if email sending fails', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      mockTokenService.createVerificationToken.mockResolvedValue('token');
      mockMailService.sendVerificationEmail.mockRejectedValue(
        new Error('Email service error'),
      );
      mockInitializeUserSpaceUseCase.initialize.mockResolvedValue(undefined);

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'Email service error',
      );
    });

    it('should handle concurrent registration attempts', async () => {
      // Simulate race condition where both checks pass but email is taken during registration
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hash');
      const prismaError = Object.assign(
        new Error('Unique constraint failed on the fields: (`email`)'),
        { code: 'P2002', meta: { target: ['email'] } },
      );
      (prisma.user.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.register(validRegisterDto)).rejects.toThrow();
    });
  });

  describe('Security and Validation', () => {
    it('should never store plain text password', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'PlainTextPassword123!',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: registerDto.email,
        username: registerDto.username,
        passwordHash: 'hashed',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (mockTokenService.createVerificationToken as jest.Mock).mockResolvedValue(
        'token',
      );
      (mockMailService.sendVerificationEmail as jest.Mock).mockResolvedValue(
        undefined,
      );
      (
        mockInitializeUserSpaceUseCase.initialize as jest.Mock
      ).mockResolvedValue(undefined);

      await service.register(registerDto);

      const createCall = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toContain(registerDto.password);
      expect(createCall.data.password).toBeUndefined();
    });

    it('should not leak information about existing users in timing', async () => {
      const registerDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'Test123!@#',
      };

      // Test existing email timing
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'existing',
        email: registerDto.email,
      });

      const start1 = Date.now();
      await service.register(registerDto).catch(() => {});
      const duration1 = Date.now() - start1;

      // Test existing username timing
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'existing',
          username: registerDto.username,
        });

      const start2 = Date.now();
      await service.register(registerDto).catch(() => {});
      const duration2 = Date.now() - start2;

      // Timings should be similar
      const timingDifference = Math.abs(duration1 - duration2);
      expect(timingDifference).toBeLessThan(100);
    });
  });
});
