# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# If using TS or build step
RUN npm run build


# ---------- Production Stage ----------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled code
COPY --from=builder /app/dist ./dist

# If you have public/assets
# COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "dist/index.js"]
