import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: any };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('findAll returns list', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 1 }]);
  });

  it('findOne returns user when found', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    await expect(service.findOne(1)).resolves.toEqual({ id: 1 });
  });

  it('findOne throws when not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create uses prisma', async () => {
    prisma.user.create.mockResolvedValue({ id: 2 });
    await expect(service.create({ email: 'a@b.com', password: 'x', role: 'user' } as any)).resolves.toEqual({ id: 2 });
  });

  it('update uses prisma', async () => {
    prisma.user.update.mockResolvedValue({ id: 3 });
    await expect(service.update(3, { role: 'admin' } as any)).resolves.toEqual({ id: 3 });
  });

  it('remove uses prisma', async () => {
    prisma.user.delete.mockResolvedValue({ id: 4 });
    await expect(service.remove(4)).resolves.toEqual({ id: 4 });
  });
});


