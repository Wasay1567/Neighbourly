FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
FROM base AS dependencies
RUN npm ci --only=production && \
    cp -R node_modules /tmp/node_modules && \
    npm ci

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS production

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy node_modules from dependencies stage
COPY --from=dependencies /tmp/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node healthcheck.js

# Start application
CMD ["node", "src/server.js"]