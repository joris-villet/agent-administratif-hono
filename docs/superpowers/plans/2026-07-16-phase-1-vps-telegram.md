# Phase 1: Déploiement VPS & Telegram

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déployer le backend Hono sur VPS via Docker, configurer Caddy comme reverse proxy, et activer Telegram

**Architecture:** Le backend sera containerisé avec Docker Compose, exposé via Caddy (reverse proxy HTTPS), et connected à Telegram via webhook.

**Tech Stack:** Docker, Docker Compose, Caddy, Hono, Telegram Bot API

## Global Constraints

- Domaine: `agent.solidweb.fr`
- Port backend: `7000`
- Réseau Docker: `proxy` (réseau existant de Caddy)
- Base de données: Neon PostgreSQL (déjà configurée)

---

### Task 1: Modifier backend.yaml pour utiliser le réseau `proxy`

**Files:**
- Modify: `docker/backend.yaml:1-15`

**Interfaces:**
- Produit: Container `backend_hono` dans le réseau `proxy`

- [ ] **Step 1: Modifier le fichier docker/backend.yaml**

Remplacer le contenu par:

```yaml
services:
  backend:
    container_name: backend_hono
    build: ../.
    ports:
      - "7000:7000"
    restart: always
    env_file: "../.env"
    volumes:
      - "./data:/data_backend"
    networks:
      - proxy

networks:
  proxy:
    external: true
```

- [ ] **Step 2: Commit**

```bash
git add docker/backend.yaml
git commit -m "fix: use proxy network for Caddy communication"
```

---

### Task 2: Préparer le déploiement sur VPS

**Files:**
- Vérifier: `.env` contient toutes les variables nécessaires

**Interfaces:**
- Consomme: DATABASE_URL, OPENROUTER_API_KEY, TELEGRAM_BOT_TOKEN, BETTER_AUTH_SECRET

- [ ] **Step 1: Vérifier les variables d'environnement requises**

Vérifier que `.env` contient:
- `DATABASE_URL` (Neon)
- `OPENROUTER_API_KEY`
- `TELEGRAM_BOT_TOKEN` (obtenu via @BotFather)
- `BETTER_AUTH_SECRET`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`

- [ ] **Step 2: Pousser les changements sur le VPS**

```bash
git add .
git commit -m "prep: ready for deployment"
git push origin main
```

---

### Task 3: Déployer le backend sur VPS

**Interfaces:**
- Consomme: Code poussé, réseau `proxy`
- Produit: Container `backend_hono` fonctionnel

- [ ] **Step 1: Se connecter au VPS et pull**

```bash
ssh user@ikoula
cd /path/to/agent-administratif-hono
git pull
```

- [ ] **Step 2: Builder et démarrer le container**

```bash
docker compose -f docker/backend.yaml up -d --build
```

- [ ] **Step 3: Vérifier les logs**

```bash
docker logs backend_hono
```

- [ ] **Step 4: Vérifier que le container tourne**

```bash
docker ps | grep backend_hono
```

---

### Task 4: Configurer Caddy comme reverse proxy

**Interfaces:**
- Consomme: Container `backend_hono` sur réseau `proxy`
- Produite: Route HTTPS fonctionnelle vers le backend

- [ ] **Step 1: Vérifier la config Caddy existante**

La config actuelle (`agent.solidweb.fr`) pointe vers `hono:7000`. Le container s'appelle `backend_hono`, il faut modifier:

```
agent.solidweb.fr {
  reverse_proxy backend_hono:7000
}
```

- [ ] **Step 2: Recharger Caddy**

```bash
docker exec caddy caddy reload
```

---

### Task 5: Tester l'endpoint HTTPS

- [ ] **Step 1: Tester le ping**

```bash
curl https://agent.solidweb.fr/ping
```

Réponse attendue: `"pong"`

- [ ] **Step 2: Vérifier les logs backend**

```bash
docker logs backend_hono
```

---

### Task 6: Configurer le webhook Telegram

**Interfaces:**
- Consomme: TOKEN Telegram, URL HTTPS du backend
- Produce: Webhook enregistré

- [ ] **Step 1: Lancer le script de configuration du webhook**

Depuis le VPS (ou local si accessible):

```bash
bun run set:telegram:prod
```

Ou manuellement:
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://agent.solidweb.fr/api/telegram"
```

- [ ] **Step 2: Vérifier le webhook**

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

---

### Task 7: Tester Telegram

- [ ] **Step 1: Envoyer un message au bot**

Ouvrir Telegram, chercher le bot, envoyer `/start`

- [ ] **Step 2: Vérifier la réponse**

Le bot devrait répondre (dépend de l'implémentation actuelle de `telegram.ts`)

- [ ] **Step 3: Vérifier les logs**

```bash
docker logs backend_hono
```

---

## Résumé des tâches

| # | Tâche | Commande clé |
|---|-------|--------------|
| 1 | Modifier backend.yaml | Modifier le réseau en `proxy` |
| 2 | Préparer .env | Vérifier les variables |
| 3 | Déployer sur VPS | `docker compose -f docker/backend.yaml up -d --build` |
| 4 | Configurer Caddy | Pointer vers `backend_hono:7000` |
| 5 | Tester HTTPS | `curl https://agent.solidweb.fr/ping` |
| 6 | Webhook Telegram | `bun run set:telegram:prod` |
| 7 | Test final | Envoyer un message sur Telegram |