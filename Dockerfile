# Stage 1: Dependencies
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN bun install --frozen-lockfile

# Stage 2: Build
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

# Stage 3: Runtime
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start with dumb-init and bind to 0.0.0.0 for Scaleway health detection
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "apps/api/dist/index.js"]
