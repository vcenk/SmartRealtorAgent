# Repository Guidelines

## Project Structure & Module Organization
This repository is a `pnpm` + Turborepo monorepo.
- `apps/web`: Next.js app (marketing pages, dashboard routes, API handlers under `app/api`).
- `apps/widget`: embeddable widget bundle built from `src/index.ts` to `dist/index.global.js`.
- `packages/agent-core`: orchestration, policy, routing, state, and tool registry logic.
- `packages/skills`: skill implementations (e.g., `kb-search`, `leads-upsert`).
- `packages/rag`: chunking, citation, embedding/retriever interfaces.
- `infra/supabase/migrations`: SQL schema and RLS migration files.
- `docs/`: architecture, product, and runbook references.

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies (Node 20+, pnpm 10+).
- `pnpm dev`: run all workspace dev tasks in parallel via Turbo.
- `pnpm build`: build all apps/packages.
- `pnpm lint`: run ESLint across workspaces.
- `pnpm typecheck`: run TypeScript checks without emit.
- `pnpm test`: run Vitest suites across workspaces.
- `pnpm --filter @smartrealtor/web dev`: run only the Next.js app.
- `pnpm --filter @smartrealtor/widget dev`: run widget watch build.

## Coding Style & Naming Conventions
- Formatting: `.editorconfig` + Prettier (2 spaces, LF, single quotes, semicolons, trailing commas, print width 100).
- Linting: ESLint with `@typescript-eslint` and `eslint-config-prettier`.
- Prefer TypeScript module files in `kebab-case` (e.g., `intent-router.ts`).
- Keep tests near package roots in `tests/` or beside app routes as `*.test.ts`.

## Testing Guidelines
- Test framework: Vitest (`vitest run` via package scripts and Turbo).
- Naming: `*.test.ts` (examples: `policy-engine.test.ts`, `contracts.test.ts`).
- Add unit tests for new logic in `packages/*/tests` and route-level tests for `apps/web` behavior.
- No fixed coverage threshold is enforced yet; maintain or improve existing test depth for touched modules.

## Commit & Pull Request Guidelines
- Commit style follows Conventional Commits (observed: `feat: ...`). Use `feat:`, `fix:`, `chore:`, etc.
- Keep commits scoped to one logical change.
- PRs should include: concise summary, impacted paths, test evidence (`pnpm test`, `pnpm lint`), and screenshots for UI changes.
- Link related issues/tasks and call out env or migration changes explicitly.

## Security & Configuration Tips
- Copy `.env.example` and never commit secrets.
- Required keys include Supabase URL/keys and app URLs; validate tenant isolation/RLS when changing data access code.
