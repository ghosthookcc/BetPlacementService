# ---- build ----
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG PUBLIC_API_URL=http://localhost:8080
ENV PUBLIC_API_URL=${PUBLIC_API_URL}

RUN pnpm build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app

RUN addgroup -S www && \
    adduser -S www -G www

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/dist ./dist

USER www:www
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]