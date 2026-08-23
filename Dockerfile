# syntax=docker/dockerfile:1

# Base image with pnpm enabled
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables at build time
# (NEXT_PUBLIC_* values are baked into the client bundle)
# The three URL vars default to sentinel tokens instead of real domains:
# they still get inlined into the client bundle at build time, but
# docker-entrypoint.sh rewrites those tokens to the real runtime values on
# container start. Lets one built image be redeployed against different
# domains (self-hosted / airgapped installs) without a rebuild. Pass real
# URLs as build-args instead for the classic bake-only behavior.
ARG NEXT_PUBLIC_API_URL=__RUNTIME_NEXT_PUBLIC_API_URL__
ARG NEXT_PUBLIC_APP_URL=__RUNTIME_NEXT_PUBLIC_APP_URL__
ARG NEXT_PUBLIC_DOCS_URL=__RUNTIME_NEXT_PUBLIC_DOCS_URL__
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_DEMO_EMAIL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_DOCS_URL=${NEXT_PUBLIC_DOCS_URL}
ENV NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL}
ENV NEXT_PUBLIC_DEMO_EMAIL=${NEXT_PUBLIC_DEMO_EMAIL}
ENV NEXT_TELEMETRY_DISABLED=1

# Imprint / Privacy data is read at request time (no NEXT_PUBLIC_ prefix), so
# it does NOT need to be baked in at build time — it's injected by the
# orchestrator (docker compose, GitHub Actions, etc.) at runtime.

RUN pnpm build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
