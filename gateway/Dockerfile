FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

COPY packages ./packages
COPY gateway ./gateway

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --filter gateway... \
    --prod

WORKDIR /app/gateway

EXPOSE 3000

CMD ["node", "src/server.js"]
