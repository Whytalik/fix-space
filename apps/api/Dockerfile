FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app


FROM base AS pruner
RUN npm install -g turbo@2.8.0 --ignore-scripts
COPY . .
RUN turbo prune @fixspace/api --docker


FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --ignore-scripts


FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .


ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unused"

WORKDIR /app/packages/database
RUN pnpm exec prisma generate
WORKDIR /app
RUN pnpm turbo build --filter=@fixspace/database --filter=@fixspace/domain --no-cache

RUN pnpm turbo build --filter=@fixspace/api --no-cache


FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["sh", "-c", "cd /app/packages/database && npx prisma migrate deploy && cd /app/apps/api && exec node dist/main.js"]
