import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TokenService } from '../token.service';
import { AppLogger } from '../../common/logger/app-logger.service';
import { prisma } from '@nucleus/database';

// Mock Prisma
jest.mock('@nucleus/database', () => ({
  prisma: {
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    emailVerificationToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let logger: AppLogger;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockLogger = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<AppLogger>(AppLogger);
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const userId = 'user-123';
      const username = 'testuser';
      const expectedToken = 'jwt-token-123';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateAccessToken(userId, username);

      expect(result).toBe(expectedToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        username,
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('should generate different tokens for different users', () => {
      mockJwtService.sign
        .mockReturnValueOnce('token-1')
        .mockReturnValueOnce('token-2');

      const token1 = service.generateAccessToken('user-1', 'username1');
      const token2 = service.generateAccessToken('user-2', 'username2');

      expect(token1).not.toBe(token2);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in username', () => {
      const userId = 'user-123';
      const username = 'test_user-123';
      const expectedToken = 'jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = service.generateAccessToken(userId, username);

      expect(result).toBe(expectedToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userId,
        username,
      });
    });
  });

  describe('createRefreshToken', () => {
    it('should create refresh token in database', async () => {
      const userId = 'user-123';
      const expectedTokenLength = 64; // 32 bytes in hex

      mockConfigService.get.mockReturnValue('7d');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const token = await service.createRefreshToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(expectedTokenLength);
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith('Refresh token created', {
        userId,
      });
    });

    it('should set expiration based on config', async () => {
      const userId = 'user-123';
      const expirationDays = '7d';

      mockConfigService.get.mockReturnValue(expirationDays);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      await service.createRefreshToken(userId);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'JWT_REFRESH_EXPIRATION',
        '7d',
      );

      const createCall = (prisma.refreshToken.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall.data.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate unique tokens for same user', async () => {
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue('7d');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const token1 = await service.createRefreshToken(userId);
      const token2 = await service.createRefreshToken(userId);

      expect(token1).not.toBe(token2);
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(2);
    });

    it('should store hashed token in database', async () => {
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue('7d');
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const rawToken = await service.createRefreshToken(userId);

      const createCall = (prisma.refreshToken.create as jest.Mock).mock
        .calls[0][0];
      const storedHash = createCall.data.tokenHash;

      // Raw token should not be stored
      expect(storedHash).not.toBe(rawToken);
      // Hash should be 64 characters (SHA-256)
      expect(storedHash.length).toBe(64);
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate correct refresh token', async () => {
      const rawToken = 'a'.repeat(64);
      const userId = 'user-123';
      const tokenId = 'token-id';

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
        id: tokenId,
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 1000000),
        revokedAt: null,
      });

      const result = await service.validateRefreshToken(rawToken);

      expect(result).toEqual({ userId, tokenId });
      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          tokenHash: expect.any(String),
          revokedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
      });
    });

    it('should return null for expired token', async () => {
      const rawToken = 'a'.repeat(64);

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateRefreshToken(rawToken);

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid or expired refresh token',
      );
    });

    it('should return null for revoked token', async () => {
      const rawToken = 'a'.repeat(64);

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateRefreshToken(rawToken);

      expect(result).toBeNull();
    });

    it('should return null for non-existent token', async () => {
      const rawToken = 'invalid-token';

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateRefreshToken(rawToken);

      expect(result).toBeNull();
    });

    it('should check token is not revoked', async () => {
      const rawToken = 'a'.repeat(64);

      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

      await service.validateRefreshToken(rawToken);

      expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            revokedAt: null,
          }),
        }),
      );
    });
  });

  describe('rotateRefreshToken', () => {
    it('should revoke old token and create new one', async () => {
      const oldTokenId = 'old-token-id';
      const userId = 'user-123';
      const newToken = 'new-token';

      mockConfigService.get.mockReturnValue('7d');
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({
        id: oldTokenId,
        revokedAt: new Date(),
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'new-token-id',
        userId,
        tokenHash: 'new-hash',
        expiresAt: new Date(),
      });

      const result = await service.rotateRefreshToken(oldTokenId, userId);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: oldTokenId },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Old refresh token revoked',
        {
          tokenId: oldTokenId,
        },
      );
    });

    it('should generate new token different from any previous', async () => {
      const oldTokenId = 'old-token-id';
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue('7d');
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'new-token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const token1 = await service.rotateRefreshToken(oldTokenId, userId);
      const token2 = await service.rotateRefreshToken(oldTokenId, userId);

      expect(token1).not.toBe(token2);
    });

    it('should set revocation timestamp on old token', async () => {
      const oldTokenId = 'old-token-id';
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue('7d');
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'new-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      await service.rotateRefreshToken(oldTokenId, userId);

      const updateCall = (prisma.refreshToken.update as jest.Mock).mock
        .calls[0][0];
      expect(updateCall.data.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke refresh token by raw token', async () => {
      const rawToken = 'a'.repeat(64);

      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await service.revokeRefreshToken(rawToken);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          tokenHash: expect.any(String),
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Refresh token revoked by hash',
      );
    });

    it('should only revoke non-revoked tokens', async () => {
      const rawToken = 'token';

      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 1,
      });

      await service.revokeRefreshToken(rawToken);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            revokedAt: null,
          }),
        }),
      );
    });

    it('should handle token that does not exist', async () => {
      const rawToken = 'non-existent-token';

      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      await expect(service.revokeRefreshToken(rawToken)).resolves.not.toThrow();
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should revoke all refresh tokens for user', async () => {
      const userId = 'user-123';

      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      await service.revokeAllUserRefreshTokens(userId);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'All refresh tokens revoked for user',
        { userId },
      );
    });

    it('should only revoke active tokens', async () => {
      const userId = 'user-123';

      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      await service.revokeAllUserRefreshTokens(userId);

      const call = (prisma.refreshToken.updateMany as jest.Mock).mock
        .calls[0][0];
      expect(call.where.revokedAt).toBeNull();
    });

    it('should handle user with no tokens', async () => {
      const userId = 'user-no-tokens';

      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      await expect(
        service.revokeAllUserRefreshTokens(userId),
      ).resolves.not.toThrow();
    });
  });

  describe('createVerificationToken', () => {
    it('should create verification token', async () => {
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue(24);
      (prisma.emailVerificationToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const token = await service.createVerificationToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64);
      expect(prisma.emailVerificationToken.create).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Verification token created',
        { userId },
      );
    });

    it('should set expiration based on config hours', async () => {
      const userId = 'user-123';
      const hours = 48;

      mockConfigService.get.mockReturnValue(hours);
      (prisma.emailVerificationToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      await service.createVerificationToken(userId);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'VERIFICATION_TOKEN_EXPIRATION_HOURS',
        24,
      );
    });

    it('should generate unique tokens', async () => {
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue(24);
      (prisma.emailVerificationToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const token1 = await service.createVerificationToken(userId);
      const token2 = await service.createVerificationToken(userId);

      expect(token1).not.toBe(token2);
    });

    it('should store hashed token', async () => {
      const userId = 'user-123';

      mockConfigService.get.mockReturnValue(24);
      (prisma.emailVerificationToken.create as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(),
      });

      const rawToken = await service.createVerificationToken(userId);

      const createCall = (prisma.emailVerificationToken.create as jest.Mock)
        .mock.calls[0][0];
      const storedHash = createCall.data.tokenHash;

      expect(storedHash).not.toBe(rawToken);
      expect(storedHash.length).toBe(64);
    });
  });

  describe('validateVerificationToken', () => {
    it('should validate correct verification token', async () => {
      const rawToken = 'a'.repeat(64);
      const userId = 'user-123';
      const tokenId = 'token-id';

      (prisma.emailVerificationToken.findFirst as jest.Mock).mockResolvedValue({
        id: tokenId,
        userId,
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 1000000),
        usedAt: null,
      });

      const result = await service.validateVerificationToken(rawToken);

      expect(result).toEqual({ userId, tokenId });
      expect(prisma.emailVerificationToken.findFirst).toHaveBeenCalledWith({
        where: {
          tokenHash: expect.any(String),
          usedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
      });
    });

    it('should return null for expired token', async () => {
      const rawToken = 'expired-token';

      (prisma.emailVerificationToken.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await service.validateVerificationToken(rawToken);

      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid or expired verification token',
      );
    });

    it('should return null for already used token', async () => {
      const rawToken = 'used-token';

      (prisma.emailVerificationToken.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await service.validateVerificationToken(rawToken);

      expect(result).toBeNull();
    });

    it('should check token has not been used', async () => {
      const rawToken = 'token';

      (prisma.emailVerificationToken.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await service.validateVerificationToken(rawToken);

      expect(prisma.emailVerificationToken.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usedAt: null,
          }),
        }),
      );
    });
  });

  describe('markVerificationTokenUsed', () => {
    it('should mark verification token as used', async () => {
      const tokenId = 'token-id';

      (prisma.emailVerificationToken.update as jest.Mock).mockResolvedValue({
        id: tokenId,
        usedAt: new Date(),
      });

      await service.markVerificationTokenUsed(tokenId);

      expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
        where: { id: tokenId },
        data: { usedAt: expect.any(Date) },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Verification token marked as used',
        { tokenId },
      );
    });

    it('should set current timestamp when marking as used', async () => {
      const tokenId = 'token-id';

      (prisma.emailVerificationToken.update as jest.Mock).mockResolvedValue({
        id: tokenId,
        usedAt: new Date(),
      });

      await service.markVerificationTokenUsed(tokenId);

      const updateCall = (prisma.emailVerificationToken.update as jest.Mock)
        .mock.calls[0][0];
      expect(updateCall.data.usedAt).toBeInstanceOf(Date);
    });
  });
});
