FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

RUN npm install -g pnpm && \
  pnpm install --frozen-lockfile

COPY . .

RUN cd /app/packages/backend && \
  pnpm run build && \
  cd /app/packages/frontend && \
  pnpm run build

FROM node:20-alpine AS production-stage

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

RUN apk add --no-cache gosu && \
  npm install -g pnpm && \
  cd /app/packages/backend && \
  pnpm install --frozen-lockfile --prod --filter backend

COPY packages/backend/entrypoint.sh ./packages/backend/entrypoint.sh
COPY packages/backend/prisma ./packages/backend/prisma
COPY packages/backend/prisma.config.ts ./packages/backend/prisma.config.ts
COPY --from=build-stage /app/packages/backend/dist /app/packages/backend/dist
COPY --from=build-stage /app/packages/frontend/dist /app/packages/backend/dist/frontend

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 backenduser && \
  chown -R backenduser:nodejs /app/packages/backend/ && \
  chmod +x /app/packages/backend/entrypoint.sh

WORKDIR /app/packages/backend

EXPOSE 3499

ENTRYPOINT ["/app/packages/backend/entrypoint.sh"]
