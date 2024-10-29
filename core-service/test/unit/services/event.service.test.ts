import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { Event } from '@prisma/client';
import * as eventService from '../../../src/services/event.service';
import { getPrismaClient } from '../../../src/database/prismaClient';
import { NotFoundException } from '../../../src/exceptions/NotFoundException';
import logger from '../../../src/config/logger';
chai.use(chaiAsPromised);

describe('Event Service', () => {
    let mockPrismaClient: any;
    let mockEvent: Event;

    beforeEach(() => {
        mockEvent = {
            id: 1,
            name: 'Sample Event',
            description: 'An example event description',
            date: new Date('2024-11-16T13:15:00.000Z'),
            venue: 'Berlin',
            totalTickets: 200,
            availableTickets: 200,
            createdBy: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockPrismaClient = {
            event: {
                create: sinon.stub(),
                findUnique: sinon.stub(),
                findMany: sinon.stub()
            }
        };

        sinon.stub(getPrismaClient(), 'event').value(mockPrismaClient.event);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('create', () => {
        it('should create a new event successfully', async () => {
            mockPrismaClient.event.create.resolves(mockEvent);
            const eventData = {
                name: 'Sample Event',
                description: 'An example event description',
                date: new Date('2024-11-16T13:15:00.000Z'),
                venue: 'Berlin',
                totalTickets: 200
            };

            const result = await eventService.create(eventData, 1);

            expect(mockPrismaClient.event.create.calledOnce).to.be.true;
            expect(result).to.deep.equal(mockEvent);
        });
    });

    describe('get', () => {
        it('should return an event if found', async () => {
            mockPrismaClient.event.findUnique.resolves(mockEvent);
            const eventData = { id: 1 };

            const result = await eventService.get(eventData);

            expect(mockPrismaClient.event.findUnique.calledOnceWith({ where: { id: eventData.id } })).to.be.true;
            expect(result).to.deep.equal(mockEvent);
        });

        it('should throw NotFoundException if event is not found', async () => {
            mockPrismaClient.event.findUnique.resolves(null);
            const eventData = { id: 999 };

            await expect(eventService.get(eventData)).to.be.rejectedWith(NotFoundException, 'Event not found');
        });
    });

    describe('getAll', () => {
        it('should return all events', async () => {
            mockPrismaClient.event.findMany.resolves([mockEvent]);

            const result = await eventService.getAll();

            expect(mockPrismaClient.event.findMany.calledOnce).to.be.true;
            expect(result).to.deep.equal([mockEvent]);
        });

        it('should log a message if no events are found', async () => {
            mockPrismaClient.event.findMany.resolves([]);
            const loggerSpy = sinon.spy(logger, 'debug');
            const result = await eventService.getAll();

            console.log('loggerSpy.getCall(0).args[0]',loggerSpy.getCall(0).args[0]);
            expect(result).to.deep.equal([]);
            expect(loggerSpy.calledOnce).to.be.true;
            expect(loggerSpy.getCall(0).args[0]).to.be.equal('No events found in the database.');
        });
    });
});
