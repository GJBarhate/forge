-- forge-database/scripts/04_seed_demo.sql
-- ============================================================
-- Rich demo data for showcasing Forge. 5 users, 5+ projects each.
-- Run AFTER 03_seed.sql: mysql -u forge_user -p forge_db < scripts/04_seed_demo.sql
-- ============================================================

USE forge_db;

-- ============================================================
-- DEMO USERS
-- ============================================================
INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES
('usr_dm001', 'sarah.chen@demo.forge', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Sarah Chen', DATE_SUB(NOW(3), INTERVAL 30 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY)),
('usr_dm002', 'marcus.okafor@demo.forge', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Marcus Okafor', DATE_SUB(NOW(3), INTERVAL 25 DAY), DATE_SUB(NOW(3), INTERVAL 2 DAY)),
('usr_dm003', 'priya.sharma@demo.forge', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Priya Sharma', DATE_SUB(NOW(3), INTERVAL 20 DAY), DATE_SUB(NOW(3), INTERVAL 3 DAY)),
('usr_dm004', 'luca.ferrari@demo.forge', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Luca Ferrari', DATE_SUB(NOW(3), INTERVAL 15 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY)),
('usr_dm005', 'anya.volkov@demo.forge', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oC0vKjbLm', 'Anya Volkov', DATE_SUB(NOW(3), INTERVAL 10 DAY), NOW(3));

-- ============================================================
-- DEMO PROJECTS — Sarah Chen (SaaS focus)
-- ============================================================
INSERT INTO projects (id, user_id, name, status, created_at, updated_at) VALUES
('prj_dm01', 'usr_dm001', 'CRMLite — Small Business CRM', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 28 DAY), DATE_SUB(NOW(3), INTERVAL 25 DAY)),
('prj_dm02', 'usr_dm001', 'ExpenseFlow — Expense Tracker', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 20 DAY), DATE_SUB(NOW(3), INTERVAL 17 DAY)),
('prj_dm03', 'usr_dm001', 'MeetingMind — AI Meeting Notes', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 12 DAY), DATE_SUB(NOW(3), INTERVAL 9 DAY)),
('prj_dm04', 'usr_dm001', 'HireFlow — Applicant Tracker', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 3 DAY), DATE_SUB(NOW(3), INTERVAL 3 DAY)),
('prj_dm05', 'usr_dm001', 'DocSign — E-Signature Tool', 'FAILED', DATE_SUB(NOW(3), INTERVAL 5 DAY), DATE_SUB(NOW(3), INTERVAL 5 DAY));

-- Marcus Okafor (E-commerce & marketplace)
INSERT INTO projects (id, user_id, name, status, created_at, updated_at) VALUES
('prj_dm06', 'usr_dm002', 'ThreadMarket — Fashion Resale', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 22 DAY), DATE_SUB(NOW(3), INTERVAL 19 DAY)),
('prj_dm07', 'usr_dm002', 'BoxDrop — Subscription Box Platform', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 15 DAY), DATE_SUB(NOW(3), INTERVAL 12 DAY)),
('prj_dm08', 'usr_dm002', 'LocalEats — Restaurant Delivery', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 10 DAY), DATE_SUB(NOW(3), INTERVAL 7 DAY)),
('prj_dm09', 'usr_dm002', 'GearSwap — Sports Equipment Exchange', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 2 DAY), DATE_SUB(NOW(3), INTERVAL 2 DAY)),
('prj_dm10', 'usr_dm002', 'CraftHub — Artisan Marketplace', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 8 DAY), DATE_SUB(NOW(3), INTERVAL 5 DAY));

-- Priya Sharma (Dev tools & social)
INSERT INTO projects (id, user_id, name, status, created_at, updated_at) VALUES
('prj_dm11', 'usr_dm003', 'PortfolioOS — Developer Portfolio Builder', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 18 DAY), DATE_SUB(NOW(3), INTERVAL 15 DAY)),
('prj_dm12', 'usr_dm003', 'APIPlayground — HTTP Client Tool', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 13 DAY), DATE_SUB(NOW(3), INTERVAL 10 DAY)),
('prj_dm13', 'usr_dm003', 'DocGen — Auto Documentation Generator', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 9 DAY), DATE_SUB(NOW(3), INTERVAL 6 DAY)),
('prj_dm14', 'usr_dm003', 'CodeReview AI — PR Review Assistant', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 1 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY)),
('prj_dm15', 'usr_dm003', 'DevLog — Engineering Blog Platform', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 6 DAY), DATE_SUB(NOW(3), INTERVAL 3 DAY));

