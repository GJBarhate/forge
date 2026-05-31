# 📘 FORGE - Complete Project Documentation

**Last Updated:** May 12, 2026

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Design](#architecture--design)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Pages & Features](#frontend-pages--features)
8. [Core Services & Business Logic](#core-services--business-logic)
9. [Authentication & Security](#authentication--security)
10. [Payment Integration](#payment-integration)
11. [Real-Time Features (WebSocket)](#real-time-features-websocket)
12. [AI Generation Pipeline](#ai-generation-pipeline)
13. [Queue System (Bull)](#queue-system-bull)
14. [Rate Limiting Strategy](#rate-limiting-strategy)
15. [Error Handling](#error-handling)
16. [Setup & Installation](#setup--installation)
17. [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

### What is Forge?

**Forge** is a multimodal AI developer tool that transforms voice brain-dumps, whiteboard sketches, and text descriptions into production-ready blueprints in **30 seconds**.

### Key Value Proposition

- 🎙️ **Multiple Input Formats** - Voice, image, text, or competitor URLs
- 📄 **Instant Blueprints** - PRDs, database schemas, React component trees, sprint boards
- 🔗 **GitHub Intelligence** - Discovers relevant open-source repos for reference
- 💳 **Metered Billing** - Credit-based system with Razorpay payments
- 📡 **Real-Time Progress** - WebSocket live updates during generation
- 🔄 **Iteration & Versioning** - Fork blueprints like Git branches
- 🛡️ **Enterprise Security** - JWT auth, rate limiting, API key rotation

### Target Users

- **Solo Developers** - Ship features faster without documentation overhead
- **Startups** - Go from idea to specification in seconds
- **Development Teams** - Standardize technical architecture quickly

---

## 🛠️ Tech Stack

### **Frontend**

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI component library |
| **Router** | React Router | 6.22.3 | Client-side navigation |
| **Build Tool** | Vite | 5.2.0 | Lightning-fast bundler |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| **State (Server)** | React Query | 5.28.0 | Server state & caching |
| **State (Client)** | Zustand | 4.5.2 | Auth & app state |
| **Real-Time** | Socket.io Client | 4.7.4 | WebSocket communication |
| **HTTP Client** | Axios | 1.6.7 | API requests |
| **Icons** | Lucide React | 0.358.0 | Icon components |
| **Toast Notifications** | React Hot Toast | 2.4.1 | User feedback |

### **Backend**

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | ≥20.0.0 | JavaScript runtime |
| **Framework** | Express | 4.18.3 | Web server & API |
| **Real-Time** | Socket.io | 4.7.4 | WebSocket server |
| **ORM** | Prisma | 5.10.2 | Database access layer |
| **Job Queue** | Bull | 4.12.2 | Async job processing |
| **Caching & Queue** | ioredis | 5.3.2 | Redis client |
| **AI Engine** | Google Gemini 2.5 Pro | 1.48.0 | LLM for generation |
| **Validation** | Zod | 3.22.4 | Input schema validation |
| **Payment Gateway** | Razorpay | 2.9.6 | Payment processing |
| **Password Hashing** | bcryptjs | 2.4.3 | Secure password storage |
| **JWT Auth** | jsonwebtoken | 9.0.2 | Token authentication |
| **File Upload** | Multer | 1.4.5 | Multipart form handling |
| **Rate Limiting** | express-rate-limit | 7.2.0 | Request throttling |
| **Logging** | Morgan | 1.10.0 | HTTP request logging |
| **Security** | Helmet | 7.1.0 | Security headers |
| **CORS** | cors | 2.8.5 | Cross-origin requests |

### **Infrastructure & Services**

| Service | Purpose |
|---------|---------|
| **MySQL** | Relational database (users, projects, artifacts) |
| **Redis / Upstash** | Job queue, rate limit store, caching |
| **Google Gemini API** | AI blueprint generation |
| **GitHub API** | Repository discovery & analysis |
| **Razorpay** | Payment processing (credit packages) |

---

## 🏗️ Architecture & Design

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages: Landing, Login, Dashboard, NewProject, etc  │  │
│  │  State: Zustand (auth) + React Query (server data)  │  │
│  │  Real-time: Socket.io client for live updates       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────────┘
               │
     ┌─────────┴──────────┬─────────────────┐
     │ REST API           │ WebSocket        │ Events
     │ (Axios)            │ (Socket.io)      │
     ▼                    ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ API Routes → Controllers → Services → Models         │  │
│  │ • Auth (register, login, JWT refresh)                │  │
│  │ • Projects (CRUD)                                    │  │
│  │ • Forge Generation (voice, image, text)              │  │
│  │ • Payments (credit purchase)                         │  │
│  │ • Users (profile, credits balance)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Middleware Stack                                      │  │
│  │ • Helmet (security headers)                          │  │
│  │ • CORS (frontend origin whitelisting)                │  │
│  │ • Authentication (JWT verification)                  │  │
│  │ • Rate Limiting (global + AI-specific)               │  │
│  │ • Request Logging (Morgan)                           │  │
│  │ • Error Handler (centralized)                        │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────┬──────┘
               │                                      │
        ┌──────▼──────┐                    ┌─────────▼───────┐
        │   Database  │                    │  Job Queue      │
        │   (MySQL)   │                    │  (Bull + Redis) │
        │             │                    │                 │
        │ • Users     │                    │ • Forge Worker  │
        │ • Projects  │                    │   - Gen PRD     │
        │ • Artifacts │                    │   - Gen Schema  │
        │ • Payments  │                    │   - Gen UI Tree │
        │ • Credits   │                    │   - Gen Sprints │
        │             │                    │   - GitHub Repos│
        └─────────────┘                    │                 │
                                           └────────┬────────┘
                                                    │
                                         ┌──────────┴──────────┐
                                         │  External APIs      │
                                         │ • Google Gemini     │
                                         │ • GitHub API        │
                                         │ • Razorpay          │
                                         └─────────────────────┘
```

### Data Flow - Blueprint Generation

```
User Input (Frontend)
    │
    ├─ Voice + Image + Text + Competitor URL
    │
    ▼
POST /api/v1/forge/generate (Controller)
    │
    ├─ Validate credits balance
    ├─ Create Project + Iteration record
    ├─ Deduct credits immediately
    │
    ▼
Forge Service
    │
    ├─ Save input (voice transcription, images)
    ├─ Queue job to Bull
    │
    ▼
Bull Queue Job
    │
    ├─ Fetch user's Gemini API key (or use system key)
    ├─ Call Forge Worker
    │
    ▼
Forge Worker Process
    │
    ├─ Stream 1: Generate PRD using Gemini
    ├─ Stream 2: Generate Prisma Schema
    ├─ Stream 3: Generate React Component Tree
    ├─ Stream 4: Generate 3-Sprint Task Board
    ├─ Stream 5: Query GitHub API for open-source repos
    │
    ▼
Emit Socket Events (Real-time progress)
    │
    ├─ progress:prd
    ├─ progress:schema
    ├─ progress:component
    ├─ progress:sprints
    ├─ progress:github
    │
    ▼
Save Artifacts to Database
    │
    ├─ type: PRD → content: JSON
    ├─ type: SCHEMA → content: JSON
    ├─ type: COMPONENT_TREE → content: JSON
    ├─ type: TASK_BOARD → content: JSON
    ├─ type: GITHUB_REPOS → content: JSON
    │
    ▼
Complete Event (Socket)
    │
    └─ Frontend updates UI with all artifacts
```

---

## 📁 Project Structure

### **Backend Structure**

```
forge-backend/
├── package.json                    # Dependencies & scripts
├── prisma/
│   ├── schema.prisma              # Database schema (Users, Projects, Artifacts, etc.)
│   └── migrations/                # Database version history
│
├── src/
│   ├── server.js                  # Entry point (HTTP + Socket.io setup)
│   ├── app.js                     # Express app config (middleware, routes)
│   │
│   ├── config/                    # Configuration modules
│   │   ├── env.js                # Load environment variables
│   │   ├── database.js           # Prisma connection
│   │   ├── redis.js              # Redis connection
│   │   └── gemini.js             # Gemini API setup
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── errorHandler.middleware.js # Global error handling
│   │   ├── rateLimiter.middleware.js  # Rate limiting (global + per-AI)
│   │   ├── requestLogger.middleware.js # Morgan logging
│   │   └── validate.middleware.js  # Zod schema validation
│   │
│   ├── routes/                    # API endpoint definitions
│   │   ├── index.js              # Route registry
│   │   ├── auth.routes.js        # Register, login, refresh, logout
│   │   ├── project.routes.js     # Project CRUD
│   │   ├── forge.routes.js       # Generation endpoints
│   │   ├── audio.routes.js       # Voice transcription
│   │   ├── payment.routes.js     # Razorpay integration
│   │   ├── user.routes.js        # Profile, credits
│   │   └── competitor.routes.js  # Competitor analysis
│   │
│   ├── controllers/               # Request handlers (thin logic layer)
│   │   ├── auth.controller.js
│   │   ├── forge.controller.js
│   │   ├── payment.controller.js
│   │   ├── project.controller.js
│   │   └── ...
│   │
│   ├── services/                  # Business logic (thick logic layer)
│   │   ├── auth.service.js       # Register, login, token refresh
│   │   ├── forge.service.js      # Queue generation jobs
│   │   ├── gemini.service.js     # Gemini API calls
│   │   ├── github.service.js     # GitHub repo discovery
│   │   ├── payment.service.js    # Razorpay, credit deduction
│   │   ├── user.service.js       # User CRUD, credits
│   │   └── ...
│   │
│   ├── queue/
│   │   ├── forge.queue.js        # Bull queue setup (config)
│   │   └── forge.worker.js       # Job processing (generates blueprints)
│   │
│   ├── socket/
│   │   └── socket.manager.js     # Socket.io event handlers
│   │
│   ├── utils/
│   │   ├── asyncHandler.js       # Try-catch wrapper for controllers
│   │   └── ...
│   │
│   └── validators/               # Zod schemas
│       ├── auth.validators.js
│       ├── forge.validators.js
│       └── ...
│
└── .env                          # Environment variables (not in git)
```

### **Frontend Structure**

```
forge-frontend/
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind customization
├── postcss.config.js             # PostCSS setup
│
├── src/
│   ├── main.jsx                  # React root
│   ├── App.jsx                   # Route definitions + AuthGuard
│   ├── index.css                 # Global styles
│   │
│   ├── pages/                    # Route components (one per route)
│   │   ├── LandingPage.jsx      # "/" - Public marketing
│   │   ├── LoginPage.jsx        # "/login"
│   │   ├── RegisterPage.jsx     # "/register"
│   │   ├── DashboardPage.jsx    # "/dashboard" - Project list
│   │   ├── NewProjectPage.jsx   # "/project/new" - Generation form
│   │   ├── ProjectDetailPage.jsx # "/project/:id" - View artifacts
│   │   ├── ProfilePage.jsx      # "/profile" - User settings
│   │   └── CreditsPage.jsx      # "/credits" - Buy credits
│   │
│   ├── components/               # Reusable UI components
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx    # Sidebar + header wrapper
│   │   │   └── AuthGuard.jsx    # Protected routes guard
│   │   ├── forge/
│   │   │   ├── InputForm.jsx    # Voice/image/text input
│   │   │   ├── ProgressBar.jsx  # Real-time generation progress
│   │   │   └── ArtifactViewer.jsx # Display PRD, schema, etc.
│   │   └── ...
│   │
│   ├── services/                 # API & business logic
│   │   ├── api.js               # Axios instance + base config
│   │   ├── authService.js       # Auth API calls
│   │   ├── forgeService.js      # Forge generation API
│   │   └── projectService.js    # Project API
│   │
│   ├── store/                    # State management
│   │   └── authStore.js         # Zustand auth state (user, token)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── ...
│   │
│   └── utils/                    # Helper functions
│       └── ...
```

---

## 🗄️ Database Schema

### **Users Table**

```javascript
model User {
  id              String           @id @default(cuid())
  email           String           @unique
  passwordHash    String           // bcrypt hash
  name            String?
  geminiApiKey    String?          // User's optional personal Gemini key
  creditsBalance  Int              @default(20)  // Free 20 credits per signup
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  projects        Project[]
  refreshTokens   RefreshToken[]
  creditLogs      CreditLog[]
  payments        Payment[]
}
```

**What it stores:**
- User account credentials (email + password hash)
- Credit balance (integer, starts at 20 free credits)
- Personal Gemini API key (optional, for key rotation)
- Timestamps for audit

---

### **Projects Table**

```javascript
model Project {
  id         String        @id @default(cuid())
  userId     String        // Foreign key → User
  user       User          @relation(...)
  name       String
  status     ProjectStatus @default(PROCESSING)  // PROCESSING | COMPLETE | FAILED
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  deletedAt  DateTime?     // Soft delete
  
  // Relations
  iterations Iteration[]
}

enum ProjectStatus {
  PROCESSING   // Job still running
  COMPLETE     // Artifacts generated
  FAILED       // Error during generation
}
```

**What it stores:**
- Project metadata (name, status, owner)
- Tracks which user owns which projects
- Soft delete (not really deleted, just marked)

---

### **Iterations Table**

```javascript
model Iteration {
  id         String        @id @default(cuid())
  projectId  String        // Foreign key → Project
  project    Project       @relation(...)
  parentId   String?       // For versioning/forking
  parent     Iteration?    @relation("IterationTree", ...)
  children   Iteration[]   @relation("IterationTree")
  jobId      Int?          // Bull queue job ID (for socket communication)
  voiceInput String?       @db.Text  // Transcribed voice
  imageUrl   String?       // Cloud URL of uploaded image
  textInput  String?       @db.Text  // Text description
  status     ProjectStatus @default(PROCESSING)
  createdAt  DateTime      @default(now())
  
  // Relations
  artifacts  Artifact[]
}
```

**What it stores:**
- Each version of a project (forking creates new iteration)
- User input (voice transcript, image URL, text)
- Job ID for real-time socket progress tracking
- Parent-child relationship for version history

---

### **Artifacts Table**

```javascript
model Artifact {
  id          String       @id @default(cuid())
  iterationId String       // Foreign key → Iteration
  iteration   Iteration    @relation(...)
  type        ArtifactType // PRD | SCHEMA | COMPONENT_TREE | TASK_BOARD | GITHUB_REPOS
  content     Json         // Actual PRD/schema/components (JSON structure)
  createdAt   DateTime     @default(now())
  
  @@unique([iterationId, type])  // One artifact per type per iteration
}

enum ArtifactType {
  PRD               // Product Requirements Document
  SCHEMA            // Prisma database schema
  COMPONENT_TREE    // React component hierarchy
  TASK_BOARD        // 3-sprint task board
  GITHUB_REPOS      // Curated open-source repos
}
```

**What it stores:**
- Generated blueprints (all as JSON)
- Type of artifact (PRD, Schema, etc.)
- Linked to specific iteration (version)

---

### **Refresh Tokens Table**

```javascript
model RefreshToken {
  id        String   @id @default(cuid())
  userId    String   // Foreign key → User
  user      User     @relation(...)
  token     String   @db.Text
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

**What it stores:**
- One-time refresh tokens (for token rotation security)
- Expiration time (7 days)

---

### **Credit Logs Table**

```javascript
model CreditLog {
  id        String       @id @default(cuid())
  userId    String       // Foreign key → User
  user      User         @relation(...)
  type      CreditLogType // INITIAL_SIGNUP | CHAT_USED | PURCHASE | REFUND | MONTHLY_RESET
  amount    Int          // How many credits
  balance   Int          // Balance after this transaction
  createdAt DateTime     @default(now())
}

enum CreditLogType {
  INITIAL_SIGNUP   // +20 credits
  CHAT_USED        // -5 credits (per generation)
  PURCHASE         // +10/25/50 credits
  REFUND           // + credits (if generation failed)
  MONTHLY_RESET    // +10 free credits
}
```

**What it stores:**
- Complete audit trail of credit transactions
- Helps users understand their credit usage
- Useful for debugging refunds

---

### **Payments Table**

```javascript
model Payment {
  id              String       @id @default(cuid())
  userId          String       // Foreign key → User
  user            User         @relation(...)
  razorpayOrderId String       @unique
  razorpayPaymentId String?
  amount          Int          // In paise (e.g., 499 = ₹4.99)
  creditsGiven    Int          // How many credits purchased
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

enum PaymentStatus {
  PENDING   // Waiting for payment
  SUCCESS   // Payment successful
  FAILED    // Payment failed
  CANCELLED // User cancelled
}
```

**What it stores:**
- Payment transaction records
- Links to Razorpay order/payment IDs
- Amount and credits granted

---

## 🔗 API Endpoints

### **Authentication Routes** (`/api/v1/auth`)

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/register` | `{ email, password, name }` | `{ user, accessToken }` | Create new account (20 free credits) |
| `POST` | `/login` | `{ email, password }` | `{ user, accessToken }` | Login & receive JWT token |
| `POST` | `/refresh` | — | `{ accessToken, user }` | Exchange refresh token for new access token |
| `POST` | `/logout` | — | `{ message }` | Clear refresh token cookie |
| `GET` | `/me` | — | `{ user }` | Get authenticated user info (requires auth) |

**Auth Flow:**
1. User registers → `creditsBalance = 20`
2. Backend creates `accessToken` (short-lived, in response body)
3. Backend creates `refreshToken` (long-lived, in HttpOnly cookie)
4. Frontend stores `accessToken` in memory/localStorage
5. When access token expires, call `/refresh` to get new one
6. Refresh token automatically sent by browser (HttpOnly cookie)

---

### **User Routes** (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:id` | Get user profile (requires auth) |
| `PUT` | `/:id` | Update user profile (name, password, Gemini API key) |
| `GET` | `/:id/credits` | Get credits balance |

---

### **Projects Routes** (`/api/v1/projects`)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/` | — | List all projects of authenticated user |
| `POST` | `/` | `{ name }` | Create new project (status: PROCESSING) |
| `GET` | `/:id` | — | Get project detail + all iterations |
| `DELETE` | `/:id` | — | Soft delete project |

---

### **Forge (Generation) Routes** (`/api/v1/forge`)

#### **Start Generation**

```
POST /api/v1/forge/generate

Request Body:
{
  "projectId": "project_123",
  "voiceTranscript": "I want a todo app...",  // Optional
  "imageBase64": "data:image/png;base64,...", // Optional
  "imageType": "whiteboard",                  // Optional
  "textInput": "Build a real-time chat...",  // Optional
  "competitorUrl": "https://slack.com",      // Optional
  "userGeminiApiKey": "AIza..."              // Optional (for key rotation)
}

Response (202 Accepted):
{
  "success": true,
  "data": {
    "projectId": "project_123",
    "iterationId": "iter_456",
    "jobId": 789,  // Use this to track progress via Socket.io
    "status": "PROCESSING",
    "creditsDeducted": 5
  }
}
```

**What happens:**
1. Backend validates credits balance
2. Creates new Iteration record
3. **Immediately deducts 5 credits** (or refunds if job fails)
4. Queues job to Bull
5. Returns `jobId` for real-time tracking

---

#### **Fork Iteration**

```
POST /api/v1/forge/fork

Request Body:
{
  "iterationId": "iter_456",
  "textInput": "Now add dark mode...",     // Optional
  "voiceTranscript": "..."                 // Optional
}

Response (202 Accepted):
{
  "success": true,
  "data": {
    "projectId": "project_123",
    "iterationId": "iter_789_fork",  // New iteration (child of iter_456)
    "jobId": 801,
    "status": "PROCESSING"
  }
}
```

**What happens:**
1. Creates NEW iteration with parent = previous iteration
2. Queues new generation job (modified/refined blueprint)
3. Same credit deduction as normal generation

---

#### **Get Job Status**

```
GET /api/v1/forge/job/:jobId

Response (200 OK):
{
  "success": true,
  "data": {
    "jobId": 789,
    "status": "active",  // or "completed", "failed"
    "progress": 60,      // Percentage (0-100)
    "message": "Generating React component tree..."
  }
}
```

---

### **Payment Routes** (`/api/v1/payments`)

#### **Create Payment Order**

```
POST /api/v1/payments/create-order

Request Body:
{
  "plan": "starter"  // "starter" (₹49) | "pro" (₹99) | "ultimate" (₹199)
}

Response (200 OK):
{
  "success": true,
  "data": {
    "orderId": "order_123",
    "amount": 4900,      // In paise
    "currency": "INR",
    "creditsToGet": 10,
    "key": "rzp_live_..."  // Frontend passes to Razorpay SDK
  }
}
```

---

#### **Verify Payment**

```
POST /api/v1/payments/verify

Request Body:
{
  "razorpayOrderId": "order_123",
  "razorpayPaymentId": "pay_123",
  "razorpaySignature": "sig_123"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "message": "Payment verified",
    "creditsAdded": 10,
    "newBalance": 25
  }
}
```

---

### **Competitor Analysis Route**

```
POST /api/v1/competitor/analyze

Request Body:
{
  "url": "https://www.figma.com"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": "Figma is a collaborative design tool...",
    "features": ["Real-time collaboration", "Component library", ...],
    "technicalStack": ["React", "WebGL", ...]
  }
}
```

---

### **Audio Transcription Route**

```
POST /api/v1/audio/transcribe

Request Body (multipart/form-data):
{
  "audio": <Audio File>
}

Response (200 OK):
{
  "success": true,
  "data": {
    "transcript": "I want to build a todo app with...",
    "duration": 15.3  // seconds
  }
}
```

---

## 🎨 Frontend Pages & Features

### **Page: LandingPage** (`/`)

**Purpose:** Marketing page for logged-out users

**Components:**
- Hero section with value proposition
- Feature showcase (voice, image, text inputs)
- Pricing plans (starter, pro, ultimate)
- Call-to-action buttons (Login / Sign Up)

**Click Behavior:**
- "Sign Up" → Navigate to `/register`
- "Login" → Navigate to `/login`
- "Start Free" → If not logged in → redirect to `/register`

---

### **Page: LoginPage** (`/login`)

**Purpose:** User authentication

**Form Fields:**
- Email input
- Password input
- "Login" button
- "Don't have account?" link → `/register`

**Click Behavior:**
- On submit → Call `authService.login(email, password)`
- If success → Store `accessToken`, set auth state → Navigate to `/dashboard`
- If error → Show toast notification

---

### **Page: RegisterPage** (`/register`)

**Purpose:** User account creation

**Form Fields:**
- Name input
- Email input
- Password input
- Confirm password input
- "Sign Up" button
- "Already have account?" link → `/login`

**Click Behavior:**
- On submit → Call `authService.register(name, email, password)`
- If success → Automatically log in → Navigate to `/dashboard`
- If error → Show validation errors

---

### **Page: DashboardPage** (`/dashboard`)

**Purpose:** Project management & workspace

**Components:**
- Header with user name + logout button
- Sidebar with nav links
- Main area with:
  - "New Project" button (CTA)
  - List of all user projects (with pagination/infinite scroll)
  - Each project card shows:
    - Project name
    - Created date
    - Status (PROCESSING | COMPLETE | FAILED)
    - Quick action buttons (View | Delete)

**Click Behavior:**
- "New Project" button → Navigate to `/project/new`
- Project card "View" → Navigate to `/project/:id`
- Project card "Delete" → Soft delete (confirmation dialog)
- Socket.io: Listen for real-time project updates

---

### **Page: NewProjectPage** (`/project/new`)

**Purpose:** Blueprint generation form

**Sections:**

#### 1. **Input Selection**
- 4 tabs: Voice | Image | Text | Competitor

**Tab: Voice**
- Microphone icon button
- On click → Start Web Speech API recording
- Display: "Recording... Stop" button
- On stop → Auto-transcribe (via backend `/audio/transcribe`)
- Display transcript in input field

**Tab: Image**
- File upload (drag & drop + click)
- Accepts: PNG, JPG, SVG, whiteboard sketches
- Preview of selected image
- Label: "Whiteboard sketch or UI mockup"

**Tab: Text**
- Textarea for description
- Placeholder: "Describe your feature ideas..."

**Tab: Competitor**
- URL input field
- "Analyze" button
- On click → Call `/competitor/analyze`
- Display summary of competitor features

#### 2. **Credits Display**
- Show current credits balance
- "🔴 5 credits will be used" warning
- Link to `/credits` to buy more

#### 3. **Optional: User's Gemini Key**
- Checkbox: "Use my own Gemini API key"
- Text input (if checked) for API key
- Tooltip: "For unlimited generations"

#### 4. **Generate Button**
- Big CTA button
- Disabled if:
  - No input provided
  - Credits < 5
- On click:
  - Call POST `/forge/generate`
  - Display progress bar
  - Navigate to `/project/:id` (streaming artifacts)

**Click Behavior:**
- Microphone → Start/stop recording
- Image upload → Preview image
- Competitor URL → Fetch summary
- Generate → Queue job + live progress

---

### **Page: ProjectDetailPage** (`/project/:id`)

**Purpose:** View generated blueprints with real-time updates

**Layout:**
```
┌─────────────────────────────────────┐
│  Project Name + Status              │
├─────────────┬───────────────────────┤
│             │                       │
│  Artifacts  │   Content Viewer      │
│  Tabs:      │                       │
│  • PRD      │  (Shows selected      │
│  • Schema   │   artifact content)   │
│  • UI Tree  │                       │
│  • Sprints  │                       │
│  • GitHub   │                       │
│             │                       │
│  [+ Fork]   │   [Copy] [Download]   │
│  button     │                       │
└─────────────┴───────────────────────┘
```

**Features:**

1. **Real-Time Progress**
   - Socket.io listens for `progress:prd`, `progress:schema`, etc.
   - Shows progress bar + percentage for each artifact
   - Disables tab until artifact is ready

2. **Artifact Tabs**
   - **PRD Tab** → Display product requirements (formatted)
   - **Schema Tab** → Display Prisma schema (code + copy button)
   - **UI Tree Tab** → Display React component structure (tree view)
   - **Sprints Tab** → Display 3-sprint task board (cards + assignments)
   - **GitHub Tab** → Display curated repos with links

3. **Action Buttons**
   - **[+ Fork]** → Opens refine dialog
     - Allows adding text/voice refinement
     - Creates new iteration (child of current)
     - Queues new generation job
   - **[Copy]** → Copy artifact to clipboard
   - **[Download]** → Download artifact as JSON/MD file

**Click Behavior:**
- Tab click → Scroll to show that artifact
- [+ Fork] → Show modal with text/voice input → Submit → Generate refined version
- [Copy] → Copy to clipboard + show "Copied!" toast
- [Download] → Trigger file download

---

### **Page: ProfilePage** (`/profile`)

**Purpose:** User account settings

**Sections:**

1. **Profile Information**
   - Name (editable)
   - Email (read-only)
   - Password change form
   - Save button

2. **Gemini API Key Management**
   - Show: "Your personal key" (masked)
   - Add/Update/Remove options
   - Checkbox: "Use personal key for all generations"

3. **Account Settings**
   - Language preference
   - Theme (light/dark)
   - Notification preferences

**Click Behavior:**
- Edit fields → Call PUT `/users/:id`
- Save → Update user profile + show success toast
- Remove API key → Confirm deletion → Call DELETE

---

### **Page: CreditsPage** (`/credits`)

**Purpose:** Credit purchase & usage

**Sections:**

1. **Credit Balance Display**
   - Large number showing current balance
   - "🟢 You have 15 credits" (or warning if low)

2. **Usage Chart**
   - Bar chart or timeline of credit usage
   - Fetch from `/creditLogs`

3. **Purchase Plans**
   ```
   ┌─────────────────────────────────────────────┐
   │ Starter Plan    │ Pro Plan      │ Ultimate   │
   │ ₹49 → 10 credits│ ₹99 → 25      │ ₹199 → 50  │
   │ [Buy Now]       │ [Buy Now]     │ [Buy Now]  │
   └─────────────────────────────────────────────┘
   ```
   - Each plan shows credits + price
   - [Buy Now] button → Opens Razorpay checkout

4. **Payment History**
   - Table of all payments
   - Columns: Date | Amount | Credits | Status

**Click Behavior:**
- [Buy Now] → Create order → Open Razorpay modal → On success → Update balance

---

## 🔧 Core Services & Business Logic

### **Auth Service** (`auth.service.js`)

**Functions:**

#### `register(email, password, name)`
- Validate email format
- Hash password using bcryptjs
- Create user in database with `creditsBalance = 20`
- Create `CreditLog` entry (INITIAL_SIGNUP)
- Generate JWT tokens
- Return user + tokens

#### `login(email, password)`
- Find user by email
- Compare passwords (bcryptjs)
- If match → generate JWT tokens
- Return user + tokens

#### `refresh(refreshToken)`
- Verify refresh token signature
- Check if token exists in RefreshToken table
- If valid → generate new access token
- Return new access token

#### `logout(refreshToken)`
- Delete refresh token from database
- Clear any sessions

#### `getMe(userId)`
- Fetch user by ID
- Return user details (excluding password)

---

### **Forge Service** (`forge.service.js`)

**Functions:**

#### `startGeneration({ userId, voiceTranscript, imageBase64, textInput, competitorUrl, projectId, userGeminiApiKey })`

**Logic Flow:**
```
1. Validate input (at least one input provided)
2. Deduct credits immediately (5 credits)
   - If balance < 5 → throw "insufficient credits"
   - Create CreditLog entry (CHAT_USED)
3. Create Project (if not provided)
4. Create Iteration:
   - Save voice transcript
   - Upload image to cloud storage (if provided)
   - Save text input
   - status: PROCESSING
5. Queue job to Bull:
   - Pass iterationId, projectId, userId
   - Pass inputs (voice, image, text, competitorUrl, userGeminiApiKey)
6. Return { projectId, iterationId, jobId, status, creditsDeducted }
```

**Error Handling:**
- If generation fails → Refund credits (create refund CreditLog)
- Retry job 3 times automatically

#### `forkIteration({ userId, parentIterationId, textInput, voiceTranscript })`

**Logic Flow:**
```
1. Fetch parent iteration (validate ownership)
2. Create new Iteration:
   - parentId = parentIterationId
   - Merge parent inputs + new inputs
   - status: PROCESSING
3. Queue job with merged inputs
4. Return { projectId, iterationId, jobId }
```

#### `getJobStatus(jobId)`
- Query Bull queue for job
- Return { jobId, status, progress, message }

---

### **Gemini Service** (`gemini.service.js`)

**Functions:**

#### `generatePRD(userInput, userGeminiApiKey?)`
- Initialize Gemini client (use userGeminiApiKey or system key)
- Call Gemini API with system prompt:
  ```
  "Generate a detailed PRD with:
   - Project overview
   - User personas
   - Feature list
   - User stories
   - Acceptance criteria
   - Success metrics"
  ```
- Stream response back
- Return PRD as structured JSON

#### `generateSchema(userInput, prdContent, userGeminiApiKey?)`
- Call Gemini with PRD + input
- Prompt: "Based on this PRD, generate a Prisma schema"
- Return schema as code (string)

#### `generateComponentTree(userInput, prdContent, userGeminiApiKey?)`
- Call Gemini
- Prompt: "Generate a React component tree hierarchy"
- Return as JSON with component names, props, children

#### `generateTaskBoard(userInput, prdContent, userGeminiApiKey?)`
- Call Gemini
- Prompt: "Generate 3-sprint task board with stories, tasks, estimates"
- Return as JSON (sprints → tasks → subtasks)

#### `getAllGenerations(inputs, userGeminiApiKey?)`
- Run all 4 generations in parallel
- Return { prd, schema, componentTree, taskBoard }
- **Emit Socket events:**
  - `progress:prd` (every chunk)
  - `progress:schema`
  - `progress:component`
  - `progress:sprints`

---

### **GitHub Service** (`github.service.js`)

**Functions:**

#### `findRelevantRepos(keywords, language?)`
- Query GitHub API with keywords from PRD
- Filter by:
  - Language (JavaScript, Python, Java, etc.)
  - Stars > 100
  - Recently updated
- Return top 10 repos with:
  - Name, URL, description
  - Stars, language, last update
  - Link to repo

---

### **Payment Service** (`payment.service.js`)

**Functions:**

#### `createOrder(userId, planId)`
- Determine amount & credits based on plan:
  - "starter" → ₹49 (10 credits)
  - "pro" → ₹99 (25 credits)
  - "ultimate" → ₹199 (50 credits)
- Call Razorpay API to create order
- Save Payment record (status: PENDING)
- Return { orderId, amount, currency, creditsToGet, razorpayKey }

#### `verifyPayment(userId, orderId, paymentId, signature)`
- Verify signature using Razorpay secret key
- Update Payment record (status: SUCCESS)
- Add credits to user:
  - `creditsBalance += creditsToGet`
  - Create CreditLog (PURCHASE)
- Return { message, creditsAdded, newBalance }

---

### **User Service** (`user.service.js`)

**Functions:**

#### `updateProfile(userId, { name, password, geminiApiKey })`
- Update user fields
- If password provided → hash it
- If Gemini key provided → validate format

#### `getCreditsBalance(userId)`
- Return user's current credits

#### `getMe(userId)`
- Return full user object (excluding password)

---

## 🔐 Authentication & Security

### **JWT Authentication Flow**

```
User logs in
    │
    ├─ Email + Password sent to backend
    │
    ▼
Backend verifies credentials
    │
    ├─ Generate accessToken (short-lived, 1 hour)
    │   - Header: { alg: "HS256", typ: "JWT" }
    │   - Payload: { userId, email }
    │   - Signed with JWT_SECRET
    │
    ├─ Generate refreshToken (long-lived, 7 days)
    │   - Saved in RefreshToken table
    │   - Also sent as HttpOnly cookie
    │
    ▼
Response sent to frontend
    │
    ├─ Body: { accessToken, user }  ← Frontend stores accessToken in memory
    ├─ Cookie: refreshToken (HttpOnly) ← Browser auto-manages
    │
    ▼
Frontend makes API request
    │
    ├─ Header: Authorization: Bearer <accessToken>
    │
    ▼
Backend middleware (auth.middleware.js)
    │
    ├─ Extract token from Authorization header
    ├─ Verify signature using JWT_SECRET
    ├─ If valid → attach user to req.user
    ├─ If expired → frontend calls /refresh
    │
    ▼
Request continues
```

### **Middleware Stack**

**Order matters!**

```javascript
app.use(helmet())              // 1. Security headers
app.use(cors(...))             // 2. CORS check
app.use(express.json())        // 3. Parse body
app.use(cookieParser())        // 4. Parse cookies (for refreshToken)
app.use(requestLogger)         // 5. Log requests
app.use('/api/v1', router)     // 6. API routes (with auth middleware inside)
app.use(globalRateLimiter)     // 7. Rate limit non-API requests
app.use(errorHandler)          // 8. Catch all errors (LAST)
```

### **Auth Middleware** (`auth.middleware.js`)

```javascript
export const authMiddleware = (req, res, next) => {
  // 1. Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    // 2. Verify & decode token
    const decoded = jwt.verify(token, config.JWT_SECRET)
    
    // 3. Attach user to request
    req.user = { id: decoded.userId, email: decoded.email }
    
    // 4. Continue to next middleware
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Call /refresh.' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

### **Security Best Practices**

1. **Password Hashing**
   - Use bcryptjs (rounds: 10)
   - Never store plain passwords
   - Compare hash during login

2. **Token Security**
   - Access token: short-lived (1 hour), in response body
   - Refresh token: long-lived (7 days), in HttpOnly cookie
   - HttpOnly prevents JavaScript access (XSS protection)
   - Secure flag on production (HTTPS only)
   - SameSite=Lax (CSRF protection)

3. **CORS Protection**
   - Whitelist only allowed origins
   - credentials: true (for cookies)
   - Methods: GET, POST, PUT, DELETE, PATCH

4. **Helmet Middleware**
   - Sets security headers:
     - Content-Security-Policy
     - X-Frame-Options
     - X-Content-Type-Options
     - Strict-Transport-Security
     - etc.

5. **Input Validation**
   - Use Zod schemas for all inputs
   - Validate email format, password strength
   - Sanitize text inputs

6. **API Key Rotation**
   - Users can provide personal Gemini API key
   - If quota exceeded → fall back to system key
   - Automatic key rotation logic

---

## 💳 Payment Integration (Razorpay)

### **Payment Flow**

```
User clicks "Buy Credits"
    │
    ▼
POST /api/v1/payments/create-order
    │
    ├─ Backend creates Razorpay order
    ├─ Saves Payment record (PENDING)
    │
    ▼
Frontend receives orderId + amount
    │
    ├─ Opens Razorpay checkout modal
    ├─ User enters card/UPI details
    │
    ▼
Razorpay processes payment
    │
    ├─ Success → Returns paymentId + signature
    ├─ Failure → Shows error
    │
    ▼
Frontend calls POST /api/v1/payments/verify
    │
    ├─ Body: { orderId, paymentId, signature }
    │
    ▼
Backend verifies signature
    │
    ├─ If valid:
    │   - Update Payment (SUCCESS)
    │   - Add credits to user
    │   - Create CreditLog (PURCHASE)
    │
    ▼
Frontend shows "✅ Credits added!"
```

### **Razorpay Integration Code**

**Frontend:**
```javascript
// In CreditsPage.jsx
import Razorpay from 'razorpay'  // Load via CDN or npm

const handleBuyCredits = async (planId) => {
  // 1. Create order
  const { data } = await api.post('/payments/create-order', { plan: planId })
  const { orderId, amount, key } = data.data
  
  // 2. Open Razorpay
  const options = {
    key,
    amount,
    currency: 'INR',
    order_id: orderId,
    handler: async (response) => {
      // 3. Verify payment
      const result = await api.post('/payments/verify', {
        razorpayOrderId: orderId,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      })
      // Update credits in local state
    }
  }
  
  new window.Razorpay(options).open()
}
```

**Backend:**
```javascript
// payment.service.js
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET
})

export async function verifyPayment(orderId, paymentId, signature) {
  // Verify signature
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  
  if (signature !== expectedSignature) {
    throw new Error('Payment verification failed')
  }
  
  // Valid payment → update database
  // ...
}
```

---

## 📡 Real-Time Features (WebSocket)

### **Socket.io Setup**

**Server** (`src/socket/socket.manager.js`)
```javascript
import { Server } from 'socket.io'

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.CLIENT_URL,
      credentials: true
    }
  })
  
  // Authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('No auth token'))
    
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET)
      socket.userId = decoded.userId
      next()
    } catch (err) {
      next(err)
    }
  })
  
  // Connection handlers
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`)
    
    // Join room for this user
    socket.join(`user:${socket.userId}`)
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`)
    })
  })
  
  return io
}
```

**Client** (`forge-frontend/src/services/forgeService.js`)
```javascript
import io from 'socket.io-client'

