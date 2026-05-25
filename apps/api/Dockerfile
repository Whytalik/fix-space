FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 1: prune monorepo to only what @nucleus/api needs
FROM base AS pruner
RUN npm install -g turbo@2
COPY . .
RUN turbo prune @nucleus/api --docker

# Stage 2: install deps from pruned lockfile (package.json stubs only)
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 3: build
FROM installer AS builder
WORKDIR /app
# Copy full source on top of the installed dependencies
COPY --from=pruner /app/out/full/ .

# prisma generate reads schema only — dummy URL satisfies Prisma 7 config validation
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres" pnpm --filter @nucleus/database db:generate
# Build dependencies first (no-cache to ensure artifacts are created in the image)
RUN pnpm turbo build --filter=@nucleus/database --filter=@nucleus/domain --no-cache
# Build the API
RUN pnpm turbo build --filter=@nucleus/api --no-cache

# Stage 4: minimal production image
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy root node_modules (with .pnpm store)
COPY --from=builder /app/node_modules ./node_modules
# Copy internal packages (entities/DTOs)
COPY --from=builder /app/packages ./packages
# Copy the API app with its own node_modules (symlinks) and build artifacts
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
