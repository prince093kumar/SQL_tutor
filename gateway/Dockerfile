FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm install --filter gateway...
RUN pnpm deploy --legacy --filter gateway --prod /prod/gateway

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/gateway .
EXPOSE 3000
CMD ["node", "src/server.js"]
