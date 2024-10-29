import { User } from '@prisma/client';

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;