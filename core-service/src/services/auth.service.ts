import prismaClient from '../database/prismaClient';
import { compare, genSalt, hashSync } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import { BadRequestException } from '../exceptions/BadRequestException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ErrorCode } from '../exceptions/ErrorCode';
import { AuthPayload, LoginResponse } from '../types/auth';
import { User } from '@prisma/client';
import { LoginInput, SignUpInput } from '../schemas/auth.schema';
import { toPublicUser } from '../utils/user.util';

export const signupService = async ({ name, email, password }: SignUpInput): Promise<User> => {
  const existingUser = await prismaClient.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
  }
  const salt = await genSalt(Number(config.saltRounds));
  const hashedPassword = hashSync(password, salt);
  return prismaClient.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword
    }
  });
};

export const loginService = async ({ email, password }: LoginInput): Promise<LoginResponse> => {
  const user = await prismaClient.user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundException('User does not exist!', ErrorCode.USER_NOT_FOUND);
  }
  const passwordMatches = await compare(password, user.passwordHash);
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
  const user = await prismaClient.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
  }
  return user;
};
