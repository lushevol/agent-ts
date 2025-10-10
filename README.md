# Agent TS

A Bun-powered Turborepo monorepo that delivers a full-stack agent experience with a NestJS + Mastra backend and a Vite + React frontend featuring TanStack Router, Tailwind CSS, shadcn/ui patterns, and CopilotKit components.

## Quick Start

```bash
bun install
bun run dev
```

For detailed documentation, see [docs/project-overview.md](docs/project-overview.md).

## tRPC + Drizzle stack

- Database models live in `packages/db` using Drizzle ORM with PostgreSQL-compatible migrations driven by `drizzle-kit` scripts.
- Shared validation schemas are generated in `packages/shared` using `drizzle-zod` and re-used by the tRPC router and frontend.
- The NestJS app mounts the tRPC middleware at `/api/trpc`, sourcing a pooled Drizzle client configured via `DATABASE_URL`.
- React Query + tRPC client helpers are exposed from `packages/web` and consumed by the Vite application, which now ships with a demo user list powered by the stack.
- Run `bun run test` to execute Vitest coverage for the tRPC router happy-path workflow.
