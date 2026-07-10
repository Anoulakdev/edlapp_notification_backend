# Base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# --- Dependencies Stage ---
FROM base AS dependencies

# Copy package configuration and lockfile
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies for building)
RUN npm install

# Copy TSConfig and Nest configuration files so Prisma generate can detect module resolution settings
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# --- Migration Stage ---
FROM dependencies AS migrator
# This stage has all devDependencies and is targeted by docker-compose for migrations

# --- Build Stage ---
FROM dependencies AS builder

# Copy source files
COPY src ./src/

# Build NestJS application
RUN npm run build

# Remove development dependencies to keep output small
RUN npm prune --production

# --- Production Stage ---
FROM base AS runner

WORKDIR /app

# Copy built application and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/config/firebase.service-account.json ./src/config/firebase.service-account.json

# Expose port (as configured in src/main.ts, defaulting to 4500)
EXPOSE 4500

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4500

# Start command
CMD ["npm", "run", "start:prod"]
