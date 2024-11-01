import { getPrismaClient } from '../../../src/database/prismaClient';
import { hashPassword } from '../../../src/utils/password.util';
import { Role } from '@prisma/client';

export const REGISTERED_USER = {
  name: 'registeredUser',
  email: 'registered@example.com',
  password: 'hashedpassword',
  role: Role.CUSTOMER
};

export const ADMIN_USER = {
  name: 'adminUser',
  email: 'admin@example.com',
  password: 'hashedpassword',
  role: Role.ADMIN
};

export const SAMPLE_EVENT = {
  name: 'Sample Event',
  description: 'A description for the sample event.',
  date: new Date('2024-11-16T14:15:00.000Z'),
  venue: 'Sample Venue',
  totalTickets: 100
};

export const PAST_EVENT = {
  name: 'Sample Event',
  description: 'A description for the sample event.',
  date: new Date('2022-11-16T14:15:00.000Z'),
  venue: 'Sample Venue',
  totalTickets: 100
};

export async function seedTestUser(): Promise<number> {
  const user = await getPrismaClient().user.create({
    data: {
      name: REGISTERED_USER.name,
      email: REGISTERED_USER.email,
      passwordHash: await hashPassword(REGISTERED_USER.password),
      role: REGISTERED_USER.role
    }
  });
  return user.id;
}

export async function seedAdminUser(): Promise<number> {
  const admin = await getPrismaClient().user.create({
    data: {
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      passwordHash: await hashPassword(ADMIN_USER.password),
      role: ADMIN_USER.role
    }
  });
  return admin.id;
}

export async function seedEvent(
  createdByUserId: number,
  eventData: typeof SAMPLE_EVENT = SAMPLE_EVENT
): Promise<number> {
  const event = await getPrismaClient().event.create({
    data: {
      ...eventData,
      availableTickets: SAMPLE_EVENT.totalTickets,
      createdBy: createdByUserId
    }
  });
  return event.id;
}

export async function seedBooking(userId: number, eventId: number, ticketCount: number): Promise<number> {
  const booking = await getPrismaClient().booking.create({
    data: {
      userId,
      eventId,
      ticketCount
    }
  });

  await getPrismaClient().event.update({
    where: { id: eventId },
    data: {
      availableTickets: { decrement: ticketCount }
    }
  });

  return booking.id;
}
export async function resetDb() {
  await getPrismaClient().$transaction([
    getPrismaClient().booking.deleteMany(),
    getPrismaClient().event.deleteMany(),
    getPrismaClient().user.deleteMany()
  ]);
}
