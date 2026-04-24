# Stage 1: Build/Install
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

# Copy only files needed for installing dependencies
COPY package*.json ./

# Install dependencies (use --production for a smaller footprint)
RUN npm ci --omit=dev

# Stage 2: Production
FROM node:20-slim
WORKDIR /app

# Copy the installed node_modules and your application code
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Prune folders you don't need in production
RUN rm -rf .vscode

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]