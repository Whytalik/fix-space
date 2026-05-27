FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 1: prune monorepo to only what @fixspace/api needs
FROM base AS pruner
RUN npm install -g turbo@2.8.0 --ignore-scripts
COPY . .
RUN turbo prune @fixspace/api --docker

# Stage 2: install deps from pruned lockfile (package.json stubs only)
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 3: build
FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .

WORKDIR /app/packages/database
RUN pnpm exec prisma generate
WORKDIR /app
RUN pnpm turbo build --filter=@fixspace/database --filter=@fixspace/domain --no-cache
# Build the API
RUN pnpm turbo build --filter=@fixspace/api --no-cache

# Stage 4: minimal production image
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/src/i18n ./apps/api/dist/i18n

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
