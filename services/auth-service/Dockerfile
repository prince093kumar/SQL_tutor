FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

COPY packages ./packages
COPY services/auth-service ./services/auth-service

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --filter auth-service... \
    --prod

WORKDIR /app/services/auth-service

EXPOSE 3001

CMD ["node", "src/server.js"]