-- Luca Ferrari (Fintech)
INSERT INTO projects (id, user_id, name, status, created_at, updated_at) VALUES
('prj_dm16', 'usr_dm004', 'LedgerAI — Smart Bookkeeping', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 13 DAY), DATE_SUB(NOW(3), INTERVAL 10 DAY)),
('prj_dm17', 'usr_dm004', 'SplitWave — Group Expense Splitter', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 10 DAY), DATE_SUB(NOW(3), INTERVAL 7 DAY)),
('prj_dm18', 'usr_dm004', 'TaxBot — Freelancer Tax Calculator', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 7 DAY), DATE_SUB(NOW(3), INTERVAL 4 DAY)),
('prj_dm19', 'usr_dm004', 'CryptoTax — Crypto Tax Reporter', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 2 DAY), DATE_SUB(NOW(3), INTERVAL 2 DAY)),
('prj_dm20', 'usr_dm004', 'BudgetBuddy — Personal Finance', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 4 DAY), DATE_SUB(NOW(3), INTERVAL 1 DAY));

-- Anya Volkov (Social & content)
INSERT INTO projects (id, user_id, name, status, created_at, updated_at) VALUES
('prj_dm21', 'usr_dm005', 'MicroBlog — Developer Microblogging', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 9 DAY), DATE_SUB(NOW(3), INTERVAL 6 DAY)),
('prj_dm22', 'usr_dm005', 'LearnLoop — Peer Learning Circles', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 7 DAY), DATE_SUB(NOW(3), INTERVAL 4 DAY)),
('prj_dm23', 'usr_dm005', 'SprintCast — Podcast for Developers', 'PROCESSING', DATE_SUB(NOW(3), INTERVAL 3 DAY), DATE_SUB(NOW(3), INTERVAL 3 DAY)),
('prj_dm24', 'usr_dm005', 'MentorMatch — Dev Mentorship Platform', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 5 DAY), DATE_SUB(NOW(3), INTERVAL 2 DAY)),
('prj_dm25', 'usr_dm005', 'OpenCollab — Open Source Collaboration', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 2 DAY), NOW(3));

