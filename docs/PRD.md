# Product Requirements Document (PRD)

## Product

SmartRealtorAgent is a multi-tenant SaaS that gives real estate agents an embeddable AI chatbot backed by their own knowledge base.

## Objectives

- Provide accurate, citation-backed responses from tenant-specific KB content.
- Qualify buyer/seller leads and persist lead data to tenant CRM tables.
- Offer an embeddable widget plus dashboard management UI.

## Target Users

- Independent agents and broker teams.
- End website visitors asking listing, buying, or selling questions.

## In Scope (v1)

- Tenant-scoped auth and dashboard.
- KB ingestion-ready data model + retrieval stubs.
- Deterministic orchestration with policy enforcement.
- Skill system for KB search, lead upsert, and conversation logging.
- Marketing website + dashboard pages + widget integration.

## Out of Scope (v1)

- MLS live integrations.
- CRM/SMS native integrations.
- Autonomous agent planning.

## Success Criteria

- Responses contain citations when factual claims are made.
- No cross-tenant data leakage.
- Lead capture flow completes for buyer/seller intents.
- Widget can be embedded with script tag and bot id.

## Non-Functional Requirements

- Type-safe interfaces with zod validation.
- Deterministic orchestration and auditable tool calls.
- Multi-tenant security with Supabase RLS.
