# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of your code and build (if applicable)
COPY . .
# Uncomment the line below if you use TypeScript or a build step
# RUN npm run build

# Stage 2: Run
FROM node:20-slim
WORKDIR /app

# Copy only the necessary production files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Use a non-root user for better security
USER node

EXPOSE 3000

CMD ["node", "index.js"]