const socket = io(API_URL, {
  auth: {
    token: authStore.accessToken
  }
})

// Listen for generation progress
socket.on('progress:prd', (data) => {
  console.log('PRD progress:', data.chunk)
  // Update UI with streaming PRD
})

socket.on('progress:schema', (data) => {
  // Update schema UI
})

socket.on('progress:component', (data) => {
  // Update component tree UI
})

socket.on('progress:sprints', (data) => {
  // Update task board UI
})

socket.on('generation:complete', (data) => {
  // Show completion message
  // Navigate to project detail page
})

socket.on('generation:failed', (error) => {
  // Show error + refund credits
})
```

### **Real-Time Events**

**Emitted from worker (during generation):**

| Event | Payload | Description |
|-------|---------|-------------|
| `progress:prd` | `{ iterationId, chunk }` | Streaming PRD content |
| `progress:schema` | `{ iterationId, chunk }` | Streaming schema |
| `progress:component` | `{ iterationId, chunk }` | Streaming component tree |
| `progress:sprints` | `{ iterationId, chunk }` | Streaming task board |
| `progress:github` | `{ iterationId, repos: [] }` | GitHub repos discovered |
| `generation:complete` | `{ iterationId, artifacts: {} }` | All artifacts ready |
| `generation:failed` | `{ iterationId, error }` | Generation error (credits refunded) |

---

## 🤖 AI Generation Pipeline

### **Forge Worker** (`src/queue/forge.worker.js`)

This is where the magic happens! The worker processes queued jobs and generates blueprints.

**Job Processing:**

```
Bull Job starts
    │
    ├─ Retrieve job data
    │   - iterationId, projectId, userId
    │   - voiceTranscript, imageBase64, textInput, competitorUrl
    │   - userGeminiApiKey (optional)
    │
    ▼