-- ============================================================
-- ITERATIONS for demo projects
-- ============================================================
INSERT INTO iterations (id, project_id, parent_id, voice_input, text_input, status, created_at) VALUES
('itr_dm01', 'prj_dm01', NULL, 'Build a lightweight CRM for small businesses. Track contacts, deals pipeline, and follow-up reminders. Nothing as complex as Salesforce.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 28 DAY)),
('itr_dm02', 'prj_dm01', 'itr_dm01', NULL, 'Add email integration — automatically log emails from Gmail to the contact timeline.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 26 DAY)),
('itr_dm03', 'prj_dm02', NULL, NULL, 'Expense tracker for small teams. Employees submit receipts via photo, manager approves, syncs to QuickBooks.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 20 DAY)),
('itr_dm04', 'prj_dm03', NULL, 'AI meeting notes tool. Join meetings via bot, transcribe in real time, generate action items automatically at the end.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 12 DAY)),
('itr_dm05', 'prj_dm06', NULL, NULL, 'Fashion resale marketplace. Users can list pre-owned clothes with photos. AI suggests price based on brand and condition.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 22 DAY)),
('itr_dm06', 'prj_dm06', 'itr_dm05', 'Add seller ratings and dispute resolution system. Buyers can flag items not as described.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 20 DAY)),
('itr_dm07', 'prj_dm07', NULL, NULL, 'Subscription box platform. Curators build boxes, subscribers pick a plan, boxes ship monthly. Inventory management built in.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 15 DAY)),
('itr_dm08', 'prj_dm11', NULL, 'Portfolio builder for developers. Connect GitHub, auto-import repos, customize layout, publish to custom subdomain.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 18 DAY)),
('itr_dm09', 'prj_dm12', NULL, NULL, 'API testing tool like Postman but lighter. Save requests to collections, generate code snippets, share collections via link.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 13 DAY)),
('itr_dm10', 'prj_dm13', NULL, NULL, 'Auto documentation generator. Connect GitHub repo, AI reads source code and JSDoc comments, generates docs site.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 9 DAY)),
('itr_dm11', 'prj_dm16', NULL, 'Smart bookkeeping app. Connect bank accounts, AI categorizes transactions, generates P&L and balance sheet monthly.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 13 DAY)),
('itr_dm12', 'prj_dm17', NULL, NULL, 'Group expense splitter. Add group members, log expenses, see who owes whom. Settle up via Venmo or bank transfer.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 10 DAY)),
('itr_dm13', 'prj_dm18', NULL, NULL, 'Tax calculator for freelancers. Enter income and expenses by quarter, see estimated tax liability, export for accountant.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 7 DAY)),
('itr_dm14', 'prj_dm21', NULL, 'Developer microblogging. Short-form posts limited to 300 chars. Code-first — syntax highlighting in posts. Follow developers by stack.', NULL, 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 9 DAY)),
('itr_dm15', 'prj_dm24', NULL, NULL, 'Dev mentorship platform. Mentors list their expertise, price, and availability. Mentees book 1:1 sessions and get matched by skill gaps.', 'COMPLETE', DATE_SUB(NOW(3), INTERVAL 5 DAY));

-- ============================================================
-- ARTIFACTS for demo iterations (select complete ones)
-- ============================================================

-- CRMLite PRD
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_dm01', 'itr_dm01', 'PRD', '{
  "title": "CRMLite",
  "tagline": "The CRM small businesses actually finish setting up",
  "problem": "83% of SMBs that buy Salesforce or HubSpot abandon it within 90 days because it is too complex for 5-person teams.",
  "users": [
    { "persona": "Agency Owner", "pain": "Tracking 40 leads in a spreadsheet, losing deals because of missed follow-ups" },
    { "persona": "B2B Consultant", "pain": "No visibility into pipeline value or close probability" }
  ],
  "features": [
    { "name": "Contact timeline", "priority": "P0", "description": "Unified timeline per contact: calls, emails, notes, deals — all in one scroll", "acceptance": ["Timeline loads under 200ms", "Manual log in under 30s", "Email auto-log from Gmail integration"] },
    { "name": "Deal pipeline", "priority": "P0", "description": "Kanban pipeline with customizable stages and deal value", "acceptance": ["Drag and drop between stages", "Pipeline value visible at top", "Won/Lost tracking with reason"] },
    { "name": "Follow-up reminders", "priority": "P1", "description": "Set a follow-up date on any contact; get reminded via email at 8am that day", "acceptance": ["Reminder created in under 10s", "Email at 8am in user timezone", "Dismiss or snooze from email"] }
  ],
  "positioning": "If your team is under 20 people, CRMLite will get you live in one afternoon"
}', DATE_SUB(NOW(3), INTERVAL 28 DAY)),

('art_dm02', 'itr_dm01', 'SCHEMA', '{
  "schema": "model Contact {\\n  id        String @id @default(cuid())\\n  userId    String\\n  name      String\\n  email     String?\\n  phone     String?\\n  company   String?\\n  notes     String? @db.Text\\n  deals     Deal[]\\n  timeline  TimelineEvent[]\\n  reminders Reminder[]\\n  createdAt DateTime @default(now())\\n  @@index([userId])\\n}\\n\\nmodel Deal {\\n  id        String @id @default(cuid())\\n  contactId String\\n  contact   Contact @relation(fields: [contactId], references: [id])\\n  title     String\\n  value     Decimal @db.Decimal(10,2)\\n  stage     String @default(\\"LEAD\\")\\n  closeDate DateTime?\\n  wonAt     DateTime?\\n  lostAt    DateTime?\\n  lostReason String?\\n  createdAt DateTime @default(now())\\n}\\n\\nmodel TimelineEvent {\\n  id        String @id @default(cuid())\\n  contactId String\\n  contact   Contact @relation(fields: [contactId], references: [id])\\n  type      String\\n  body      String @db.Text\\n  createdAt DateTime @default(now())\\n  @@index([contactId, createdAt])\\n}"
}', DATE_SUB(NOW(3), INTERVAL 28 DAY)),

('art_dm03', 'itr_dm01', 'COMPONENT_TREE', '{
  "name": "CRMLiteApp",
  "props": {},
  "children": [
    { "name": "Sidebar", "props": { "activeView": "string" }, "children": [] },
    { "name": "ContactsPage", "props": {}, "children": [
      { "name": "ContactList", "props": { "contacts": "Contact[]" }, "children": [] },
      { "name": "ContactDetailPanel", "props": { "contactId": "string" }, "children": [
        { "name": "ContactTimeline", "props": { "events": "TimelineEvent[]" }, "children": [] },
        { "name": "AddNoteForm", "props": {}, "children": [] },
        { "name": "DealList", "props": { "deals": "Deal[]" }, "children": [] }
      ]}
    ]},
    { "name": "PipelinePage", "props": {}, "children": [
      { "name": "KanbanBoard", "props": { "stages": "string[]", "deals": "Deal[]" }, "children": [] },
      { "name": "PipelineValueHeader", "props": { "total": "number" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 28 DAY)),

('art_dm04', 'itr_dm01', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Contacts & Pipeline",
      "tasks": [
        { "title": "Contact CRUD", "description": "Create, view, edit contacts with all fields", "hours": 6, "priority": "P0" },
        { "title": "Timeline component", "description": "Chronological event feed with type icons", "hours": 5, "priority": "P0" },
        { "title": "Kanban pipeline board", "description": "Drag-and-drop deals between stages with react-beautiful-dnd", "hours": 8, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Integrations & Reminders",
      "tasks": [
        { "title": "Gmail OAuth integration", "description": "Read sent/received emails, auto-log to contact timeline", "hours": 10, "priority": "P1" },
        { "title": "Follow-up reminder system", "description": "Set date on contact, cron sends email at 8am user timezone", "hours": 5, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 28 DAY));

-- ThreadMarket PRD
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_dm05', 'itr_dm05', 'PRD', '{
  "title": "ThreadMarket",
  "tagline": "Sustainable fashion, AI-priced",
  "problem": "Selling pre-owned clothes online is slow: manually researching prices takes 15 min per item, and most sellers underprice just to move inventory.",
  "users": [
    { "persona": "Fashion-conscious reseller", "pain": "Spends hours pricing items and still undersells" },
    { "persona": "Sustainable buyer", "pain": "Wants curated pre-loved fashion but not the chaos of Facebook Marketplace" }
  ],
  "features": [
    { "name": "AI price suggestion", "priority": "P0", "description": "Upload photo + enter brand/size/condition. AI returns suggested price range based on recent sold comps.", "acceptance": ["Price returned in under 3s", "Shows confidence range (e.g. $45-$60)", "Links to 3 comparable sold items"] },
    { "name": "Instant listing", "priority": "P0", "description": "List an item in under 60 seconds from photo to published", "acceptance": ["Under 5 required fields", "Published immediately after submission", "Item visible in feed within 30s"] },
    { "name": "Drop collections", "priority": "P1", "description": "Curated sellers can schedule limited drops with countdown timers", "acceptance": ["Set drop date up to 30 days ahead", "Wishlist notifications fire 1 hour before", "Items go live at exact scheduled time"] }
  ],
  "positioning": "Depop for the price-smart seller — less guesswork, more profit"
}', DATE_SUB(NOW(3), INTERVAL 22 DAY)),

('art_dm06', 'itr_dm05', 'SCHEMA', '{
  "schema": "model Listing {\\n  id          String @id @default(cuid())\\n  sellerId    String\\n  title       String\\n  brand       String\\n  size        String\\n  condition   String\\n  price       Decimal @db.Decimal(10,2)\\n  aiSuggestedMin Decimal? @db.Decimal(10,2)\\n  aiSuggestedMax Decimal? @db.Decimal(10,2)\\n  photos      ListingPhoto[]\\n  status      String @default(\\"ACTIVE\\")\\n  soldAt      DateTime?\\n  createdAt   DateTime @default(now())\\n  @@index([sellerId])\\n  @@index([status, createdAt])\\n}\\n\\nmodel ListingPhoto {\\n  id        String @id @default(cuid())\\n  listingId String\\n  listing   Listing @relation(fields: [listingId], references: [id])\\n  url       String\\n  isPrimary Boolean @default(false)\\n  order     Int @default(0)\\n}\\n\\nmodel Order {\\n  id        String @id @default(cuid())\\n  listingId String\\n  buyerId   String\\n  total     Decimal @db.Decimal(10,2)\\n  status    String @default(\\"PENDING\\")\\n  createdAt DateTime @default(now())\\n}"
}', DATE_SUB(NOW(3), INTERVAL 22 DAY)),

('art_dm07', 'itr_dm05', 'COMPONENT_TREE', '{
  "name": "ThreadMarketApp",
  "props": {},
  "children": [
    { "name": "MarketplaceFeed", "props": { "listings": "Listing[]", "filters": "FilterState" }, "children": [
      { "name": "ListingCard", "props": { "listing": "Listing" }, "children": [] },
      { "name": "FilterSidebar", "props": { "onFilter": "fn" }, "children": [] }
    ]},
    { "name": "ListingCreator", "props": {}, "children": [
      { "name": "PhotoUploader", "props": { "maxPhotos": 8 }, "children": [] },
      { "name": "AIPriceSuggester", "props": { "onSelect": "fn" }, "children": [] },
      { "name": "ListingForm", "props": {}, "children": [] }
    ]},
    { "name": "DropScheduler", "props": { "sellerId": "string" }, "children": [] }
  ]
}', DATE_SUB(NOW(3), INTERVAL 22 DAY)),

('art_dm08', 'itr_dm05', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Listing & Feed",
      "tasks": [
        { "title": "Photo upload with CDN", "description": "Multi-photo upload to S3/Cloudflare Images, optimize on ingest", "hours": 6, "priority": "P0" },
        { "title": "Listing creation form", "description": "Brand, size, condition, price fields with validation", "hours": 5, "priority": "P0" },
        { "title": "Marketplace feed with filters", "description": "Paginated grid, filter by brand/size/condition/price", "hours": 8, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — AI Pricing",
      "tasks": [
        { "title": "AI price suggestion endpoint", "description": "Pass photo + metadata to Gemini Vision, return price range", "hours": 8, "priority": "P0" },
        { "title": "Comp item display", "description": "Show 3 similar sold items as reference alongside price suggestion", "hours": 5, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 22 DAY));

-- PortfolioOS PRD
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_dm09', 'itr_dm08', 'PRD', '{
  "title": "PortfolioOS",
  "tagline": "Your GitHub. Organized. Published.",
  "problem": "Developers spend 8+ hours building a portfolio from scratch, and most end up with an outdated site they never maintain.",
  "users": [
    { "persona": "Job-seeking developer", "pain": "Portfolio is 2 years out of date and does not reflect recent work" },
    { "persona": "Freelance developer", "pain": "Clients ask for portfolio link but GitHub is too noisy to share" }
  ],
  "features": [
    { "name": "GitHub auto-import", "priority": "P0", "description": "Connect GitHub, auto-pull repos with README, tech stack, stars, last updated", "acceptance": ["OAuth connect in 2 clicks", "Repos imported in under 10s", "Updates sync every 24 hours"] },
    { "name": "Drag-and-drop portfolio builder", "priority": "P0", "description": "Select which repos to showcase, reorder, add custom descriptions", "acceptance": ["Reorder via drag-and-drop", "Custom description overrides README", "Preview mode before publish"] },
    { "name": "Custom subdomain publish", "priority": "P0", "description": "Publish to username.portfolioos.dev instantly", "acceptance": ["Subdomain active within 60s of publish", "Custom domain supported via DNS CNAME"] }
  ],
  "positioning": "A living portfolio that stays updated automatically — set it once, never touch it again"
}', DATE_SUB(NOW(3), INTERVAL 18 DAY)),

('art_dm10', 'itr_dm08', 'SCHEMA', '{
  "schema": "model Portfolio {\\n  id          String @id @default(cuid())\\n  userId      String @unique\\n  subdomain   String @unique\\n  customDomain String?\\n  theme       String @default(\\"minimal\\")\\n  published   Boolean @default(false)\\n  projects    PortfolioProject[]\\n  updatedAt   DateTime @updatedAt\\n}\\n\\nmodel PortfolioProject {\\n  id          String @id @default(cuid())\\n  portfolioId String\\n  portfolio   Portfolio @relation(fields: [portfolioId], references: [id])\\n  githubRepoId String\\n  repoName    String\\n  description String? @db.Text\\n  techStack   Json\\n  stars       Int @default(0)\\n  order       Int @default(0)\\n  featured    Boolean @default(false)\\n  @@index([portfolioId, order])\\n}"
}', DATE_SUB(NOW(3), INTERVAL 18 DAY)),

('art_dm11', 'itr_dm08', 'COMPONENT_TREE', '{
  "name": "PortfolioOSApp",
  "props": {},
  "children": [
    { "name": "EditorPage", "props": { "portfolioId": "string" }, "children": [
      { "name": "GitHubRepoSelector", "props": { "repos": "GithubRepo[]" }, "children": [] },
      { "name": "ProjectOrderer", "props": { "projects": "PortfolioProject[]" }, "children": [] },
      { "name": "ThemeSelector", "props": { "themes": "string[]" }, "children": [] },
      { "name": "PublishButton", "props": { "subdomain": "string" }, "children": [] }
    ]},
    { "name": "PublicPortfolio", "props": { "subdomain": "string" }, "children": [
      { "name": "HeroSection", "props": { "user": "User" }, "children": [] },
      { "name": "ProjectGrid", "props": { "projects": "PortfolioProject[]" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 18 DAY)),

('art_dm12', 'itr_dm08', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — GitHub Integration",
      "tasks": [
        { "title": "GitHub OAuth flow", "description": "OAuth app, store access token securely", "hours": 4, "priority": "P0" },
        { "title": "Repo import endpoint", "description": "Fetch repos via GitHub API, extract README, topics, language stats", "hours": 6, "priority": "P0" },
        { "title": "24h sync cron", "description": "Background job to refresh repo data daily", "hours": 3, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Builder & Publishing",
      "tasks": [
        { "title": "Drag-and-drop project reorderer", "description": "DnD kit with order persisted to DB on drop", "hours": 5, "priority": "P0" },
        { "title": "Subdomain routing", "description": "Wildcard DNS + Next.js middleware for subdomain routing", "hours": 6, "priority": "P0" },
        { "title": "Theme system", "description": "3 themes: minimal, dark, colorful — applied via CSS variables", "hours": 5, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 18 DAY));

-- LedgerAI PRD
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_dm13', 'itr_dm11', 'PRD', '{
  "title": "LedgerAI",
  "tagline": "Your accountant, minus the hourly rate",
  "problem": "Small business owners spend 5+ hours per month reconciling transactions and another 3 hours preparing financial statements for their accountant.",
  "users": [
    { "persona": "Solo Founder", "pain": "Monthly bookkeeping takes a full day and they still are not sure if they did it right" },
    { "persona": "Small Agency Owner", "pain": "Pays $400/mo for bookkeeper who just does data entry" }
  ],
  "features": [
    { "name": "Bank sync + AI categorization", "priority": "P0", "description": "Connect bank via Plaid. AI categorizes every transaction with 95% accuracy. Review uncategorized in one batch session.", "acceptance": ["Plaid Link connects in under 2 min", "AI categorization within 30s of sync", "Batch review UI shows 20 uncategorized at once"] },
    { "name": "Auto P&L statement", "priority": "P0", "description": "Generated monthly P&L from categorized transactions. Download as PDF or share link with accountant.", "acceptance": ["P&L accurate to last synced transaction", "PDF matches standard accounting format", "Shareable link works without login"] },
    { "name": "Tax category mapping", "priority": "P1", "description": "Map expense categories to Schedule C tax lines. See estimated deductible expenses.", "acceptance": ["All standard Schedule C lines covered", "Runs in 1 click", "Export as CSV for tax software"] }
  ],
  "positioning": "QuickBooks is built for bookkeepers. LedgerAI is built for founders."
}', DATE_SUB(NOW(3), INTERVAL 13 DAY)),

('art_dm14', 'itr_dm11', 'SCHEMA', '{
  "schema": "model BankAccount {\\n  id           String @id @default(cuid())\\n  userId       String\\n  plaidItemId  String\\n  plaidAccountId String @unique\\n  name         String\\n  type         String\\n  balance      Decimal @db.Decimal(10,2)\\n  transactions Transaction[]\\n  syncedAt     DateTime?\\n  createdAt    DateTime @default(now())\\n}\\n\\nmodel Transaction {\\n  id            String @id @default(cuid())\\n  accountId     String\\n  account       BankAccount @relation(fields: [accountId], references: [id])\\n  plaidTxId     String @unique\\n  date          DateTime\\n  description   String\\n  amount        Decimal @db.Decimal(10,2)\\n  category      String?\\n  aiCategory    String?\\n  aiConfidence  Float?\\n  reviewed      Boolean @default(false)\\n  @@index([accountId, date])\\n}"
}', DATE_SUB(NOW(3), INTERVAL 13 DAY)),

('art_dm15', 'itr_dm11', 'COMPONENT_TREE', '{
  "name": "LedgerAIApp",
  "props": {},
  "children": [
    { "name": "DashboardPage", "props": {}, "children": [
      { "name": "AccountSummaryCards", "props": { "accounts": "BankAccount[]" }, "children": [] },
      { "name": "RecentTransactionsFeed", "props": { "transactions": "Transaction[]" }, "children": [] },
      { "name": "MonthlyPLChart", "props": { "month": "Date" }, "children": [] }
    ]},
    { "name": "TransactionsPage", "props": {}, "children": [
      { "name": "TransactionTable", "props": { "transactions": "Transaction[]" }, "children": [] },
      { "name": "BatchReviewPanel", "props": { "uncategorized": "Transaction[]" }, "children": [] },
      { "name": "CategorySelector", "props": { "categories": "string[]" }, "children": [] }
    ]},
    { "name": "ReportsPage", "props": {}, "children": [
      { "name": "PLStatement", "props": { "month": "Date" }, "children": [] },
      { "name": "ExportButton", "props": { "format": "pdf | csv" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 13 DAY)),

('art_dm16', 'itr_dm11', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Plaid & Transactions",
      "tasks": [
        { "title": "Plaid Link integration", "description": "Plaid Link SDK, store access token, fetch accounts", "hours": 8, "priority": "P0" },
        { "title": "Transaction sync job", "description": "Fetch transactions via Plaid, store in DB, run daily cron", "hours": 6, "priority": "P0" },
        { "title": "AI categorizer", "description": "Send transaction description to Gemini, return category + confidence", "hours": 8, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Reports",
      "tasks": [
        { "title": "P&L calculation engine", "description": "Group categorized transactions into revenue/COGS/expenses", "hours": 6, "priority": "P0" },
        { "title": "PDF report generator", "description": "Puppeteer-rendered P&L PDF with logo and accounting format", "hours": 5, "priority": "P0" },
        { "title": "Batch review UI", "description": "Show uncategorized 20 at a time with category dropdown, bulk approve", "hours": 5, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 13 DAY));

-- MentorMatch PRD
INSERT INTO artifacts (id, iteration_id, type, content, created_at) VALUES
('art_dm17', 'itr_dm15', 'PRD', '{
  "title": "MentorMatch",
  "tagline": "Expert guidance. No cold DMs required.",
  "problem": "Junior developers want mentorship but cannot get responses from senior engineers on LinkedIn. Senior engineers want to give back but have no structured way to do it.",
  "users": [
    { "persona": "Junior Developer (1-3 yrs exp)", "pain": "Stuck on career decisions with no one to ask who has been there" },
    { "persona": "Senior Engineer / Architect", "pain": "Wants to mentor but gets overwhelmed by unstructured LinkedIn requests" }
  ],
  "features": [
    { "name": "Mentor profile & availability", "priority": "P0", "description": "Mentor lists expertise areas, hourly rate (or free), and available time slots via calendar integration", "acceptance": ["Google Calendar sync for availability", "Expertise tags from predefined list", "Free or paid sessions supported"] },
    { "name": "AI skill gap match", "priority": "P0", "description": "Mentee enters career goals. AI matches them to top 5 mentor profiles based on skill gap analysis.", "acceptance": ["Matching runs in under 5s", "Shows match score explanation", "Can re-run with updated goals"] },
    { "name": "Session booking & video", "priority": "P1", "description": "Book a 30 or 60 min session. Join via embedded video call. Session notes auto-generated by AI after call.", "acceptance": ["Booking sends calendar invite to both", "Video call via Daily.co embed", "AI notes delivered within 5 min of call end"] }
  ],
  "positioning": "ADPList meets Calendly — structured mentorship without the cold DM shame"
}', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

('art_dm18', 'itr_dm15', 'SCHEMA', '{
  "schema": "model MentorProfile {\\n  id          String @id @default(cuid())\\n  userId      String @unique\\n  bio         String @db.Text\\n  expertise   Json\\n  hourlyRate  Decimal? @db.Decimal(10,2)\\n  isFree      Boolean @default(false)\\n  sessions    Session[]\\n  rating      Float?\\n  reviewCount Int @default(0)\\n  createdAt   DateTime @default(now())\\n}\\n\\nmodel Session {\\n  id          String @id @default(cuid())\\n  mentorId    String\\n  mentor      MentorProfile @relation(fields: [mentorId], references: [id])\\n  menteeId    String\\n  duration    Int\\n  scheduledAt DateTime\\n  status      String @default(\\"BOOKED\\")\\n  videoRoomUrl String?\\n  aiNotes     String? @db.Text\\n  completedAt DateTime?\\n  review      Review?\\n  createdAt   DateTime @default(now())\\n}\\n\\nmodel Review {\\n  id        String @id @default(cuid())\\n  sessionId String @unique\\n  session   Session @relation(fields: [sessionId], references: [id])\\n  rating    Int\\n  comment   String? @db.Text\\n  createdAt DateTime @default(now())\\n}"
}', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

('art_dm19', 'itr_dm15', 'COMPONENT_TREE', '{
  "name": "MentorMatchApp",
  "props": {},
  "children": [
    { "name": "DiscoverPage", "props": {}, "children": [
      { "name": "GoalInput", "props": { "onSubmit": "fn" }, "children": [] },
      { "name": "MentorMatchResults", "props": { "mentors": "MentorProfile[]", "matchScores": "Record<string,number>" }, "children": [
        { "name": "MentorCard", "props": { "mentor": "MentorProfile", "score": "number" }, "children": [] }
      ]}
    ]},
    { "name": "MentorProfilePage", "props": { "mentorId": "string" }, "children": [
      { "name": "AvailabilityCalendar", "props": { "slots": "TimeSlot[]" }, "children": [] },
      { "name": "BookSessionButton", "props": { "duration": "30 | 60" }, "children": [] },
      { "name": "ReviewsList", "props": { "reviews": "Review[]" }, "children": [] }
    ]},
    { "name": "SessionRoom", "props": { "sessionId": "string" }, "children": [
      { "name": "VideoEmbed", "props": { "roomUrl": "string" }, "children": [] },
      { "name": "SessionNotes", "props": { "aiNotes": "string" }, "children": [] }
    ]}
  ]
}', DATE_SUB(NOW(3), INTERVAL 5 DAY)),

('art_dm20', 'itr_dm15', 'TASK_BOARD', '{
  "sprints": [
    {
      "name": "Sprint 1 — Profiles & Matching",
      "tasks": [
        { "title": "Mentor profile builder", "description": "Bio, expertise tags, rate/free toggle, Google Calendar connect", "hours": 8, "priority": "P0" },
        { "title": "AI skill gap matcher", "description": "Send mentee goals + mentor profiles to Gemini, return ranked matches with scores", "hours": 10, "priority": "P0" },
        { "title": "Mentor discovery page", "description": "Display top 5 matches with score explanation badges", "hours": 5, "priority": "P0" }
      ]
    },
    {
      "name": "Sprint 2 — Booking & Sessions",
      "tasks": [
        { "title": "Calendar availability sync", "description": "Google Calendar API read to show real free slots", "hours": 8, "priority": "P0" },
        { "title": "Session booking + invite", "description": "Book slot, create calendar events for both, send confirmation emails", "hours": 6, "priority": "P0" },
        { "title": "Daily.co video embed", "description": "Create Daily room on booking, embed in session page", "hours": 4, "priority": "P1" },
        { "title": "AI session notes", "description": "Post-call webhook triggers Gemini transcription summary", "hours": 6, "priority": "P1" }
      ]
    }
  ]
}', DATE_SUB(NOW(3), INTERVAL 5 DAY));

-- ============================================================
-- REFRESH TOKENS for demo users
-- ============================================================
INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at) VALUES
('rtk_dm01', 'usr_dm001', SHA2(CONCAT('demo_token_sarah_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3)),
('rtk_dm02', 'usr_dm002', SHA2(CONCAT('demo_token_marcus_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3)),
('rtk_dm03', 'usr_dm003', SHA2(CONCAT('demo_token_priya_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3)),
('rtk_dm04', 'usr_dm004', SHA2(CONCAT('demo_token_luca_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3)),
('rtk_dm05', 'usr_dm005', SHA2(CONCAT('demo_token_anya_', NOW()), 256), DATE_ADD(NOW(3), INTERVAL 7 DAY), 0, NOW(3));

SELECT 'Demo seed data inserted successfully.' AS status;
SELECT CONCAT('Total projects: ', COUNT(*)) AS demo_project_count FROM projects WHERE user_id LIKE 'usr_dm%';
