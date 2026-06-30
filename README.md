# Agent Administratif

Assistant IA pour simplifier les démarches administratives — upload de documents, chat contextuel avec sources, gestion multi-threads.

## Stack

- **Framework** : [Hono](https://hono.dev/)
- **Auth** : [better-auth](https://better-auth.com)
- **Base de données** : PostgreSQL via [Neon](https://neon.tech) + extension [pgvector](https://github.com/pgvector/pgvector)
- **ORM** : Drizzle
- **LLM** : [OpenRouter](https://openrouter.ai) (fallback local possible)
- **Runtime** : [Bun](https://bun.sh)

## Prérequis

- [Bun](https://bun.sh) ≥ 1.x
- Un compte [Neon](https://neon.tech) (le plan gratuit suffit)
- Une clé API [OpenRouter](https://openrouter.ai/keys) — _optionnel, voir fallback local plus bas_

## Installation

```bash
git clone https://github.com/joris-villet/agent-administratif-hono
cd agent-administratif-hono
bun install
cp .env.example .env
```

## Variables d'environnement

Édite le fichier `.env` et renseigne les valeurs suivantes :

| Variable             | Description                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `USER_NAME`          | Nom de l'admin utilisé par le LLM dans le prompt                                                  |
| `ADMIN_EMAIL`        | Email de connexion de l'admin                                                                     |
| `ADMIN_PASSWORD`     | Mot de passe initial de l'admin                                                                   |
| `BETTER_AUTH_SECRET` | Secret better-auth. Génère-le avec `openssl rand -base64 32`                                      |
| `DATABASE_URL`       | URL de connexion PostgreSQL Neon (`postgresql://...?sslmode=verify-full&channel_binding=require`) |
| `OPENROUTER_API_KEY` | Clé API OpenRouter pour les appels LLM                                                            |

## Base de données

1. Crée un projet sur [Neon](https://neon.tech) (gratuit, sans carte bancaire).
2. Dans l'onglet **SQL Editor** de Neon, exécute :
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
   > Indispensable pour la recherche vectorielle (RAG sur les documents uploadés).
3. Applique le schéma Drizzle :
   ```bash
   bun db:push
   ```

> **Pourquoi Neon spécifiquement ?** Le plan gratuit de Neon supporte nativement l'extension `pgvector` sans configuration serveur, ce qui évite les galères d'installation locale ou de build Docker.

## Lancer le projet

```bash
bun dev
```

L'app tourne sur [http://localhost:7000](http://localhost:4321). Connecte-toi avec les identifiants `ADMIN_EMAIL` / `ADMIN_PASSWORD` renseignés dans `.env`.

## Fallback LLM local

Sans clé OpenRouter, tu peux utiliser un modèle local (Ollama, LM Studio, llama.cpp, etc.) en éditant la configuration du provider dans `src/agent/llm.ts` pour pointer vers n'importe quel endpoint compatible OpenAI. Le code est agnostique du provider.

## Licence

MIT
