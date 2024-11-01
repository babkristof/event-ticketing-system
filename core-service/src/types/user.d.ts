import { User } from '@prisma/client';

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export type UserWithBookings = PublicUser & {
  bookings: BookingDetail[];
};
