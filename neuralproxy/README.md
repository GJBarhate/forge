# NeuralProxy

> A production-ready multi-tenant AI Gateway that routes LLM prompts intelligently, caches semantically, and streams live analytics.

![Java](https://img.shields.io/badge/Java-24-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen?logo=spring)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7.4-red?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Features

- **Semantic Caching** — Embeds prompts via Gemini text-embedding-004 and stores vectors in pgvector; similar prompts (cosine distance < 0.08) return cached responses without hitting a provider API — saving 60%+ in API costs
- **Multi-Provider Routing** — Routes intelligently between Google Gemini 2.0 Flash and OpenAI GPT-4o Mini; auto-selects the lowest-latency provider or honours an explicit preference
- **Circuit Breakers** — Resilience4j circuit breakers protect each provider; failed providers fall back automatically to the other
- **Real-Time Dashboard** — WebSocket/STOMP-powered live analytics: total requests, cache hit rate, avg latency, cost over time, and a live request feed
- **Dual Authentication** — JWT for human users (login via `/api/auth/login`) and API Key (X-API-Key header) for programmatic access
- **RBAC** — ADMIN and USER roles; tenant management and key generation require ADMIN
- **Per-Tenant Rate Limiting** — Bucket4j: 100 requests per 60 s per tenant, in-process with ConcurrentHashMap buckets
- **Prompt Playground** — Browser UI to test prompts, compare providers, and inspect latency, cost, and cache behaviour
- **Tenant Management** — Create tenants, generate API keys, and view key status in the UI

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│   Dashboard · Playground · Tenants · Real-Time WS   │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────┐
│               Backend (Spring Boot 3.4)              │
│  JWT Auth · API Key Auth · RBAC · Rate Limiting      │
│  Gateway Service → Semantic Cache → Provider Router  │
│  Analytics → WebSocket Publisher → STOMP /topic      │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
┌──────▼───────┐        ┌─────────▼──────────────────┐
│  PostgreSQL  │        │          Redis              │
│  + pgvector  │        │  Exact-match prompt cache   │
│  Migrations  │        │  Session / Rate limit state │
│  via Flyway  │        └────────────────────────────┘
└──────────────┘
       │ (via ProviderRouter)
┌──────▼───────────────────┐
│   Gemini 2.0 Flash        │
│   OpenAI GPT-4o Mini      │
└──────────────────────────┘
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker Desktop | 4.x+ |
| Gemini API Key | [Get one free](https://aistudio.google.com/app/apikey) |
| OpenAI API Key | Optional — Gemini works standalone |

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourorg/neuralproxy.git
cd neuralproxy
```

### 2. Set your API keys
```bash
export GEMINI_API_KEYS=your-gemini-api-key-here
export OPENAI_API_KEYS=your-openai-api-key-here   # optional
```

Or create a `.env` file in the project root:
```env
GEMINI_API_KEYS=your-gemini-api-key-here
OPENAI_API_KEYS=your-openai-api-key-here
JWT_SECRET=bXlzdXBlcnNlY3JldGtleWZvcm5ldXJhbHByb3h5YXBwbGljYXRpb24=
```

### 3. Build and run
```bash
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEYS` | Yes | `placeholder` | Comma-separated Gemini API keys; keys are round-robin rotated |
| `OPENAI_API_KEYS` | No | `placeholder` | Comma-separated OpenAI API keys |
| `JWT_SECRET` | No | Built-in base64 key | Base64-encoded HMAC-SHA256 secret for JWT signing |
| `DB_HOST` | No | `localhost` | PostgreSQL hostname |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | No | `neuralproxy` | PostgreSQL database name |
| `DB_USER` | No | `postgres` | PostgreSQL username |
| `DB_PASS` | No | `postgres` | PostgreSQL password |
| `REDIS_HOST` | No | `localhost` | Redis hostname |
| `REDIS_PORT` | No | `6379` | Redis port |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | None | Login → returns JWT |
| `POST` | `/api/auth/register` | None | Register a new user |
| `POST` | `/gateway/prompt` | JWT or X-API-Key | Send a prompt through the gateway |
| `GET` | `/api/analytics/summary` | JWT | Total requests, cache hit rate, avg latency, total cost |
| `GET` | `/api/analytics/requests` | JWT | Recent request logs (`?limit=20`) |
| `GET` | `/api/analytics/cost-over-time` | JWT | Hourly cost by provider (last 24 h) |
| `GET` | `/api/analytics/latency-by-provider` | JWT | p50 / p99 latency per provider |
| `GET` | `/api/tenants` | JWT (ADMIN) | List all tenants |
| `POST` | `/api/tenants` | JWT (ADMIN) | Create a tenant |
| `POST` | `/api/tenants/{id}/api-keys` | JWT (ADMIN) | Generate an API key |
| `GET` | `/api/tenants/{id}/api-keys` | JWT (ADMIN) | List API keys for tenant |
| `GET` | `/actuator/health` | None | Health check |
| `GET` | `/swagger-ui.html` | None | Swagger UI |

### Example: Send a prompt
```bash
curl -X POST http://localhost:8080/gateway/prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt>" \
  -d '{"prompt":"Explain quantum entanglement in one paragraph","provider":"GEMINI"}'
```

---

## Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@neuralproxy.dev` |
| Password | `admin123` |
| Role | `ADMIN` |
| Demo API Key (raw) | `np_demo_key_123456` |

---

## Local Development (without Docker)

### Backend
```bash
cd backend

# Start PostgreSQL and Redis locally first, then:
mvn spring-boot:run
```
The backend starts on port **8080**.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on port **5173** with Vite's dev server proxy forwarding `/api`, `/gateway`, and `/ws` to `localhost:8080`.

---

## Database Migrations

Flyway runs automatically on startup:

| Migration | Description |
|-----------|-------------|
| `V1__init_schema.sql` | Creates all tables with monthly partitions for `request_logs` |
| `V2__pgvector_setup.sql` | Enables the `vector` extension and creates an HNSW index |
| `V3__seed_data.sql` | Seeds admin tenant, admin user, and demo API key |

---

## License

MIT © NeuralProxy Contributors
