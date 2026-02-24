# Smart Realtor Agent — Project Status & Roadmap

> **Branch:** `claude/review-chatbot-redesign-I1qZf`
> **Last updated:** 2026-02-20

---

## What Is Built (Done ✅)

### Marketing & Auth
| Item | Status | Notes |
|---|---|---|
| Landing page | ✅ Complete | Hero, features, stats, how-it-works, testimonials, pricing (3 tiers), FAQ, footer |
| Magic-link auth (`/login`) | ✅ Complete | Supabase OTP, loading states, redirect on success |
| Dashboard auth guard | ✅ Complete | Client-side session check, auth wall with sign-in link |

### Dashboard Shell
| Item | Status | Notes |
|---|---|---|
| Sidebar nav | ✅ Complete | 4 nav items, active state, "Back to site" link |
| Top bar | ✅ Complete | Breadcrumb + trial badge |
| Leads page UI | ✅ Complete | Table, intent badges, status badges, stat pills |
| Knowledge Base page UI | ✅ Complete | Drop zone, sources table, Re-index button |
| Widget Install page | ✅ Complete | Interactive theme picker, snippet preview, attributes reference |
| Settings page | ✅ Complete | Visual theme selector with live mini-previews, branding form, policy toggles |

### Widget (`apps/widget`)
| Item | Status | Notes |
|---|---|---|
| 4 selectable themes | ✅ Complete | dark, minimal, professional, glass |
| Streaming text rendering | ✅ Complete | Reads from `ReadableStream` chunk-by-chunk |
| Typing indicator | ✅ Complete | Animated 3-dot bounce |
| Citation rendering | ✅ Complete | Parses `X-Citations` header, renders source links |
| Enter to send | ✅ Complete | Shift+Enter for newline |
| Close button | ✅ Complete | In header; launcher toggles label |
| Timestamps | ✅ Complete | Per-message HH:MM stamps |
| `data-theme`, `data-bot-name`, `data-welcome-message` attrs | ✅ Complete | Fully configurable via script tag |

### Backend / API
| Item | Status | Notes |
|---|---|---|
| `POST /api/chat` | ✅ Complete | Validates input, runs Orchestrator, streams response |
| `POST /api/skills/leads/upsert` | ✅ Complete | Route exists |
| `POST /api/skills/conversations/append` | ✅ Complete | Route exists |

### Packages
| Package | Status | Notes |
|---|---|---|
| `agent-core` — Orchestrator | ✅ Complete | Routes intent → KB search → policy → lead capture → response |
| `agent-core` — PolicyEngine | ✅ Complete | Decides fallback, lead capture, citation enforcement |
| `agent-core` — IntentRouter | ✅ Complete | Classifies message intent (FAQ, LISTING_QUESTION, etc.) |
| `agent-core` — ConversationState | ✅ Complete | State machine: NEW → ENGAGED → QUALIFYING → CAPTURED |
| `agent-core` — ToolRegistry | ✅ Complete | Register + execute tools with permission gate |
| `rag` — Chunker | ✅ Complete | Document → sentence-level chunks |
| `rag` — Citation builder | ✅ Complete | Source attribution from retrieved passages |
| `skills` — kb-search, leads-upsert, conversations-append | ✅ Complete | Skill definitions + executor |
| Tests for all packages | ✅ Complete | Unit tests with Vitest |

---

## What Is Stubbed / Incomplete (⚠️ Gaps)

These are implemented in code but not real — they are placeholder/stub implementations that must be replaced before production.

### Critical: AI & RAG Pipeline

| Gap | Current State | What's Needed |
|---|---|---|
| **LLM response generation** | Orchestrator returns the first KB passage text verbatim — no Claude/GPT call | Integrate `claude-sonnet-4-6` (Anthropic SDK) or OpenAI. Build a proper prompt with system instructions + context |
| **Embeddings** | `StubEmbeddingProvider` converts chars to ASCII fractions — completely fake | Plug in real embeddings: OpenAI `text-embedding-3-small`, Voyage AI, or Anthropic |
| **Vector retrieval** | `StubRetriever` just returns pre-loaded passages in memory | Connect to Supabase `pgvector` — real cosine similarity search on `knowledge_chunks` |
| **KB search quality** | `kbSearchSkill` uses SQL `ILIKE` on snippet — no semantic search | Replace with vector similarity query once embeddings are real |

### Critical: Database

| Gap | Current State | What's Needed |
|---|---|---|
| **Schema exists but not wired to UI** | `infra/supabase/migrations/0001_init.sql` defines all 8 tables with RLS (tenants, profiles, knowledge_sources, knowledge_chunks, conversations, messages, leads, skill_audit_logs) | Apply migrations to a real Supabase project; connect dashboard pages to it |
| **Leads page uses mock data** | 3 hardcoded leads in `leads/page.tsx` | Add Supabase client read from `leads` table for current tenant |
| **Knowledge Base uses mock data** | 3 hardcoded sources in `knowledge-base/page.tsx` | Load from `knowledge_sources` table; wire the upload + re-index actions |
| **Settings "Save" does nothing** | Form values are local React state only | Add `PUT /api/settings` endpoint + DB upsert to `tenants` / `profiles` |
| **`skill_audit_logs` never used in UI** | Populated by API but never displayed | Add an Audit Log page or section in Settings |

