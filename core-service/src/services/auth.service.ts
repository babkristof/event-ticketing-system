import { getPrismaClient } from '../database/prismaClient';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import { hashPassword, comparePassword } from '../utils/password.util';
import { BadRequestException } from '../exceptions/BadRequestException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ErrorCode } from '../exceptions/ErrorCode';
import { AuthPayload, LoginResponse } from '../types/auth';
import { User } from '@prisma/client';
import { LoginData, SignUpData } from '../schemas/auth.schema';
import { toPublicUser } from '../utils/user.util';

export const signupService = async ({ name, email, password }: SignUpData): Promise<User> => {
  const existingUser = await getPrismaClient().user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
  }
  const hashedPassword = await hashPassword(password);
  return getPrismaClient().user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword
    }
  });
};

export const loginService = async ({ email, password }: LoginData): Promise<LoginResponse> => {
  const user = await getPrismaClient().user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundException('User does not exist!', ErrorCode.USER_NOT_FOUND);
  }
  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new BadRequestException('Incorrect password', ErrorCode.INCORRECT_PASSWORD);
  }
  const token = jwt.sign({ userId: user.id } as AuthPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || '1h'
  });
  const publicUserData = toPublicUser(user);

  return { user: publicUserData, token };
};

export const getAuthenticatedUser = async (userId: number): Promise<User> => {
  const user = await getPrismaClient().user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
  }
  return user;
};
