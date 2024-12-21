FROM node:22-alpine AS base

FROM base AS builder
  RUN apk update
  RUN apk add --no-cache libc6-compat

  WORKDIR /app

  RUN npm install -g pnpm
  RUN npm install -g turbo

  COPY . .
  RUN turbo prune api --docker

FROM base AS installer
  RUN apk update
  RUN apk add --no-cache libc6-compat
  WORKDIR /app

  RUN npm install -g pnpm

  COPY --from=builder /app/out/json/ .
  RUN pnpm install

  COPY --from=builder /app/out/full/ .
  RUN pnpm turbo build

FROM base AS runner
  WORKDIR /app

  # Don't run production as root
  RUN addgroup --system --gid 1001 expressjs
  RUN adduser --system --uid 1001 expressjs
  USER expressjs
  COPY --from=installer /app .

  CMD node apps/api/dist/index.js