Prepare inputs
    │
    ├─ If image → Download/parse image
    ├─ If voice → Already have transcript
    ├─ If text → Have description
    ├─ If URL → Analyze competitor features
    │
    ▼
Create unified prompt for Gemini
    │
    ├─ "Based on this input, generate a PRD with..."
    ├─ Include all available context
    │
    ▼
Generate 5 artifacts in parallel
    │
    ├─ Stream 1: Gemini PRD
    ├─ Stream 2: Gemini Prisma Schema
    ├─ Stream 3: Gemini React Component Tree
    ├─ Stream 4: Gemini Task Board
    ├─ Stream 5: GitHub API Query
    │
    │  (Emit Socket events in real-time as chunks arrive)
    │
    ▼
Parse responses to JSON
    │
    ├─ PRD → { title, overview, features, userStories, acceptance_criteria }
    ├─ Schema → Parse Prisma syntax → structured JSON
    ├─ Components → Parse hierarchy → JSON tree
    ├─ Sprints → Parse tasks → { sprint1: [...], sprint2: [...], sprint3: [...] }
    ├─ GitHub → Already JSON from API
    │
    ▼
Save artifacts to database
    │
    ├─ For each artifact type:
    │   - type: PRD, content: { title, overview, ... }
    │   - type: SCHEMA, content: { models: [...] }
    │   - type: COMPONENT_TREE, content: { App: { children: [...] } }
    │   - type: TASK_BOARD, content: { sprints: [...] }
    │   - type: GITHUB_REPOS, content: { repos: [...] }
    │
    ▼
