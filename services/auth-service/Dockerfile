FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy packages and services
COPY packages ./packages
COPY services ./services
COPY . .

# Install all dependencies
RUN pnpm install --filter auth-service... --frozen-lockfile

# Extract the auth-service and its dependencies
RUN pnpm deploy --legacy --filter auth-service --prod /prod/auth-service

# Production image
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /prod/auth-service .
EXPOSE 3001
CMD ["node", "src/server.js"]
