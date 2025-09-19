import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (p: string) => `hashed:${p}`),
  compare: jest.fn(async (p: string, h: string) => h === `hashed:${p}`),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: any };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    } as any;

    jwt = {
      signAsync: jest.fn(async () => 'token-123'),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('should register a user', async () => {
    prisma.user.create.mockResolvedValue({ id: 1, email: 'a@b.com', role: 'user' });

    const result = await service.register('a@b.com', 'pass');

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { email: 'a@b.com', password: 'hashed:pass', role: 'user' },
    });
    expect(result).toEqual({ id: 1, email: 'a@b.com', role: 'user' });
  });

  it('should login and return jwt token', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, email: 'u@x.com', role: 'admin', password: 'hashed:secret' });

    const res = await service.login('u@x.com', 'secret');

    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 2, email: 'u@x.com', role: 'admin' });
    expect(res).toEqual({ accessToken: 'token-123' });
  });

  it('should throw on invalid credentials - unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login('none@x.com', 'pw')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw on invalid credentials - wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 3, email: 'u@x.com', role: 'user', password: 'hashed:not-match' });
    await expect(service.login('u@x.com', 'secret')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});