Update Iteration status
    │
    ├─ status: COMPLETE
    │
    ▼
Emit completion event
    │
    ├─ `generation:complete` (Socket.io to frontend)
    │
    ▼
Job completes
```

**Error Handling:**
- If generation fails → Catch error
- Emit `generation:failed` event
- **Refund credits** to user
- Retry job up to 3 times
- After 3 retries → Mark as FAILED, show error

**Key Code Points:**

```javascript
// forge.worker.js (simplified)

forgeQueue.process(async (job) => {
  const { iterationId, projectId, userId, userGeminiApiKey, inputs } = job.data
  
  try {
    // Parallel generation
    const [prd, schema, components, sprints, repos] = await Promise.all([
      geminiService.generatePRD(inputs, userGeminiApiKey),
      geminiService.generateSchema(inputs, prd, userGeminiApiKey),
      geminiService.generateComponentTree(inputs, prd, userGeminiApiKey),
      geminiService.generateTaskBoard(inputs, prd, userGeminiApiKey),
      githubService.findRelevantRepos(inputs.keywords)
    ])
    
    // Save artifacts
    await prisma.artifact.createMany({
      data: [
        { iterationId, type: 'PRD', content: prd },
        { iterationId, type: 'SCHEMA', content: schema },
        // ...
      ]
    })
    
    // Update iteration
    await prisma.iteration.update({
      where: { id: iterationId },
      data: { status: 'COMPLETE' }
    })
    
    // Notify frontend
    io.to(`user:${userId}`).emit('generation:complete', {
      iterationId,
      artifacts: { prd, schema, components, sprints, repos }
    })
    
  } catch (error) {
    // Refund credits
    await creditService.refundCredits(userId, 5)
    
    // Notify frontend
    io.to(`user:${userId}`).emit('generation:failed', {
      iterationId,
      error: error.message
    })
    
    throw error  // Retries
  }
})
```

---

## ⚙️ Queue System (Bull)

### **What is Bull?**

Bull is a Redis-based job queue for Node.js. It allows:
- **Async processing** - Don't wait for generation to complete
- **Retries** - Automatic retry on failure
- **Scheduling** - Schedule jobs for later
- **Rate limiting** - Control job throughput
- **Monitoring** - Track job status

### **Queue Setup**

```javascript
// forge.queue.js

