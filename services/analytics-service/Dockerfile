FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY . .
RUN pnpm install --filter analytics-service... --frozen-lockfile
RUN pnpm deploy --filter analytics-service --prod /prod/analytics-service

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/analytics-service .
EXPOSE 3004
CMD ["node", "src/server.js"]
