FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm deploy --legacy --filter analytics-service --prod /prod/analytics-service

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/analytics-service .
EXPOSE 3004
CMD ["node", "src/server.js"]
