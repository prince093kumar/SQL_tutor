FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm i -g pnpm

# Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all source code (since workspaces depend on each other)
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile --filter auth-service...

# Extract the auth-service and its dependencies
RUN pnpm deploy --legacy --filter auth-service --prod /prod/auth-service

# Production image
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/auth-service .
EXPOSE 3001
CMD ["node", "src/server.js"]