const forgeQueue = new Bull('forge-generation', config.REDIS_URL, {
  redis: {
    tls: {}  // Upstash requires TLS
  },
  defaultJobOptions: {
    attempts: 3,           // Retry 3 times
    backoff: {
      type: 'exponential',
      delay: 2000          // 2s, 4s, 8s delays between retries
    },
    removeOnComplete: 100, // Keep 100 completed jobs in history
    removeOnFail: 200,     // Keep 200 failed jobs
    timeout: 120000        // 2 minute timeout per job
  }
})
```

### **Job Lifecycle**

```
1. Job Created (status: WAITING)
   └─ Queued in Redis

2. Job Started (status: ACTIVE)
   └─ Worker picks up job

3a. Job Succeeded (status: COMPLETED)
    └─ Stored in history, socket event emitted

3b. Job Failed (status: FAILED)
    └─ If attempts < 3 → Retry with backoff
    └─ If attempts = 3 → Failure, store in history
    └─ Emit socket error event
```

### **Job Monitoring**

Frontend can check job status:

```javascript
// Get job status
GET /api/v1/forge/job/789

Response:
{
  "jobId": 789,
  "status": "active",  // or "completed", "failed"
  "progress": 45,      // Percentage
  "message": "Generating React component tree..."
}
```

---

## 🛡️ Rate Limiting Strategy

### **3-Tier Rate Limiting**

#### **1. Global Rate Limiter** (All requests)

```javascript
// middleware/rateLimiter.middleware.js

