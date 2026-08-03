FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY . .
RUN pnpm install --filter gateway... --frozen-lockfile
RUN pnpm deploy --filter gateway --prod /prod/gateway

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/gateway .
EXPOSE 3000
CMD ["node", "src/server.js"]
