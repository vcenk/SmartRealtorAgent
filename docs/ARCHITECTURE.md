# Architecture

## Monorepo Layout

- apps/web: Next.js marketing, dashboard, and API route handlers.
- apps/widget: embeddable widget bundle.
- packages/agent-core: orchestration, policy, intent, state machine, tool registry.
- packages/skills: skill implementations and contracts.
- packages/rag: chunker, embedding/retriever interfaces, citation model.
- infra/supabase: SQL migrations, RLS policies, seed data.
- scripts: local automation helpers.

## Runtime Boundaries

- `apps/web` hosts HTTP API for v1 simplicity.
- Core orchestration and skill logic are package-isolated so `apps/api` extraction is possible later.
- Widget uses HTTP streaming endpoint from `apps/web`.

## Multi-Tenant Model

- Every row includes `tenant_id`.
- User membership in `profiles` maps authenticated users to tenants.
- RLS policies ensure users only access rows for their tenant membership.
- Service role paths remain explicit and minimized.

## RAG Pipeline (v1)

1. Source docs stored in `knowledge_sources`.
2. Chunker creates `knowledge_chunks` with metadata.
3. Embedding provider interface returns vectors (stub implementation in v1).
4. Retriever returns scored passages (stub in v1).
5. `kb.search` returns normalized citations.
6. Orchestrator composes response with citations and policy checks.

## Orchestration

- Input: `{ tenantId, conversationId, userMessage }`.
- Steps:
  1. Route intent.
  2. Evaluate policy constraints.
  3. Execute selected skills via registry.
  4. Build response with citation rules.
  5. Update conversation/lead state.
- Output: `{ assistantMessage, toolCalls, citations, leadUpdates }`.

## API Endpoints (v1)

- `POST /api/chat`
- `POST /api/skills/leads/upsert`
- `POST /api/skills/conversations/append`

## Future Compatibility

- Add `apps/api` without changing package contracts.
- Introduce real embedding/retrieval providers via interfaces in `packages/rag`.
