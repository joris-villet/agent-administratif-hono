# ---- Build stage ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copier package.json et installer
COPY package.json ./
RUN bun install

# Copier le reste du code
COPY . .

# Build TypeScript
RUN bun run build

# ---- Production stage ----
FROM oven/bun:1-alpine

WORKDIR /app

# Copier package.json et installer prod uniquement
COPY package.json ./
RUN bun install --prod

# Copier le build depuis le stage builder
COPY --from=builder /app/dist ./dist

EXPOSE 7000

CMD ["bun", "run", "dist/index.js"]