# Stage 1: Install dependencies
FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:24-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS runner
WORKDIR /app

# Keep the pinned base image reproducible while applying Alpine security updates.
RUN apk upgrade --no-cache

ENV NODE_ENV=production

RUN rm -rf \
      /opt/yarn-v${YARN_VERSION} \
      /root/.cache/yarn \
      /root/.npm \
      /usr/local/lib/node_modules/npm \
    && rm -f \
      /usr/local/bin/npm \
      /usr/local/bin/npx \
      /usr/local/bin/yarn \
      /usr/local/bin/yarnpkg \
    && ! command -v npm \
    && ! command -v npx \
    && ! command -v yarn \
    && ! command -v yarnpkg \
    && node --version

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ARG BUILD_REVISION=development
RUN printf '{"revision":"%s"}\n' "$BUILD_REVISION" > /app/public/deployment-version.json
LABEL org.opencontainers.image.revision=$BUILD_REVISION

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
