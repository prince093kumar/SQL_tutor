FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY . .
RUN pnpm install --filter challenge-service... --frozen-lockfile
RUN pnpm deploy --filter challenge-service --prod /prod/challenge-service

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/challenge-service .
EXPOSE 3003
CMD ["node", "src/server.js"]
