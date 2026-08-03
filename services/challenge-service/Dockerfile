FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

COPY packages ./packages
COPY services/challenge-service ./services/challenge-service

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install \
    --filter challenge-service... \
    --prod

WORKDIR /app/services/challenge-service

EXPOSE 3003

CMD ["node", "src/server.js"]
