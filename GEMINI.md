# Smart Realtor Agent

Smart Realtor Agent is a multi-tenant SaaS platform that provides real estate agents with an embeddable AI chatbot. The system is designed to provide accurate, citation-backed responses based on a tenant-specific knowledge base and to qualify leads automatically.

## Project Overview

- **Architecture:** Monorepo managed with `turbo` and `pnpm`.
- **Main Technologies:** TypeScript, Next.js (apps/web), Supabase (Auth, DB, RLS), Vitest, OpenAI/Anthropic SDKs.
- **Key Components:**
  - `apps/web`: Next.js application for the marketing site, dashboard, and API route handlers.
  - `apps/widget`: The embeddable chatbot widget.
  - `packages/agent-core`: Orchestration logic, intent routing, and policy enforcement.
  - `packages/rag`: Retrieval-Augmented Generation interfaces and utilities (chunking, citations).
  - `packages/skills`: Implementation of specific agent capabilities (KB search, lead management).
  - `infra/supabase`: Database migrations and Row Level Security (RLS) policies.

## Building and Running

### Prerequisites
- Node.js (version specified in `package.json`)
- `pnpm` (configured as the package manager)

### Key Commands
- **Install Dependencies:** `pnpm install`
- **Build Project:** `pnpm build` (Runs `turbo run build`)
- **Development Mode:** `pnpm dev` (Runs `turbo run dev --parallel`)
- **Run Tests:** `pnpm test` (Runs `turbo run test`)
- **Linting:** `pnpm lint`
- **Type Checking:** `pnpm typecheck`
- **Format Code:** `pnpm format` (Uses Prettier)

## Development Conventions

### Multi-Tenancy & Security
- Every table in the database includes a `tenant_id`.
- Data isolation is strictly enforced at the database level using **Supabase Row Level Security (RLS)**.
- Always ensure `tenant_id` is passed through context when performing operations in `agent-core` or `skills`.

### Agent Orchestration
- The `Orchestrator` in `packages/agent-core` follows a deterministic flow:
  1. **Route Intent:** Classify the user's message.
  2. **Execute Knowledge Search:** Fetch relevant context from the KB.
  3. **Evaluate Policy:** Check if the response requires citations or lead capture.
  4. **Execute Skills:** Perform side effects (e.g., upserting leads, appending messages).
  5. **Construct Response:** Combine tool outputs into a final assistant message.

### Coding Standards
- **Type Safety:** Use TypeScript for all new code. Use `zod` for runtime validation where appropriate.
- **Testing:** Add Vitest test cases for new core logic or skills in the respective `tests/` directories.
- **Surgical Updates:** When modifying existing logic, maintain the patterns established in `agent-core` and `skills` (e.g., using `ToolExecutionContext`).
- **Citations:** Factual responses must be backed by citations generated through the `kb.search` skill.

## Directory Structure

- `apps/web`: Next.js app (App Router).
- `apps/widget`: Widget source code.
- `packages/agent-core`: The "brain" of the agent.
- `packages/rag`: RAG pipeline components.
- `packages/skills`: Atomic actions the agent can perform.
- `infra/supabase/migrations`: SQL schema definitions and RLS policies.
- `docs/`: Technical documentation (PRD, Architecture, etc.).
