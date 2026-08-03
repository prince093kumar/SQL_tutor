FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

COPY packages ./packages
COPY services/sql-service ./services/sql-service

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --filter sql-service... \
    --prod

WORKDIR /app/services/sql-service

EXPOSE 3002

CMD ["node", "src/server.js"]
