# Agent Administratif RAG - Design

## Contexte

Assistant IA pour simplifier les démarches administratives. Backend en Hono, déployé sur VPS Ikoula via Docker, exposé via Telegram.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Telegram   │────▶│   Caddy     │────▶│  Backend    │
│   (user)    │     │  (HTTPS)    │     │  (Hono)     │
└─────────────┘     └─────────────┘     └─────────────┘
                                                 │
                    ┌─────────────┐              │
                    │  PostgreSQL │◀─────────────┘
                    │   (Neon)    │
                    └─────────────┘
```

### Composants

- **Backend** : Hono sur Node.js, container `backend_hono`
- **Reverse proxy** : Caddy (container existant)
- **Base de données** : PostgreSQL Neon avec pgvector
- **Auth** : better-auth
- **LLM** : OpenRouter (fallback Ollama possible)

---

## Phase 1 : Déploiement VPS & Telegram

### 1.1 Préparation sur VPS

```bash
# Se connecter en SSH
ssh user@ikoula

# Cloner/réparer le projet
git clone https://github.com/joris-villet/agent-administratif-hono
cd agent-administratif-hono

# Vérifier les variables d'environnement
# DATABASE_URL, OPENROUTER_API_KEY, TELEGRAM_BOT_TOKEN, etc.
```

### 1.2 Configuration Caddy

Caddy doit être dans le même réseau Docker que le backend.

**Caddyfile ou config docker** :
```
backend:7000 {
    reverse_proxy backend_hono:7000
}
```

### 1.3 Déploiement backend

```bash
# Build et démarrage
docker compose -f docker/backend.yaml up -d --build
```

### 1.4 Webhook Telegram

```bash
# Depuis local (ou VPS si expose)
bun run set:telegram:prod
```

Le script doit appeler :
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://ton-domaine.com/api/telegram
```

### 1.5 Vérification

- Tester `https://ton-domaine.com/ping`
- Envoyer un message au bot Telegram
- Vérifier les logs : `docker logs backend_hono`

---

## Phase 2 : Outils de l'agent

### 2.1 Définition des tools

Outils initiaux à développer :
- **search_documents** : Recherche vectorielle dans les docs uploadés
- **get_document_summary** : Résumé d'un document
- **extract_info** : Extraction de données depuis un document
- **list_user_documents** : Liste des documents d'un utilisateur

### 2.2 Implémentation

- Créer `src/agent/tools/`
- Intégrer LangChain tools
- Configurer le graph LangGraph pour l'agent

---

## Phase 3 : Frontend RAG

### 3.1 Stack frontend

- **Astro** : SSR pour le site principal
- **SvelteKit** : Routes API et interactions dynamiques

### 3.2 Fonctionnalités CRUD

- **Upload** : PDF, PNG, JPEG, DOCX
- **Liste** : Documents par utilisateur
- **Suppression** : Supprimer un document et ses vecteurs
- **Détail** : Visualiser un document

### 3.3 Ingestion RAG

- **Chunking** : Découper les docs en passages
- **Embeddings** : Générer les vecteurs via OpenRouter
- **Stockage** : PostgreSQL + pgvector

### 3.4 Retrieval

- Recherche par similarité (cosine)
- Ranking des résultats
- Contexte dans les prompts LLM

---

## Ordre d'implémentation recommandé

1. Phase 1 (déploiement Telegram) → prioritaire
2. Phase 2 (tools agent)
3. Phase 3 (frontend RAG)

---

## Contraintes

- Telegram seul pour la phase 1
- HTTPS via Caddy déjà configuré
- Base de données Neon existante