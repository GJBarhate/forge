-- forge-database/scripts/03_seed.sql
-- ============================================================
-- Development seed data — 2 users, 3 projects each, iterations + artifacts
-- Run: mysql -u forge_user -p forge_db < scripts/03_seed.sql
-- ============================================================

USE forge_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data
TRUNCATE TABLE artifacts;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE iterations;
TRUNCATE TABLE projects;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS (password: Forge2024! — bcrypt $2a$12$ hash)
-- ============================================================
INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES
('usr_dev001', 'user1@forge.dev', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Alice Dev', NOW(3), NOW(3)),
('usr_dev002', 'user2@forge.dev', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Bob Builder', NOW(3), NOW(3));

-- ============================================================
-- PROJECTS
-- ============================================================
INSERT INTO projects (id, user_id, name, status, created_at, updated_at) VALUES
('prj_001', 'usr_dev001', 'TaskFlow Pro', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 10 DAY), DATE_SUB(NOW(3), INTERVAL 9 DAY)),
('prj_002', 'usr_dev001', 'DevPulse CI Dashboard', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 7 DAY), DATE_SUB(NOW(3), INTERVAL 6 DAY)),
('prj_003', 'usr_dev001', 'SnapCart E-commerce', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 2 DAY), DATE_SUB(NOW(3), INTERVAL 2 DAY)),
('prj_004', 'usr_dev002', 'FreelanceHub Invoicing', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 8 DAY), DATE_SUB(NOW(3), INTERVAL 7 DAY)),
('prj_005', 'usr_dev002', 'KnowledgeNest Platform', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 5 DAY), DATE_SUB(NOW(3), INTERVAL 4 DAY)),
('prj_006', 'usr_dev002', 'CryptoWatch Portfolio', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 1 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY));

