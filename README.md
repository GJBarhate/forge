# ⚡ Forge

### From idea to production blueprint in 30 seconds.

**Forge** is a multimodal AI developer tool that transforms voice brain-dumps, whiteboard sketches, and text descriptions into production-ready blueprints — PRDs, Prisma schemas, React component trees, and sprint boards — instantly.

---

## 🚀 What is Forge?

Most developers waste days on documentation that should take minutes. Forge eliminates that friction.

Describe your idea through **voice**, **image**, or **text** — and Forge's AI pipeline (powered by Gemini 2.5 Pro) instantly generates a complete, copy-paste-ready development blueprint covering architecture, schema, components, and sprints. What used to take a team of architects days now takes 30 seconds.

---

## ✨ Features

- **🎙️ Multimodal Input** — Voice brain-dumps (Web Speech API), whiteboard image uploads, text descriptions, and competitor URL analysis
- **📄 AI-Generated PRD** — Full Product Requirements Document with features, user stories, and acceptance criteria
- **🗄️ Prisma Schema** — Production-ready database schema, copy-paste into your project
- **🧩 React Component Tree** — Complete UI component hierarchy with props and structure
- **📋 Sprint Board** — 3-sprint task board with priorities, estimates, and assignable tickets
- **🔗 GitHub Intelligence** — Auto-discovers relevant open-source repositories for reference
- **📡 Real-Time Progress** — Live WebSocket progress updates during generation
- **🔁 Iteration Versioning** — Fork and refine blueprints like Git branches
- **🔐 Secure Auth** — JWT access tokens with HttpOnly refresh token cookies
- **💳 Credit System** — Metered usage with Razorpay payment integration
- **⚙️ Multi-Key AI Rotation** — Automatic Gemini API key failover on quota exhaustion
- **🛡️ 3-Tier Rate Limiting** — Global, auth, and AI-specific rate protection

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| React Router | 6.22.3 | Client-side routing |
| Vite | 5.2.0 | Build tool |
| Tailwind CSS | 3.4.1 | Styling |
| React Query | 5.28.0 | Server state & caching |
| Zustand | 4.5.2 | Auth state management |
| Socket.io Client | 4.7.4 | Real-time WebSocket |
| Axios | 1.6.7 | HTTP client |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥20.0.0 | Runtime |
| Express | 4.18.3 | Web framework |
| Socket.io | 4.7.4 | WebSocket server |
| Bull | 4.12.2 | Async job queue |
| Prisma | 5.10.2 | ORM |
| Google Gemini | 1.48.0 | AI generation |
| ioredis | 5.3.2 | Redis client |
| Zod | 3.22.4 | Input validation |
| Razorpay | 2.9.6 | Payment gateway |

### Infrastructure

| Service | Purpose |
|---|---|
| MySQL | Relational database |
| Redis / Upstash | Job queue & rate limiting |
| Google Gemini 2.5 Pro | Blueprint generation |
| GitHub API | Repository discovery |
| Razorpay | Payment processing |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│     React · React Router · Zustand · React Query    │
└────────────────────┬────────────────────────────────┘
                     │  REST API + WebSocket (Socket.io)
                     ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND                          │
│       Express · Socket.io · Bull Queue              │
│    Routes → Controllers → Services → Database       │
└──────────┬──────────────────────┬───────────────────┘
           │ SQL                  │ Queue Jobs
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────────┐
│     MySQL        │   │   Redis + Bull Worker        │
│  Users · Projects│   │  Forge Worker (AI Pipeline)  │
│  Iterations      │   │  Gemini · GitHub · Artifacts │
│  Artifacts       │   └──────────────────────────────┘
└──────────────────┘
```

**Generation Pipeline:**

```
User Input → POST /forge/generate → Bull Queue → Forge Worker
    ├── Analyze inputs           (10%)
    ├── Competitor analysis      (20–30%)
    ├── GitHub repo search       (30–40%)
    ├── Gemini 2.5 Pro call      (40–80%)
    ├── Parse & validate output  (80–90%)
    ├── Save artifacts to DB     (90–95%)
    └── Mark COMPLETE + emit WS  (100%)
