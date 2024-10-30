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
import logger from "../config/logger";

export const signup = async ({ name, email, password }: SignUpData): Promise<User> => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await getPrismaClient().user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new BadRequestException('User already exists!', ErrorCode.USER_ALREADY_EXISTS);
  }
  const hashedPassword = await hashPassword(password);
  const newUser = getPrismaClient().user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword
    }
  });
  logger.info(`New user registered with email: ${email}`);
  return newUser;
};

export const login = async ({ email, password }: LoginData): Promise<LoginResponse> => {
  const normalizedEmail = email.toLowerCase();
  const user = await getPrismaClient().user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new NotFoundException('User does not exist!', ErrorCode.USER_NOT_FOUND);
  }
  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    logger.warn(`Failed login attempt for user ${email}`);
    throw new BadRequestException('Incorrect password', ErrorCode.INCORRECT_PASSWORD);
  }
  const token = jwt.sign({ userId: user.id } as AuthPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || '1h'
  });
  const publicUserData = toPublicUser(user);
  logger.info(`User ${user.id} logged in successfully`);
  return { user: publicUserData, token };
};

export const getAuthenticatedUser = async (userId: number): Promise<User> => {
  const user = await getPrismaClient().user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
  }
  logger.debug(`Authenticated user retrieved: ${userId}`);
  return user;
};
