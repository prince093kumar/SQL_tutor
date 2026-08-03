FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm install --frozen-lockfile --filter challenge-service...
RUN pnpm deploy --legacy --filter challenge-service --prod /prod/challenge-service

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/challenge-service .
EXPOSE 3003
CMD ["node", "src/server.js"]