const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }),
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests from this IP'
})
```

**Applied to:** All non-API routes

---

#### **2. Auth Rate Limiter** (Login/Register)

```javascript
const authLimiter = rateLimit({
  store: new RedisStore({...}),
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 login attempts per 15 min
  skipSuccessfulRequests: true  // Don't count successful logins
})

router.post('/login', authLimiter, loginController)
```

**Applied to:** `/auth/login`, `/auth/register`

---

#### **3. AI Limiter** (Generation requests)

```javascript
const aiLimiter = rateLimit({
  store: new RedisStore({...}),
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                    // 10 generations per hour
  skipFailedRequests: true    // Don't count failed requests
})

router.post('/forge/generate', aiLimiter, generateController)
```

**Applied to:** `/forge/generate`, `/forge/fork`

---

### **Rate Limit Headers**

Every response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
```

Frontend can use this to warn users: "You have 45 requests left"

---

## ⚠️ Error Handling

### **Global Error Handler Middleware**

```javascript
// middleware/errorHandler.middleware.js

export const errorHandler = (err, req, res, next) => {
  // 1. Log error
  console.error('[ERROR]', err.message)
  
  // 2. Determine status code
  const statusCode = err.statusCode || 500
  
  // 3. Format error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message,
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  }
  
  // 4. Send response
  res.status(statusCode).json(errorResponse)
}
```

