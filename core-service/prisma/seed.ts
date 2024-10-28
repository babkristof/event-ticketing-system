import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            passwordHash: '$2b$12$.TUQJMSPZebywdc4KtkEjuM1Q2emy.HQ0iN.ZHuse804QvuO0PZI.', //password:123456
            role: Role.ADMIN,
        },
    });

    const regularUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            name: 'Regular User',
            email: 'user@example.com',
            passwordHash: '$2b$12$cz/xyzkwejRO3jMFGikdL.Jba8TJDbX5HuRil/j5J/uO5j2HziOZa', //password:123456
            role: Role.CUSTOMER,
        },
    });

    const event1 = await prisma.event.create({
        data: {
            name: 'Concert in the Park',
            description: 'An outdoor concert with various artists.',
            date: new Date('2024-11-15T18:00:00.000Z'),
            venue: 'Central Park',
            totalTickets: 500,
            availableTickets: 500,
            createdBy: adminUser.id,
        },
    });

    const event2 = await prisma.event.create({
        data: {
            name: 'Food and Wine Festival',
            description: 'Enjoy the best of local food and wines.',
            date: new Date('2024-11-10T12:00:00.000Z'),
            venue: 'Downtown Square',
            totalTickets: 300,
            availableTickets: 300,
            createdBy: adminUser.id,
        },
    });
    const ticketCount = 2;
    const booking = await prisma.booking.create({
        data: {
            userId: regularUser.id,
            eventId: event1.id,
            ticketCount: ticketCount,
        },
    });

    await prisma.event.update({
        where: { id: event1.id },
        data: {
            availableTickets: event1.availableTickets - ticketCount,
        },
    });
    console.log('Seeding completed');
    console.log({ adminUser, regularUser, event1, event2, booking });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
