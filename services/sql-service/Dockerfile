FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY . .
RUN pnpm install --filter sql-service... --frozen-lockfile
RUN pnpm deploy --filter sql-service --prod /prod/sql-service

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/sql-service .
EXPOSE 3002
CMD ["node", "src/server.js"]