### **Custom Error Classes**

```javascript
// utils/CustomError.js

export class CustomError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

// Usage:
throw new CustomError('Invalid email', 400, 'INVALID_EMAIL')
```

### **Common Errors**

| Error | Status | Code | Message |
|-------|--------|------|---------|
| Invalid email | 400 | INVALID_EMAIL | "Email format is invalid" |
| Weak password | 400 | WEAK_PASSWORD | "Password must be 8+ characters" |
| User exists | 409 | USER_EXISTS | "Email already registered" |
| Wrong password | 401 | WRONG_PASSWORD | "Invalid credentials" |
| Insufficient credits | 402 | INSUFFICIENT_CREDITS | "You need 5 credits" |
| Expired token | 401 | TOKEN_EXPIRED | "Token expired. Refresh your token." |
| Invalid token | 401 | INVALID_TOKEN | "Token is invalid" |
| Not found | 404 | NOT_FOUND | "Resource not found" |
| Payment failed | 402 | PAYMENT_FAILED | "Payment could not be processed" |

---

## 🚀 Setup & Installation

### **Prerequisites**

- **Node.js** ≥ 20.0.0
- **MySQL** 8.0+
- **Redis** 6.0+ (or Upstash Redis)
- **Git**

### **Backend Setup**

```bash
# 1. Navigate to backend
cd forge-backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Configure .env
# DATABASE_URL=mysql://user:password@localhost:3306/forge
# JWT_SECRET=your-secret-key
# REDIS_URL=redis://default:password@upstash...
# GEMINI_API_KEY=AIza...
# RAZORPAY_KEY_ID=...
# RAZORPAY_KEY_SECRET=...
# CLIENT_URL=http://localhost:5173

# 5. Setup database
npm run db:push

# 6. Start dev server
npm run dev

# Server running on http://localhost:5000
```