```

---

## 📁 Project Structure

### Backend

```
forge-backend/
├── src/
│   ├── app.js                        # Express app setup
│   ├── server.js                     # HTTP + Socket.io entry
│   ├── config/
│   │   ├── env.js                    # Env validation (Zod)
│   │   ├── database.js               # Prisma client
│   │   ├── redis.js                  # Redis connection
│   │   └── gemini.js                 # API key rotation
│   ├── routes/                       # Endpoint definitions
│   ├── controllers/                  # Request handlers
│   ├── services/
│   │   ├── forge.service.js          # Generation orchestration
│   │   ├── gemini.service.js         # AI API calls
│   │   ├── github.service.js         # Repo search
│   │   └── competitor.service.js     # URL analysis
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── rateLimiter.middleware.js # 3-tier rate limiting
│   │   └── errorHandler.middleware.js
│   ├── queue/
│   │   ├── forge.queue.js            # Bull queue setup
│   │   └── forge.worker.js           # Async AI worker
│   ├── socket/
│   │   └── socket.manager.js         # WebSocket handlers
│   └── utils/
│       ├── promptBuilder.js          # Gemini prompt construction
│       └── ResponseParser.js         # Output parsing
├── prisma/
│   ├── schema.prisma                 # Data models
│   └── migrations/
└── package.json
```

### Frontend

```
forge-frontend/
├── src/
│   ├── App.jsx                       # Router setup
│   ├── pages/
│   │   ├── DashboardPage.jsx         # Project list
│   │   ├── NewProjectPage.jsx        # Project creation
│   │   └── ProjectDetailPage.jsx     # Blueprint viewer
│   ├── components/
│   │   ├── input/
│   │   │   ├── VoiceCapture.jsx      # Voice recorder
│   │   │   ├── ImageDropzone.jsx     # Image uploader
│   │   │   └── CompetitorInput.jsx   # URL input
│   │   └── output/
│   │       ├── PrdViewer.jsx
│   │       ├── SchemaEditor.jsx
│   │       ├── ComponentTree.jsx
│   │       └── SprintBoard.jsx
│   ├── hooks/
│   │   └── useSocket.js              # WebSocket hook
│   ├── store/
│   │   └── authStore.js              # Zustand auth state
│   └── services/
│       ├── api.js                    # Axios + interceptors
│       └── forgeService.js           # Generation API calls
└── package.json
```

---

## 📡 API Overview

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create new account |
| `POST` | `/api/v1/auth/login` | Login, receive tokens |
| `GET` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token |
| `GET` | `/api/v1/auth/me` | Get current user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/projects` | List user projects |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/projects/:id` | Get project details |
| `DELETE` | `/api/v1/projects/:id` | Soft delete |
| `POST` | `/api/v1/projects/:id/reiterate` | Fork iteration |

### Forge (AI Generation)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/forge/generate` | Start blueprint generation |
| `POST` | `/api/v1/forge/fork` | Fork an iteration |
| `GET` | `/api/v1/forge/jobs/:jobId` | Poll job status |

### Utilities

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/audio/transcribe` | Transcribe audio |
| `POST` | `/api/v1/competitor/analyze` | Analyze competitor URL |
| `POST` | `/api/v1/payments/order` | Create payment order |
| `POST` | `/api/v1/payments/verify` | Verify payment |
| `GET` | `/health` | Health check |

---

## 🗄️ Database Schema

```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String
  name           String?
  creditsBalance Int       @default(20)
  projects       Project[]
}

model Project {
  id         String        @id @default(cuid())
  userId     String
  name       String
  status     ProjectStatus @default(PROCESSING)  // PROCESSING | COMPLETE | FAILED
  deletedAt  DateTime?                            // Soft delete
  iterations Iteration[]
}

model Iteration {
  id        String        @id @default(cuid())
  projectId String
  parentId  String?                               // Supports branching
  jobId     Int?                                  // Bull queue job (for WebSocket room)
  status    ProjectStatus @default(PROCESSING)
  artifacts Artifact[]
}