### Important: Document Ingestion Pipeline

| Gap | Current State | What's Needed |
|---|---|---|
| **File upload** | "Browse Files" button renders but has no handler | Add `POST /api/knowledge/upload` — accept PDF/DOCX, store raw in Supabase Storage |
| **URL scraping** | Not implemented | Web scraper / Firecrawl integration → text extraction |
| **Chunk + embed + store** | No indexing pipeline | On upload: chunk → embed → store vectors in `knowledge_chunks` |
| **Re-index button** | Renders but does nothing | Call re-index API for a given source_id |

### Important: Auth & Multi-tenancy

| Gap | Current State | What's Needed |
|---|---|---|
| **No sign-out button** | Sidebar has no logout link | Add logout to sidebar bottom using `supabase.auth.signOut()` |
| **Auth is client-side only** | Server routes have no auth middleware | Add Next.js middleware to protect `/api/*` and dashboard routes |
| **Hardcoded "Demo Realty"** | Tenant name is a literal string in layout | Load from `tenants` table using session's user ID |
| **No tenant onboarding** | After login, user goes directly to leads with mock data | Create `/onboarding` flow: name agency → paste website → auto-index |

---

## Future Features (Roadmap 🚀)

### Phase 1 — Make it Real (MVP Launch)
These are the blockers before any real customer can use it.

1. **Real LLM integration** — `claude-sonnet-4-6` with a real system prompt tailored for real estate
2. **Supabase schema + migrations** — create all tables, RLS policies per tenant
3. **Real embeddings + vector search** — `pgvector` with cosine similarity
4. **Document ingestion API** — upload PDF/URL → chunk → embed → store
5. **Leads from DB** — replace mock data with real Supabase query
6. **Auth middleware** — protect all API routes and dashboard pages
7. **Tenant onboarding flow** — agency setup after first login
8. **Sign out** — in sidebar

### Phase 2 — Growth Features

| Feature | Value |
|---|---|
| **Analytics dashboard** | Conversation volume, lead funnel (engaged → qualifying → captured), top questions |
| **Conversations view** | Browse past conversations per lead, read full transcripts |
| **Lead detail page** | Click a lead row → see full profile + conversation history |
| **Email notifications** | New lead captured → email to agent with lead summary |
| **Webhook system** | `POST` to any URL when lead status changes (CRM integration hook) |
| **CRM integrations** | Push leads to HubSpot, Salesforce, Follow Up Boss via native connectors |
| **Multi-user teams** | Invite team members to the same tenant with role-based access |
| **Subscription billing** | Stripe integration for the 3 pricing tiers shown on landing page |

### Phase 3 — AI Intelligence

| Feature | Value |
|---|---|
| **Conversation memory** | Load past messages per `conversationId` into LLM context window |
| **Lead qualification scoring** | AI-scored lead quality based on budget, timeline, intent signals |
| **Property recommendation** | If MLS/IDX feed is connected, suggest matching listings in chat |
| **Proactive follow-up** | After 24h of inactivity, auto-send a follow-up message |
| **Handoff to human agent** | Detect "I want to talk to a person" → open live chat or schedule call |
| **Voice input** | Web Speech API for voice-to-text in the widget |
| **Rich media cards** | Render listing image carousels, floor plans, map previews in chat |

### Phase 4 — Platform & Integrations

| Feature | Value |
|---|---|
| **MLS / IDX feed** | Live listing data ingested as KB source — always current |
| **Zapier / Make connector** | No-code automation for non-technical agencies |
| **White-label** | Custom domain for the widget CDN + branded dashboard |
| **Mobile SDK** | iOS/Android wrapper for the widget |
| **Analytics export** | CSV/API export of leads and conversation data |
| **A/B testing** | Test 2 different welcome messages or themes and measure conversion |
| **Multilingual** | Detect browser locale, respond in Spanish / French / etc. |

---

## Technical Debt to Address

| Item | Priority |
|---|---|
| Replace `ILIKE` KB search with `pgvector` similarity | High |
| Add `zod` input validation to all API routes | Medium |
| Rate limiting on `POST /api/chat` (per tenant) | High |
| Widget: scoped CSS to avoid host-page conflicts (shadow DOM or unique prefix) | Medium |
| E2E tests (Playwright) for critical flows: login → chat → lead captured | Medium |
| CI/CD pipeline (GitHub Actions: lint → test → build → deploy) | Medium |
| Environment variable documentation (`.env.example`) | Low |
| Widget CDN delivery (currently no real CDN URL) | High |

---

## Summary

```
Foundation:  ████████████████████░░  ~80% (UI polished, core logic wired)
AI / RAG:    ████░░░░░░░░░░░░░░░░░░  ~20% (all stubs, no real LLM)
Data layer:  ████████░░░░░░░░░░░░░░  ~40% (schema+RLS defined, UI still uses mock data)
Auth/Tenant: ████░░░░░░░░░░░░░░░░░░  ~20% (login works, no middleware, no onboarding)
Overall:     █████████░░░░░░░░░░░░░  ~40% toward production-ready
```

The **UI, design system, and architecture are production-quality**. The Supabase schema is fully defined with 8 tables and RLS policies. The biggest remaining gaps are: (1) real LLM + embeddings + vector search in the AI pipeline, and (2) wiring the dashboard UI to the real DB instead of mock data.
