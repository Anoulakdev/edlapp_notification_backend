# Base image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# --- Build Stage ---
FROM base AS builder

# Copy package configuration
COPY package.json ./
# Copy pnpm-lock.yaml if it exists (using wildcard to prevent error if it doesn't exist)
COPY pnpm-lock.yam[l] ./

# Install dependencies (including devDependencies for building)
RUN pnpm install

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client
RUN pnpm prisma generate

# Copy tsconfig and source files
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

# Build NestJS application
RUN pnpm run build

# Remove development dependencies to keep output small
RUN pnpm prune --prod

# --- Production Stage ---
FROM base AS runner

WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Expose port (as configured in src/main.ts, defaulting to 4500)
EXPOSE 4500

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4500

# Start command
CMD ["pnpm", "run", "start:prod"]
