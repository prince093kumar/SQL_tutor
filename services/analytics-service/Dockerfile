FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

COPY packages ./packages
COPY services/analytics-service ./services/analytics-service

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --filter analytics-service... \
    --prod

WORKDIR /app/services/analytics-service

EXPOSE 3004

CMD ["node", "src/server.js"]