-- ============================================================
-- ITERATIONS (with parent_id branching)
-- ============================================================
INSERT INTO iterations (id, project_id, parent_id, voice_input, text_input, status, created_at) VALUES
-- Project 1: TaskFlow Pro
('itr_001', 'prj_001', NULL, 'I want to build an async standup tool for remote teams. The main problem is too many status meetings. Users should be able to record a 60 second voice standup daily.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 10 DAY)),
('itr_002', 'prj_001', 'itr_001', NULL, 'Add Slack integration for blocker alerts. When AI detects a blocker in a standup, automatically DM the responsible person.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 9 DAY)),
('itr_003', 'prj_001', 'itr_001', 'What if we also add a weekly digest email with team standup summaries? Could be really useful for managers.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

-- Project 2: DevPulse
('itr_004', 'prj_002', NULL, NULL, 'Build a CI/CD dashboard that aggregates builds from GitHub Actions, CircleCI, and Jenkins into one view. Show build times, failure rates, and deployment frequency.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 7 DAY)),
('itr_005', 'prj_002', 'itr_004', 'Add alerting system. When build fails 3 times in a row, send a PagerDuty alert and post to Slack channel.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 6 DAY)),

-- Project 3: SnapCart (in progress)
('itr_006', 'prj_003', NULL, 'Fashion marketplace where independent designers can sell limited edition drops. Each product has a countdown timer. Users can wishlist items and get notified when a drop goes live.', NULL, 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 2 DAY)),

-- Project 4: FreelanceHub
('itr_007', 'prj_004', NULL, NULL, 'Invoicing app for freelancers. Create invoices, track payment status, send automated reminders. Support multiple currencies and tax rates per country.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 8 DAY)),
('itr_008', 'prj_004', 'itr_007', 'Add a client portal where clients can view and pay invoices online. Stripe integration for payments.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

-- Project 5: KnowledgeNest
('itr_009', 'prj_005', NULL, 'Developer knowledge sharing platform. Engineers write short TIL posts, tag them, and others can upvote. Monthly digest sent to subscribers.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

-- Project 6: CryptoWatch
('itr_010', 'prj_006', NULL, 'Crypto portfolio tracker. Connect wallets and exchanges via API. Show real-time P&L, allocation pie chart, and tax report export.', NULL, 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 1 DAY));

-- ============================================================
-- ARTIFACTS (complete iterations only)
-- ============================================================

-- itr_001: TaskFlow Pro initial
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_001', 'itr_001', 'PRD', '{
  "title": "TaskFlow Pro",
  "tagline": "The async-first team coordination tool",
  "problem": "Remote teams lose 2 hours daily to status update meetings that could be async voice notes and structured updates.",
  "users": [
    { "persona": "Engineering Lead", "pain": "Interrupt-driven workflow kills deep work" },
    { "persona": "Remote PM", "pain": "No visibility into blockers without a meeting" }
  ],
  "features": [
    {
      "name": "Async standup",
      "priority": "P0",
      "description": "Record a 60-second voice standup; AI transcribes and structures it into yesterday/today/blockers format",
      "acceptance": ["Voice recording under 90s", "Auto-transcription within 5s", "Structured format preserved in feed"]
    },
    {
      "name": "Smart blocker alerts",
      "priority": "P1",
      "description": "AI detects blockers in standups and notifies the responsible team member via Slack",
      "acceptance": ["Blocker detected with 90% accuracy", "Slack DM sent within 30s", "Blocker resolved flag in UI"]
    }
  ],
  "positioning": "Cheaper than Linear, more async than Jira, less chaotic than Slack threads"
}', DATE_SUB(NOW(3), INTERVAL 10 DAY)),

('art_002', 'itr_001', 'SCHEMA', '{
  "schema": "model User {\\n  id        String   @id @default(cuid())\\n  email     String   @unique\\n  name      String?\\n  standups  Standup[]\\n  createdAt DateTime @default(now())\\n}\\n\\nmodel Standup {\\n  id        String   @id @default(cuid())\\n  userId    String\\n  user      User     @relation(fields: [userId], references: [id])\\n  audioUrl  String?\\n  transcript String? @db.Text\\n  yesterday String?  @db.Text\\n  today     String?  @db.Text\\n  blockers  Blocker[]\\n  createdAt DateTime @default(now())\\n  @@index([userId])\\n}\\n\\nmodel Blocker {\\n  id         String   @id @default(cuid())\\n  standupId  String\\n  standup    Standup  @relation(fields: [standupId], references: [id])\\n  description String  @db.Text\\n  resolved   Boolean  @default(false)\\n  createdAt  DateTime @default(now())\\n}"
}', DATE_SUB(NOW(3), INTERVAL 10 DAY)),

('art_003', 'itr_001', 'COMPONENT_TREE', '{
  "name": "App",
  "props": {},
  "children": [
    {
      "name": "AuthProvider",
      "props": { "children": "ReactNode" },
      "children": [
        {
          "name": "Router",
          "props": {},
          "children": [
            {
              "name": "DashboardPage",
              "props": { "userId": "string" },
              "children": [
                { "name": "TeamFeed", "props": { "standups": "Standup[]" }, "children": [] },
                { "name": "RecordButton", "props": { "onComplete": "() => void" }, "children": [] },
                { "name": "BlockerList", "props": { "blockers": "Blocker[]", "onResolve": "fn" }, "children": [] }
              ]
            }
          ]
        }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 10 DAY)),

('art_004', 'itr_001', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Foundation",
      "tasks": [
        { "title": "Setup auth system", "description": "JWT + refresh tokens with HttpOnly cookies", "hours": 8, "priority": "P0" },
        { "title": "Database schema", "description": "Prisma models + migrations for User, Standup, Blocker", "hours": 4, "priority": "P0" },
        { "title": "Voice recording component", "description": "MediaRecorder API with 90s limit and waveform visualizer", "hours": 6, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Core Features",
      "tasks": [
        { "title": "Whisper transcription API", "description": "Server-side audio upload + Whisper STT integration", "hours": 8, "priority": "P0" },
        { "title": "AI standup parser", "description": "GPT-4 extracts yesterday/today/blockers from transcript", "hours": 10, "priority": "P0" },
        { "title": "Team feed UI", "description": "Real-time feed of team standups with expandable cards", "hours": 6, "priority": "P1" },
        { "title": "Slack webhook integration", "description": "Post blocker alerts to configurable Slack channel", "hours": 5, "priority": "P1" }
      ]
    },
    {
      "name": "Sprint 3 — Polish & Launch",
      "tasks": [
        { "title": "Dashboard analytics", "description": "Weekly standup completion rate, avg blocker resolution time", "hours": 8, "priority": "P2" },
        { "title": "Email digest", "description": "Daily email with team standup summary at 9am", "hours": 5, "priority": "P2" },
        { "title": "Mobile responsive UI", "description": "Tailwind responsive breakpoints for all pages", "hours": 6, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 10 DAY));

-- itr_002: TaskFlow Pro + Slack fork
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_005', 'itr_002', 'PRD', '{
  "title": "TaskFlow Pro — Slack Edition",
  "tagline": "Async standups that live inside Slack",
  "problem": "Teams already live in Slack. Forcing them to a new app adds friction.",
  "users": [
    { "persona": "Slack-first teams", "pain": "Tool switching reduces adoption" },
    { "persona": "Remote Engineering Lead", "pain": "Blocker visibility lag causes blocked teammates" }
  ],
  "features": [
    { "name": "/standup slash command", "priority": "P0", "description": "Record and submit standup directly from Slack", "acceptance": ["Works in any Slack workspace", "Response appears in team channel"] },
    { "name": "Blocker DM", "priority": "P0", "description": "Auto-DM the mentioned person when a blocker is detected", "acceptance": ["Detected within 10s of standup submit", "DM includes blocker context and quick-resolve button"] }
  ],
  "positioning": "The standup bot that actually works — no new app, no context switch"
}', DATE_SUB(NOW(3), INTERVAL 9 DAY)),

('art_006', 'itr_002', 'SCHEMA', '{
  "schema": "model SlackWorkspace {\\n  id          String @id @default(cuid())\\n  teamId      String @unique\\n  accessToken String\\n  botUserId   String\\n  users       User[]\\n  createdAt   DateTime @default(now())\\n}\\n\\nmodel User {\\n  id          String @id @default(cuid())\\n  slackUserId String @unique\\n  workspaceId String\\n  workspace   SlackWorkspace @relation(fields: [workspaceId], references: [id])\\n  standups    Standup[]\\n  createdAt   DateTime @default(now())\\n}\\n\\nmodel Standup {\\n  id        String @id @default(cuid())\\n  userId    String\\n  user      User   @relation(fields: [userId], references: [id])\\n  yesterday String @db.Text\\n  today     String @db.Text\\n  blockers  String? @db.Text\\n  channelId String\\n  createdAt DateTime @default(now())\\n}"
}', DATE_SUB(NOW(3), INTERVAL 9 DAY)),

('art_007', 'itr_002', 'COMPONENT_TREE', '{
  "name": "SlackApp",
  "props": {},
  "children": [
    { "name": "SlashCommandHandler", "props": { "command": "/standup" }, "children": [
      { "name": "StandupModal", "props": { "userId": "string", "channelId": "string" }, "children": [
        { "name": "YesterdayInput", "props": {}, "children": [] },
        { "name": "TodayInput", "props": {}, "children": [] },
        { "name": "BlockersInput", "props": {}, "children": [] },
        { "name": "SubmitButton", "props": { "onSubmit": "fn" }, "children": [] }
      ]}
    ]},
    { "name": "BlockerDetector", "props": { "onBlockerFound": "fn" }, "children": [] },
    { "name": "DMSender", "props": { "slackClient": "WebClient" }, "children": [] }
  ]
}', DATE_SUB(NOW(3), INTERVAL 9 DAY)),

('art_008', 'itr_002', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Slack OAuth",
      "tasks": [
        { "title": "Slack OAuth 2.0 flow", "description": "Install to workspace button + token storage", "hours": 6, "priority": "P0" },
        { "title": "/standup slash command", "description": "Register command, open modal on trigger", "hours": 4, "priority": "P0" },
        { "title": "Standup modal UI", "description": "Slack Block Kit modal with 3 fields", "hours": 3, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — AI Blocker Detection",
      "tasks": [
        { "title": "AI blocker extractor", "description": "Send standup text to Gemini, extract blockers as JSON", "hours": 8, "priority": "P0" },
        { "title": "Auto DM on blocker", "description": "Parse @mentions in blocker field, send DM via Slack API", "hours": 5, "priority": "P0" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 9 DAY));

-- itr_003: Weekly digest fork
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_009', 'itr_003', 'PRD', '{
  "title": "TaskFlow Pro — Weekly Digest",
  "tagline": "Your team week in one email",
  "problem": "Managers need a weekly summary of team activity without reading every standup.",
  "users": [
    { "persona": "Engineering Manager", "pain": "Spending 30 min every Friday compiling status for leadership" }
  ],
  "features": [
    { "name": "Auto weekly digest", "priority": "P0", "description": "Every Friday at 5pm, send a digest email summarizing the week: completion rate, blockers resolved, highlights", "acceptance": ["Sent within 5 min of scheduled time", "Contains all team members who submitted standups", "Unresolved blockers highlighted in red"] }
  ],
  "positioning": "Set it and forget it manager reporting"
}', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

('art_010', 'itr_003', 'SCHEMA', '{
  "schema": "model DigestConfig {\\n  id          String @id @default(cuid())\\n  teamId      String @unique\\n  enabled     Boolean @default(true)\\n  sendDay     Int @default(5)\\n  sendHour    Int @default(17)\\n  recipients  String @db.Text\\n  createdAt   DateTime @default(now())\\n}\\n\\nmodel DigestLog {\\n  id        String @id @default(cuid())\\n  teamId    String\\n  sentAt    DateTime @default(now())\\n  recipient String\\n  status    String\\n}"
}', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

('art_011', 'itr_003', 'COMPONENT_TREE', '{
  "name": "DigestScheduler",
  "props": { "cron": "0 17 * * 5" },
  "children": [
    { "name": "TeamStandupAggregator", "props": { "weekStart": "Date", "weekEnd": "Date" }, "children": [] },
    { "name": "DigestEmailRenderer", "props": { "data": "DigestData" }, "children": [
      { "name": "TeamSummarySection", "props": {}, "children": [] },
      { "name": "BlockerHighlightSection", "props": {}, "children": [] },
      { "name": "TopContributorSection", "props": {}, "children": [] }
    ]},
    { "name": "EmailSender", "props": { "provider": "resend" }, "children": [] }
  ]
}', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

('art_012', 'itr_003', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Digest Pipeline",
      "tasks": [
        { "title": "Cron job scheduler", "description": "node-cron job that fires every Friday at 5pm per team timezone", "hours": 4, "priority": "P0" },
        { "title": "Standup aggregation query", "description": "Fetch all standups for the week, compute stats", "hours": 3, "priority": "P0" },
        { "title": "Email template", "description": "React Email template with team summary layout", "hours": 5, "priority": "P0" },
        { "title": "Resend API integration", "description": "Send via Resend with retry logic", "hours": 3, "priority": "P0" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 8 DAY));

-- itr_004: DevPulse
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_013', 'itr_004', 'PRD', '{
  "title": "DevPulse",
  "tagline": "One dashboard for all your CI/CD pipelines",
  "problem": "Engineering teams use 2-3 different CI tools and have no unified view of build health and deployment velocity.",
  "users": [
    { "persona": "DevOps Engineer", "pain": "Switching between GitHub Actions, CircleCI, and Jenkins tabs all day" },
    { "persona": "Engineering Director", "pain": "No DORA metrics visibility without custom scripts" }
  ],
  "features": [
    { "name": "Multi-CI aggregator", "priority": "P0", "description": "Connect GitHub Actions, CircleCI, and Jenkins via API keys. Normalize build data into unified schema.", "acceptance": ["All 3 integrations live", "Builds refresh every 30s", "Historical data going back 90 days"] },
    { "name": "DORA metrics dashboard", "priority": "P1", "description": "Display deployment frequency, lead time, MTTR, change failure rate", "acceptance": ["4 DORA metrics displayed", "Trend line per metric per 30/60/90 days", "Export to CSV"] }
  ],
  "positioning": "DORA metrics out of the box, no data warehouse required"
}', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

('art_014', 'itr_004', 'SCHEMA', '{
  "schema": "model Integration {\\n  id       String @id @default(cuid())\\n  teamId   String\\n  provider String\\n  apiKey   String\\n  baseUrl  String?\\n  builds   Build[]\\n  createdAt DateTime @default(now())\\n}\\n\\nmodel Build {\\n  id            String @id @default(cuid())\\n  integrationId String\\n  integration   Integration @relation(fields: [integrationId], references: [id])\\n  externalId    String\\n  branch        String\\n  status        String\\n  duration      Int\\n  startedAt     DateTime\\n  finishedAt    DateTime?\\n  triggeredBy   String?\\n  @@index([integrationId, startedAt])\\n}"
}', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

('art_015', 'itr_004', 'COMPONENT_TREE', '{
  "name": "DevPulseApp",
  "props": {},
  "children": [
    { "name": "IntegrationsSetup", "props": { "onSave": "fn" }, "children": [] },
    { "name": "BuildsDashboard", "props": { "teamId": "string" }, "children": [
      { "name": "BuildStatusFeed", "props": { "builds": "Build[]" }, "children": [] },
      { "name": "DORAMetricsPanel", "props": { "range": "30 | 60 | 90" }, "children": [
        { "name": "DeployFrequencyChart", "props": {}, "children": [] },
        { "name": "LeadTimeChart", "props": {}, "children": [] },
        { "name": "ChangeFailureRateChart", "props": {}, "children": [] },
        { "name": "MTTRChart", "props": {}, "children": [] }
      ]},
      { "name": "ExportButton", "props": { "format": "csv" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

('art_016', 'itr_004', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Integrations",
      "tasks": [
        { "title": "GitHub Actions API client", "description": "Fetch workflow runs, normalize to Build schema", "hours": 8, "priority": "P0" },
        { "title": "CircleCI API client", "description": "Fetch pipeline runs, normalize to Build schema", "hours": 6, "priority": "P0" },
        { "title": "Jenkins API client", "description": "Fetch job runs via Jenkins REST API", "hours": 8, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — DORA Metrics",
      "tasks": [
        { "title": "Deployment frequency calculator", "description": "Count deploys to main per day, rolling average", "hours": 4, "priority": "P1" },
        { "title": "Lead time calculator", "description": "Time from first commit to production deploy", "hours": 6, "priority": "P1" },
        { "title": "MTTR calculator", "description": "Time from failed build to next successful deploy", "hours": 5, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 7 DAY));

-- itr_005: DevPulse alerting fork
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_017', 'itr_005', 'PRD', '{
  "title": "DevPulse — Alert System",
  "tagline": "Never miss a cascading build failure",
  "problem": "Teams discover build failures too late, causing blocked deploys and production delays.",
  "users": [
    { "persona": "On-call engineer", "pain": "Only discovers build failures when deploy is already blocked" }
  ],
  "features": [
    { "name": "Consecutive failure alert", "priority": "P0", "description": "If same pipeline fails 3 times in a row, trigger PagerDuty + Slack alert", "acceptance": ["Alert fires within 60s of 3rd failure", "Includes build link and error snippet", "Auto-resolve when build passes"] }
  ],
  "positioning": "Catch cascading failures before they become incidents"
}', DATE_SUB(NOW(3), INTERVAL 6 DAY)),

('art_018', 'itr_005', 'SCHEMA', '{
  "schema": "model AlertRule {\\n  id            String @id @default(cuid())\\n  integrationId String\\n  consecutiveFails Int @default(3)\\n  slackWebhook  String?\\n  pagerdutyKey  String?\\n  enabled       Boolean @default(true)\\n  alerts        Alert[]\\n  createdAt     DateTime @default(now())\\n}\\n\\nmodel Alert {\\n  id          String @id @default(cuid())\\n  ruleId      String\\n  rule        AlertRule @relation(fields: [ruleId], references: [id])\\n  buildId     String\\n  status      String\\n  sentAt      DateTime @default(now())\\n  resolvedAt  DateTime?\\n}"
}', DATE_SUB(NOW(3), INTERVAL 6 DAY)),

('art_019', 'itr_005', 'COMPONENT_TREE', '{
  "name": "AlertSystem",
  "props": {},
  "children": [
    { "name": "AlertRulesConfig", "props": { "integrations": "Integration[]" }, "children": [] },
    { "name": "BuildMonitor", "props": { "pollingInterval": 30000 }, "children": [
      { "name": "ConsecutiveFailureDetector", "props": { "threshold": 3 }, "children": [] },
      { "name": "PagerDutyNotifier", "props": { "apiKey": "string" }, "children": [] },
      { "name": "SlackNotifier", "props": { "webhookUrl": "string" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 6 DAY)),

('art_020', 'itr_005', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Alert Engine",
      "tasks": [
        { "title": "Failure streak detector", "description": "Track consecutive failures per pipeline in Redis, trigger at threshold", "hours": 5, "priority": "P0" },
        { "title": "PagerDuty integration", "description": "Create incident via PagerDuty Events API v2", "hours": 4, "priority": "P0" },
        { "title": "Slack notification", "description": "Post rich message to channel with build details", "hours": 3, "priority": "P0" },
        { "title": "Auto-resolve on success", "description": "Resolve PagerDuty incident and post Slack recovery message", "hours": 3, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 6 DAY));

-- itr_007: FreelanceHub
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_021', 'itr_007', 'PRD', '{
  "title": "FreelanceHub",
  "tagline": "Invoicing that takes 2 minutes, not 20",
  "problem": "Freelancers spend 3+ hours per week on invoicing, follow-ups, and tracking who has paid.",
  "users": [
    { "persona": "Freelance Developer", "pain": "Chasing payments is humiliating and time-consuming" },
    { "persona": "Design Consultant", "pain": "Spreadsheet invoicing doesnt scale past 5 clients" }
  ],
  "features": [
    { "name": "Quick invoice creator", "priority": "P0", "description": "Create invoice in under 2 minutes: select client, add line items, set due date, send", "acceptance": ["Under 10 clicks to send invoice", "PDF auto-generated", "Email delivered within 60s"] },
    { "name": "Auto payment reminders", "priority": "P0", "description": "Automated reminders at 7 days before, on due date, 3 days after if unpaid", "acceptance": ["3 reminder templates customizable", "Reminders stop when invoice marked paid", "Can be disabled per invoice"] },
    { "name": "Multi-currency support", "priority": "P1", "description": "Invoice in USD, EUR, GBP, INR. Auto-convert using live exchange rates.", "acceptance": ["8 currencies supported", "Rate fetched at invoice creation time", "Displayed on PDF"] }
  ],
  "positioning": "Wave is too complex, a Google Doc is too manual — FreelanceHub is just right"
}', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

('art_022', 'itr_007', 'SCHEMA', '{
  "schema": "model Client {\\n  id       String @id @default(cuid())\\n  userId   String\\n  name     String\\n  email    String\\n  address  String? @db.Text\\n  currency String @default(\\"USD\\")\\n  invoices Invoice[]\\n  createdAt DateTime @default(now())\\n}\\n\\nmodel Invoice {\\n  id        String @id @default(cuid())\\n  clientId  String\\n  client    Client @relation(fields: [clientId], references: [id])\\n  number    String @unique\\n  status    String @default(\\"DRAFT\\")\\n  dueDate   DateTime\\n  lineItems Json\\n  total     Decimal @db.Decimal(10,2)\\n  currency  String\\n  pdfUrl    String?\\n  reminders Reminder[]\\n  createdAt DateTime @default(now())\\n}\\n\\nmodel Reminder {\\n  id        String @id @default(cuid())\\n  invoiceId String\\n  invoice   Invoice @relation(fields: [invoiceId], references: [id])\\n  sentAt    DateTime\\n  type      String\\n}"
}', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

('art_023', 'itr_007', 'COMPONENT_TREE', '{
  "name": "FreelanceHubApp",
  "props": {},
  "children": [
    { "name": "ClientsPage", "props": {}, "children": [
      { "name": "ClientList", "props": { "clients": "Client[]" }, "children": [] },
      { "name": "AddClientModal", "props": { "onSave": "fn" }, "children": [] }
    ]},
    { "name": "InvoicesPage", "props": {}, "children": [
      { "name": "InvoiceList", "props": { "invoices": "Invoice[]" }, "children": [] },
      { "name": "InvoiceCreator", "props": { "clients": "Client[]" }, "children": [
        { "name": "LineItemsEditor", "props": {}, "children": [] },
        { "name": "CurrencySelector", "props": {}, "children": [] },
        { "name": "DueDatePicker", "props": {}, "children": [] }
      ]},
      { "name": "InvoicePDFPreview", "props": { "invoice": "Invoice" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 8 DAY)),

('art_024', 'itr_007', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Core Invoicing",
      "tasks": [
        { "title": "Client CRUD", "description": "Create, read, update, delete clients with contact info", "hours": 4, "priority": "P0" },
        { "title": "Invoice creator UI", "description": "Multi-step form: client select, line items, due date, preview", "hours": 10, "priority": "P0" },
        { "title": "PDF generation", "description": "Puppeteer or PDFKit invoice PDF with branding", "hours": 6, "priority": "P0" },
        { "title": "Email delivery", "description": "Send invoice PDF via Resend with custom from address", "hours": 4, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Reminders & Payments",
      "tasks": [
        { "title": "Reminder scheduler", "description": "Cron-based reminder system with configurable templates", "hours": 6, "priority": "P0" },
        { "title": "Payment status tracking", "description": "Manual mark-as-paid + Stripe webhook for auto-update", "hours": 5, "priority": "P0" },
        { "title": "Exchange rate API", "description": "Fetch live rates from Open Exchange Rates at invoice creation", "hours": 3, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 8 DAY));

-- itr_008: FreelanceHub client portal
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_025', 'itr_008', 'PRD', '{
  "title": "FreelanceHub — Client Portal",
  "tagline": "Let clients pay you in one click",
  "problem": "Clients lose invoices, forget payment methods, and need to email back asking how to pay.",
  "users": [
    { "persona": "Client (SMB owner)", "pain": "Cannot find the invoice email from 3 weeks ago" }
  ],
  "features": [
    { "name": "Client payment portal", "priority": "P0", "description": "Magic-link access to client portal showing all invoices and payment history. Pay via Stripe.", "acceptance": ["No password required — magic link via email", "All invoices visible", "Stripe checkout completes in 3 clicks"] }
  ],
  "positioning": "Make it so easy to pay you that clients have no excuse not to"
}', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

('art_026', 'itr_008', 'SCHEMA', '{
  "schema": "model MagicLink {\\n  id        String @id @default(cuid())\\n  clientId  String\\n  token     String @unique\\n  expiresAt DateTime\\n  usedAt    DateTime?\\n  createdAt DateTime @default(now())\\n}\\n\\nmodel Payment {\\n  id              String @id @default(cuid())\\n  invoiceId       String\\n  amount          Decimal @db.Decimal(10,2)\\n  currency        String\\n  stripePaymentId String @unique\\n  status          String\\n  paidAt          DateTime?\\n  createdAt       DateTime @default(now())\\n}"
}', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

('art_027', 'itr_008', 'COMPONENT_TREE', '{
  "name": "ClientPortal",
  "props": { "magicToken": "string" },
  "children": [
    { "name": "MagicLinkVerifier", "props": { "token": "string" }, "children": [] },
    { "name": "InvoiceListView", "props": { "invoices": "Invoice[]" }, "children": [
      { "name": "InvoiceCard", "props": { "invoice": "Invoice" }, "children": [
        { "name": "PayNowButton", "props": { "stripePublicKey": "string" }, "children": [] },
        { "name": "DownloadPDFButton", "props": {}, "children": [] }
      ]}
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 7 DAY)),

('art_028', 'itr_008', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Portal",
      "tasks": [
        { "title": "Magic link generation", "description": "Generate secure token, store hashed, send email", "hours": 4, "priority": "P0" },
        { "title": "Client portal UI", "description": "Public route /portal/:token with invoice list", "hours": 6, "priority": "P0" },
        { "title": "Stripe Checkout integration", "description": "Create Stripe Checkout session, redirect client", "hours": 5, "priority": "P0" },
        { "title": "Stripe webhook handler", "description": "Mark invoice paid on payment_intent.succeeded", "hours": 4, "priority": "P0" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 7 DAY));

-- itr_009: KnowledgeNest
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_029', 'itr_009', 'PRD', '{
  "title": "KnowledgeNest",
  "tagline": "Short lessons from engineers, for engineers",
  "problem": "Developer knowledge lives in Slack threads and browser bookmarks that nobody can find 6 months later.",
  "users": [
    { "persona": "Senior Engineer", "pain": "Answers the same question 10x in Slack every month" },
    { "persona": "Junior Developer", "pain": "Cannot find authoritative internal answers, falls back to Stack Overflow" }
  ],
  "features": [
    { "name": "TIL post format", "priority": "P0", "description": "Today I Learned post: title, body (markdown), tags, code snippet. Max 500 words to enforce brevity.", "acceptance": ["500 word limit enforced", "Code syntax highlighting", "Tag autocomplete from existing tags"] },
    { "name": "Upvote + bookmark", "priority": "P1", "description": "Engineers upvote useful posts, bookmark for personal reference", "acceptance": ["One upvote per user per post", "Bookmark list in user profile"] },
    { "name": "Monthly digest newsletter", "priority": "P1", "description": "Top 10 most upvoted posts of the month emailed to subscribers on the 1st", "acceptance": ["Opt-in subscription", "Sent by 9am on 1st of month", "Unsubscribe link in every email"] }
  ],
  "positioning": "Stack Overflow for your team — private, searchable, and actually maintained"
}', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

('art_030', 'itr_009', 'SCHEMA', '{
  "schema": "model Post {\\n  id        String @id @default(cuid())\\n  authorId  String\\n  author    User @relation(fields: [authorId], references: [id])\\n  title     String\\n  body      String @db.Text\\n  tags      Tag[]\\n  upvotes   Upvote[]\\n  bookmarks Bookmark[]\\n  createdAt DateTime @default(now())\\n  updatedAt DateTime @updatedAt\\n  @@fulltext([title, body])\\n}\\n\\nmodel Tag {\\n  id    String @id @default(cuid())\\n  name  String @unique\\n  posts Post[]\\n}\\n\\nmodel Upvote {\\n  userId String\\n  postId String\\n  post   Post @relation(fields: [postId], references: [id])\\n  @@id([userId, postId])\\n}\\n\\nmodel Bookmark {\\n  userId    String\\n  postId    String\\n  post      Post @relation(fields: [postId], references: [id])\\n  createdAt DateTime @default(now())\\n  @@id([userId, postId])\\n}"
}', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

('art_031', 'itr_009', 'COMPONENT_TREE', '{
  "name": "KnowledgeNestApp",
  "props": {},
  "children": [
    { "name": "FeedPage", "props": { "sort": "trending | latest | top" }, "children": [
      { "name": "PostCard", "props": { "post": "Post" }, "children": [
        { "name": "UpvoteButton", "props": { "count": "number" }, "children": [] },
        { "name": "TagBadges", "props": { "tags": "Tag[]" }, "children": [] },
        { "name": "BookmarkButton", "props": {}, "children": [] }
      ]}
    ]},
    { "name": "PostEditor", "props": { "onPublish": "fn" }, "children": [
      { "name": "MarkdownEditor", "props": { "maxWords": 500 }, "children": [] },
      { "name": "TagSelector", "props": { "existing": "Tag[]" }, "children": [] }
    ]},
    { "name": "SearchBar", "props": { "onSearch": "fn" }, "children": [] }
  ]
}', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

('art_032', 'itr_009', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Posts",
      "tasks": [
        { "title": "Post CRUD with markdown", "description": "Create, view, edit posts with markdown rendering", "hours": 8, "priority": "P0" },
        { "title": "Full-text search", "description": "MySQL FULLTEXT index on title + body", "hours": 3, "priority": "P0" },
        { "title": "Tag system", "description": "Many-to-many tags with autocomplete", "hours": 4, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Social + Digest",
      "tasks": [
        { "title": "Upvote system", "description": "Idempotent upvote endpoint with count cache in Redis", "hours": 4, "priority": "P1" },
        { "title": "Bookmark system", "description": "Save and retrieve bookmarks per user", "hours": 3, "priority": "P1" },
        { "title": "Monthly digest cron", "description": "Top 10 posts query, React Email template, Resend delivery", "hours": 6, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 5 DAY));

-- ============================================================
-- REFRESH TOKENS (7-day expiry, not revoked)
-- ============================================================
INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at) VALUES
('rtk_001', 'usr_dev001', SHA2(CONCAT('dev_refresh_token_user1_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3)),
('rtk_002', 'usr_dev002', SHA2(CONCAT('dev_refresh_token_user2_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3));

SELECT 'Development seed data inserted successfully.' AS status;
SELECT 'Users: user1@forge.dev / user2@forge.dev — Password: Forge2024!' AS note;