model Artifact {
  id          String       @id @default(cuid())
  iterationId String
  type        ArtifactType  // PRD | SCHEMA | COMPONENT_TREE | TASK_BOARD | GITHUB_REPOS
  content     Json

  @@unique([iterationId, type])
}
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **MySQL** running locally
- **Redis** (local or [Upstash](https://upstash.com))
- **Google Gemini API key** — [Get one here](https://aistudio.google.com)
- **Razorpay account** _(optional, for payments)_

---

### 1. Clone the repository

```bash
git clone https://github.com/GJBarhate/forge.git
cd forge
```

### 2. Backend setup

```bash
cd forge-backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# → Edit .env with your credentials (see Environment Variables below)

# Push database schema
npx prisma db push

# (Optional) Seed sample data
npx prisma db seed

# Start development server
npm run dev
# ✅ Forge backend running on Port 5000
```

### 3. Frontend setup

```bash
cd forge-frontend

# Install dependencies
npm install

# Set environment variables
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env

# Start development server
npm run dev
# ✅ http://localhost:5173
```

### 4. Verify it works

Open [http://localhost:5173](http://localhost:5173), register an account, create a project, and watch a blueprint generate in real time.

---

## 🔑 Environment Variables

### Backend `.env`

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=mysql://user:password@localhost:3306/forge

# Redis
REDIS_URL=redis://localhost:6379

# AI — use one key or comma-separated for rotation
GEMINI_API_KEY=your_gemini_key_here
# GEMINI_API_KEYS=key1,key2,key3

# Authentication
JWT_ACCESS_SECRET=your_access_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=10000
AI_RATE_LIMIT_MAX=500

# Payments (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## ✨ Product Preview

<p align="center">
  <img src="./images/dashboard.png" width="900" alt="Dashboard Preview"/>
</p>

<p align="center">
  <em>Clean, powerful dashboard to manage your entire workflow.</em>
</p>

---

## ⚡ Core Experience

<p align="center">
  <img src="./images/processing.png" width="45%" alt="Processing"/>
  <img src="./images/git.png" width="45%" alt="Git Integration"/>
</p>

<p align="center">
  <img src="./images/completep.png" width="45%" alt="Completion"/>
  <img src="./images/razorpayment.png" width="45%" alt="Payments"/>
</p>

---

## 🧩 Additional Features

<p align="center">
  <img src="./images/setting.png" width="60%" alt="Settings"/>
</p>

<p align="center">
  <em>Fully customizable settings for a tailored experience.</em>
</p>

---

## 🔄 How It Works

### Blueprint Generation (End-to-End)

```
1. USER INPUT
   ├── Voice  →  Web Speech API transcription
   ├── Image  →  Whiteboard/sketch upload
   ├── Text   →  Direct description
   └── URL    →  Competitor website analysis

2. API CALL  →  POST /api/v1/forge/generate
   ├── Create Project (status: PROCESSING)
   ├── Create Iteration record
   ├── Enqueue Bull job to Redis
   └── Return { jobId, projectId }

3. WEBSOCKET  →  Frontend joins room forge-job:{jobId}
   └── Displays live progress bar via job:progress events

4. BULL WORKER  (async, background)
   ├──  10%  Analyze inputs
   ├──  30%  Competitor analysis
   ├──  40%  GitHub repository search
   ├──  80%  Gemini 2.5 Pro generation
   ├──  90%  Parse & validate output
   ├──  95%  Persist artifacts to database
   └── 100%  Emit job:complete → project status → COMPLETE

5. BLUEPRINT DISPLAY
   ├── React Query invalidates cache on job:complete
   ├── Fetches fresh project data
   └── Renders tabs: PRD · Schema · Components · Sprint Board
```

### Authentication Flow

```
Login  →  accessToken (memory/localStorage) + httpOnly refreshToken (cookie)
         ↓
Request  →  Axios injects Bearer token automatically
         ↓
401 received  →  Interceptor calls GET /auth/refresh
         ↓
New accessToken returned  →  Retry original request transparently
```

---

## 🚢 Deployment

### Backend (e.g., Railway, Render, EC2)

```bash
cd forge-backend
npm run build         # If applicable
npx prisma migrate deploy
node src/server.js
```

Set all production environment variables in your hosting provider's dashboard. For Redis, use [Upstash](https://upstash.com) for a serverless-compatible queue backend.

### Frontend (e.g., Vercel, Netlify)

```bash
cd forge-frontend
npm run build         # Outputs to /dist
```

Set `VITE_API_URL` and `VITE_SOCKET_URL` to your production backend URL.


## 🚀 Deploy

- **Frontend** — Vercel: connect repo, set `VITE_API_URL` in project settings.
- **Backend** — Render: set all `.env` variables, run `npm start` as separate service.

---

## 👤 Author

**Gaurav Barhate**  
Full-stack developer — building reliable infrastructure tooling.  
[GitHub](https://github.com/GJBarhate) · [LinkedIn](www.linkedin.com/in/gaurav-barhate-056175271)

---

<div align="center">

**⚡ Forge — Stop writing docs. Start shipping.**

</div>