### **Frontend Setup**

```bash
# 1. Navigate to frontend
cd forge-frontend

# 2. Install dependencies
npm install

# 3. Create .env file
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

# 4. Start dev server
npm run dev

# App running on http://localhost:5173
```

### **Environment Variables**

**Backend (.env)**
```
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=mysql://root:password@localhost:3306/forge

# Redis
REDIS_URL=redis://default:password@localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars-long
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Google Gemini
GEMINI_API_KEY=AIza...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# Frontend
CLIENT_URL=http://localhost:5173

# GitHub
GITHUB_TOKEN=ghp_...  # Optional, for higher rate limits
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY=rzp_test_...
```

---

## 📝 Development Workflow

### **Starting Local Development**

**Terminal 1 - Backend:**
```bash
cd forge-backend
npm run dev

# Output:
# 🔥 Forge backend running
#    Port       : 5000
#    Environment: development
#    API base   : http://localhost:5000/api/v1
#    Health     : http://localhost:5000/health
```

**Terminal 2 - Frontend:**
```bash
cd forge-frontend
npm run dev

# Output:
# VITE v5.2.0  ready in 234 ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### **Testing the App**

1. **Open Browser**
   - Go to `http://localhost:5173`

2. **Register New Account**
   - Click "Sign Up"
   - Enter email, password, name
   - Get 20 free credits

3. **Create Project**
   - Click "New Project"
   - Enter voice/image/text input
   - Click "Generate"
   - Watch real-time progress

4. **View Artifacts**
   - See PRD, Schema, Components, Sprints, Repos
   - Fork to refine blueprints
   - Copy/download artifacts

5. **Buy Credits**
   - Go to "Credits" page
   - Select plan
   - Use test Razorpay card: `4111 1111 1111 1111`
   - Complete payment

### **Database Migrations**

```bash
cd forge-backend

# Create migration after schema change
npm run db:migrate

# Name it: "add_new_field" → creates timestamped file

# Apply migrations
npm run db:push

# Open Prisma Studio (UI)
npm run db:studio
```

### **API Testing**

**Using cURL:**
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123","name":"John"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Generate blueprint (needs token)
curl -X POST http://localhost:5000/api/v1/forge/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"projectId":"proj_123","textInput":"Build a todo app"}'
```

**Using Postman:**
1. Import API collection
2. Set `{{baseUrl}}` variable to `http://localhost:5000/api/v1`
3. Set `{{accessToken}}` from login response
4. Test endpoints

### **Debugging**

**Backend Logs:**
```bash
# Enable verbose logging
NODE_ENV=development npm run dev

# Look for:
# 🔄 [Queue] Job started
# 📡 [Socket] Event emitted
# ⚠️  [Auth] Token verification failed
```

**Frontend Debugging:**
```javascript
// Open browser DevTools (F12)
// Check Network tab for API calls
// Check Console for errors
// Check Application → Cookies for refreshToken
```

**Database:**
```bash
# Open Prisma Studio
npm run db:studio

# Browse data in UI
```

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| **Backend Controllers** | 7 |
| **Backend Services** | 9 |
| **Routes** | 8 |
| **Frontend Pages** | 8 |
| **Frontend Components** | ~20+ |
| **Database Tables** | 7 |
| **API Endpoints** | 30+ |
| **Real-Time Events** | 8 |
| **Rate Limiters** | 3 |

---

## 🎓 Key Concepts to Understand

### **1. Async Job Queue (Bull)**
- Why? To avoid blocking HTTP requests with long AI operations
- How? Queue jobs to Redis, process in background
- Benefit? Better UX (immediate response) + reliability (auto-retry)

### **2. Real-Time WebSocket (Socket.io)**
- Why? To stream progress updates live
- How? Server emits events, client listens
- Benefit? Users see progress in real-time (not polling)

### **3. Credit System**
- Why? Monetize AI usage (metered billing)
- How? Deduct credits upfront, refund on failure
- Benefit? Predictable costs for users + revenue for platform

### **4. Iteration Versioning**
- Why? Let users refine blueprints
- How? Child iterations (with parent) store refinements
- Benefit? Git-like version history for blueprints

### **5. JWT Authentication**
- Why? Stateless, scalable auth (no sessions on server)
- How? Access token (short) + Refresh token (long)
- Benefit? Works across microservices + mobile apps

### **6. Rate Limiting**
- Why? Prevent abuse + quota management
- How? Redis-backed sliding window
- Benefit? Fair usage + cost control

---

## 🔗 Important Files Summary

| File | Purpose | Lines |
|------|---------|-------|
| `src/server.js` | Entry point | Setup HTTP + Socket.io |
| `src/app.js` | Express config | Middleware stack |
| `src/queue/forge.worker.js` | AI generation | Core magic ✨ |
| `src/services/gemini.service.js` | Gemini API | LLM calls |
| `src/controllers/forge.controller.js` | Request handler | Start generation |
| `prisma/schema.prisma` | Database schema | Data model |
| `forge-frontend/src/App.jsx` | Frontend router | Page routing |
| `forge-frontend/src/pages/NewProjectPage.jsx` | Generation form | User input |
| `forge-frontend/src/store/authStore.js` | Auth state | Zustand store |

---

## 🎯 Next Steps to Understand the Code

1. **Start with `README.md`** - Get high-level overview
2. **Read `src/server.js`** - Understand entry point
3. **Explore `src/queue/forge.worker.js`** - See generation pipeline
4. **Check `forge-frontend/src/pages/NewProjectPage.jsx`** - Frontend user flow
5. **Study `prisma/schema.prisma`** - Database structure
6. **Review API routes** - Understand all endpoints
7. **Run locally** - See it in action
8. **Debug a generation** - Step through the code

---

## 📞 Quick Reference

**Backend Commands:**
```bash
npm run dev           # Start dev server
npm run db:migrate   # Create database migration
npm run db:push      # Apply migrations
npm run db:studio    # Open database UI
```

**Frontend Commands:**
```bash
npm run dev           # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Check code quality
```

**API Base URL:** `http://localhost:5000/api/v1`
**Frontend URL:** `http://localhost:5173`
**Prisma Studio:** `http://localhost:5555`

---

**Created:** May 12, 2026  
**Project:** Forge - AI Developer Tool  
**Author:** Development Team

This documentation is a living document. Update it as the project evolves!
