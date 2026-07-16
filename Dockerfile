# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package.json package-lock.json* ./

# Installer les deps (npm uniquement)
RUN npm install

# Copier le reste du code
COPY . .

# Build TypeScript
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine

WORKDIR /app

# Copier uniquement les deps prod
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copier le build depuis le stage builder
COPY --from=builder /app/dist ./dist

EXPOSE 7000

CMD ["node", "dist/index.js"]