# ---- Build stage ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package.json bun.lock* ./

# Installer les deps avec bun
RUN bun install

# Copier le reste du code
COPY . .

# Build TypeScript
RUN bun run build

# ---- Production stage ----
FROM oven/bun:1-alpine

WORKDIR /app

# Copier uniquement les deps prod
COPY package.json bun.lock* ./
RUN bun install --production

# Copier le build depuis le stage builder
COPY --from=builder /app/dist ./dist

EXPOSE 7000

CMD ["node", "dist/index.js"]