import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UserResponseDto } from '@nucleus/domain';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserResponse = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    icon: null,
    isVerified: true,
    createdAt: new Date('2024-01-01'),
  } as unknown as UserResponseDto;

  const mockUserService = {
    findById: jest.fn<() => Promise<UserResponseDto>>(),
    update: jest.fn<() => Promise<UserResponseDto>>(),
    remove: jest.fn<() => Promise<UserResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getCurrentUser', () => {
    it('should call userService.findById with userId', async () => {
      mockUserService.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.getCurrentUser('user-123');

      expect(result).toEqual(mockUserResponse);
      expect(mockUserService.findById).toHaveBeenCalledWith('user-123');
      expect(mockUserService.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCurrentUser', () => {
    it('should call userService.update with userId and dto', async () => {
      const updateDto = { username: 'newname' };
      const updatedUser = {
        ...mockUserResponse,
        username: 'newname',
      } as unknown as UserResponseDto;
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateCurrentUser('user-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith('user-123', updateDto);
      expect(mockUserService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeCurrentUser', () => {
    it('should call userService.remove with userId', async () => {
      mockUserService.remove.mockResolvedValue(mockUserResponse);

      const result = await controller.removeCurrentUser('user-123');

      expect(result).toEqual(mockUserResponse);
      expect(mockUserService.remove).toHaveBeenCalledWith('user-123');
      expect(mockUserService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
