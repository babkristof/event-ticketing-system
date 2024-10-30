# Event Ticketing System
This project is a microservices-based Event Ticketing System composed of two primary services:

1. **Core Service** - REST API service using Express for manages user registration, event creation, ticket bookings, and health checks.
2. **Notification Service** - Processes email notifications using BullMQ and Redis, sending confirmations and cancellations to users.

## Tech Stack
- **Node.js**: 20.x
- **Express**: 4.x
- **PostgreSQL**: 17.x
- **Redis**: 7.x
- **BullMQ**: For managing email queues
- **Prisma**: Database ORM for PostgreSQL
- **Nodemailer**: Email sending via SMTP
- **Docker** and **Docker Compose**: For containerized deployments
- **Mailhog**: Local SMTP server for email testing (development)

## Table of Contents
- [Project Overview](#project-overview)
- [Core Service](#core-service)
    - [Features](#features)
    - [Endpoints](#endpoints)
    - [Setup](#setup)
- [Notification Service](#notification-service)
    - [Features](#features)
    - [Setup](#setup)
- [Running with Docker Compose](#running-with-docker-compose)
- [Testing](#testing)

## Project Overview
The Event Ticketing System allows users to register, create events, and book tickets. Email notifications are sent for successful bookings or cancellations.

## Core Service
### Features
- **User Management** - Register, login, and manage users.
- **Event Management** - Create and manage events with available tickets.
- **Ticket Booking** - Book tickets and receive notifications.
- **Health Check** - Monitors database and Redis connection health.

### Endpoints
- `/api/auth/` - User management, register, login.
- `/api/users/` - Get logged in user info.
- `/api/events` - Managing events.
- `/api/bookings` - Book tickets for an event or cancel them.
- `GET /health` - Check health status of the service, including database and Redis connectivity.

### Setup
To run the core service locally:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run database migrations and seeds:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
3. Start the server:
   ```bash
   npm run start
   ```

## Notification Service
### Features
- **Job Queue** - Uses BullMQ with Redis to queue and process emails.
- **Email Notifications** - Sends emails on successful bookings and cancellations.

### Setup
To run the notification service locally:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the email worker:
   ```bash
   npm run start
   ```

## Running with Docker Compose
To run the entire system with dependencies (PostgreSQL, Redis, Mailhog) using Docker Compose:
1. Build and start services:
   ```bash
   docker-compose -f docker-compose-dev.yml up --build
   ```
2. Access Mailhog for email testing at [http://localhost:8025](http://localhost:8025).

## Testing
For running unit and integration tests with coverage report:
```bash
npm run test
```
