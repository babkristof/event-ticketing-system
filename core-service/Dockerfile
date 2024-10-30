FROM node:20.18.0-alpine3.20 as builder

RUN mkdir app
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build


FROM node:20.18.0-alpine3.20 AS runner

ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist .
COPY --from=builder /app/prisma ./prisma
RUN npm ci --omit=dev && npm prune --production && npm cache clear --force


CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/server.js"]
EXPOSE 3000
