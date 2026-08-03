FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY . .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --filter client...

# Build the client
WORKDIR /app/client
RUN pnpm build

# Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
# Copy custom nginx config if you want SPA routing to work
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
