# Agent Instructions

## Development Notes
- This repository is a Bun-managed Turborepo monorepo. Use `bun install` to install dependencies and `bun run <script>` to execute scripts.
- Frontend code lives under `apps/frontend` (Vite + React + Tailwind + shadcn/ui + CopilotKit). Backend code lives under `apps/backend` (NestJS + Mastra).
- Keep shared configuration in the repo root. New packages should extend `tsconfig.base.json` and respect the linting/prettier setup provided here.
- Prefer TypeScript across the project and avoid default exports.

## Operational Guidelines
- Maintain the root `TODO.md` checklist when planning or completing tasks.
- Document significant architecture or workflow decisions inside `docs/`.
- When modifying frontend UI, ensure Tailwind utility classes follow existing patterns and leverage shadcn/ui primitives where possible.
- Backend modules should be organized using NestJS conventions (modules, controllers, services) and keep Mastra integration encapsulated in services.

## Execution Log
- Initialized Bun + Turborepo workspace structure and shared tooling.
- Scaffolded NestJS backend with Mastra agent service and chat endpoint.
- Scaffolded Vite frontend with TanStack Router, Tailwind CSS, shadcn/ui button primitive, and CopilotKit chat interface.
- Authored project overview documentation and established repository TODO list.
- Captured pull request review agent product requirements and mocked API design in `docs/pull-request-review-agent-prd.md`.
- Expanded PR review agent PRD with Mastra implementation notes, prompt auto-tuning, and regression testing requirements.
- Implemented mock PR review agent backend APIs, auto-tuning workflows, and frontend management UI per the PRD.
