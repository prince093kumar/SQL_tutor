FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm install --frozen-lockfile --filter sql-service...
RUN pnpm deploy --legacy --filter sql-service --prod /prod/sql-service

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/sql-service .
EXPOSE 3002
CMD ["node", "src/server.js"]
