import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { SpaceResponseDto } from '@nucleus/domain';
import { DuplicateSpaceUseCase } from '../providers/duplicate-space.usecase';
import { SpaceController } from '../space.controller';
import { SpaceService } from '../space.service';

describe('SpaceController', () => {
  let controller: SpaceController;

  const mockSpaceResponse = {
    id: 'space-123',
    ownerId: 'user-123',
    name: 'Test Space',
    icon: '🚀',
    createdAt: new Date('2024-01-01'),
    sections: [],
  } as unknown as SpaceResponseDto;

  const mockSpaceService = {
    create: jest.fn<() => Promise<SpaceResponseDto>>(),
    findAll: jest.fn<() => Promise<SpaceResponseDto[]>>(),
    findOne: jest.fn<() => Promise<SpaceResponseDto>>(),
    update: jest.fn<() => Promise<SpaceResponseDto>>(),
    remove: jest.fn<() => Promise<SpaceResponseDto>>(),
  };

  const mockDuplicateSpaceUseCase = {
    execute: jest.fn<() => Promise<SpaceResponseDto>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        { provide: SpaceService, useValue: mockSpaceService },
        { provide: DuplicateSpaceUseCase, useValue: mockDuplicateSpaceUseCase },
        Reflector,
      ],
    }).compile();

    controller = module.get<SpaceController>(SpaceController);
  });

  describe('create', () => {
    it('should call spaceService.create with userId and dto', async () => {
      const dto = { name: 'New Space', icon: '🚀' };
      mockSpaceService.create.mockResolvedValue(mockSpaceResponse);

      const result = await controller.create('user-123', dto);

      expect(result).toEqual(mockSpaceResponse);
      expect(mockSpaceService.create).toHaveBeenCalledWith('user-123', { ...dto });
    });
  });

  describe('findAll', () => {
    it('should call spaceService.findAll with userId', async () => {
      mockSpaceService.findAll.mockResolvedValue([mockSpaceResponse]);

      const result = await controller.findAll('user-123');

      expect(result).toEqual([mockSpaceResponse]);
      expect(mockSpaceService.findAll).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findOne', () => {
    it('should call spaceService.findOne with id', async () => {
      mockSpaceService.findOne.mockResolvedValue(mockSpaceResponse);

      const result = await controller.findOne('space-123');

      expect(result).toEqual(mockSpaceResponse);
      expect(mockSpaceService.findOne).toHaveBeenCalledWith('space-123');
    });
  });

  describe('update', () => {
    it('should call spaceService.update with id and dto', async () => {
      const dto = { name: 'Updated' };
      mockSpaceService.update.mockResolvedValue({ ...mockSpaceResponse, name: 'Updated' } as SpaceResponseDto);

      const result = await controller.update('space-123', dto);

      expect(result.name).toBe('Updated');
      expect(mockSpaceService.update).toHaveBeenCalledWith('space-123', dto);
    });
  });

  describe('remove', () => {
    it('should call spaceService.remove with id', async () => {
      mockSpaceService.remove.mockResolvedValue(mockSpaceResponse);

      const result = await controller.remove('space-123');

      expect(result).toEqual(mockSpaceResponse);
      expect(mockSpaceService.remove).toHaveBeenCalledWith('space-123');
    });
  });

  describe('duplicate', () => {
    it('should call duplicateSpaceUseCase.execute with id, userId, and name', async () => {
      mockDuplicateSpaceUseCase.execute.mockResolvedValue(mockSpaceResponse);

      const result = await controller.duplicate('space-123', 'user-123', { name: 'Copy' });

      expect(result).toEqual(mockSpaceResponse);
      expect(mockDuplicateSpaceUseCase.execute).toHaveBeenCalledWith('space-123', 'user-123', { newName: 'Copy' });
    });

    it('should pass undefined newName when body has no name', async () => {
      mockDuplicateSpaceUseCase.execute.mockResolvedValue(mockSpaceResponse);

      await controller.duplicate('space-123', 'user-123', {});

      expect(mockDuplicateSpaceUseCase.execute).toHaveBeenCalledWith('space-123', 'user-123', { newName: undefined });
    });
  });
});
