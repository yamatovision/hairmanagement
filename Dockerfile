FROM node:18-alpine as shared-build

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm ci
COPY shared/. ./
RUN npm run build

FROM node:18-alpine as backend-build

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci

# Copy shared module
COPY --from=shared-build /app/shared /app/shared
COPY backend/tsconfig.json .
COPY backend/src/ ./src/

# Build backend
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy build artifacts
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=shared-build /app/shared ./shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/v1/health || exit 1

# Expose port and start application
EXPOSE ${PORT:-8080}
CMD ["node", "dist/index.js"]