# Runbook

## Prerequisites

- Node.js 20+
- pnpm 10+
- Supabase project (local or cloud)

## Setup

1. `pnpm install`
2. Copy env values from `.env.example`.
3. Apply SQL in `infra/supabase/migrations`.

## Local Development

- `pnpm dev` runs all dev tasks.
- `pnpm --filter @smartrealtor/web dev`
- `pnpm --filter @smartrealtor/widget dev`

## Quality Commands

- `pnpm format`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Supabase Notes

- Ensure auth users map to `profiles` with `tenant_id`.
- Validate RLS using two test users from different tenants.

## Troubleshooting

- If route handlers fail, verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- If widget cannot connect, verify `NEXT_PUBLIC_WIDGET_API_BASE_URL`.
- If tests fail due to env, use local mock clients in package tests.
