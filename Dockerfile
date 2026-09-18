# ==============================================================================
# Multi-Stage Production Dockerfile for "YukLa" Logistics Marketplace
# Optimized for Google Cloud Run (Container-based Node.js 22 LTS Runtime)
# ==============================================================================

# --- Stage 1: Build Dependencies & Bundle Assets ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools needed for node-gyp if native packages are compiled
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy full application source code
COPY . .

# Set production environment and build frontend SPA + backend server bundle
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Minimal Production Image ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create unprivileged service user for defense-in-depth container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 yukla && \
    mkdir -p /app/dist && \
    chown -R yukla:nodejs /app

# Copy production artifacts from builder
COPY --from=builder --chown=yukla:nodejs /app/package.json ./package.json
COPY --from=builder --chown=yukla:nodejs /app/dist ./dist
COPY --from=builder --chown=yukla:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=yukla:nodejs /app/prisma ./prisma
COPY --from=builder --chown=yukla:nodejs /app/db.json ./db.json

# Switch to non-root user
USER yukla

# Expose container port (Default: 3000, Cloud Run maps ingress traffic automatically)
EXPOSE 3000

# Health check for Cloud Run container liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start bundled production CommonJS server
CMD ["node", "dist/server.cjs"]
