FROM node:18-alpine as build

WORKDIR /app

# Copy package files for backend
COPY package*.json ./
RUN npm ci

# Copy shared module
COPY ../shared /app/shared/
WORKDIR /app/shared
RUN npm ci
WORKDIR /app

# Copy backend source and config
COPY tsconfig.json .
COPY src/ ./src/

# Create a symlink to shared module
RUN ln -s /app/shared /shared

# Build backend
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy build artifacts
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/v1/health || exit 1

# Expose port and start application
EXPOSE ${PORT:-8080}
CMD ["npm", "run", "start"]