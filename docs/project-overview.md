# Agent TS Monorepo

Agent TS is a Bun-powered Turborepo monorepo that hosts a full-stack agent experience. The backend is built with NestJS and Mastra to expose agent capabilities via a clean API surface. The frontend uses Vite, TanStack Router, Tailwind CSS, shadcn/ui patterns, and CopilotKit to provide an interactive assistant UI.

## Repository Layout

```
.
├── apps
│   ├── backend        # NestJS + Mastra API
│   └── frontend       # Vite + React + CopilotKit client
├── docs               # Project documentation
├── package.json       # Bun + Turborepo workspace definition
├── tsconfig.base.json # Shared TypeScript configuration
└── turbo.json         # Turborepo pipeline configuration
```

## Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Start development servers**

   ```bash
   bun run dev --filter @agent-ts/backend
   bun run dev --filter @agent-ts/frontend
   ```

   Use two terminals or rely on Turborepo to run both in parallel:

   ```bash
   bun run dev
   ```

3. **Build the applications**

   ```bash
   bun run build
   ```

4. **Lint the codebase**

   ```bash
   bun run lint
   ```

## Previewing Online

To preview the applications online, deploy the frontend and backend to a platform that supports Bun or Node runtimes (such as Vercel, Netlify, or Render). Configure the frontend environment variable `VITE_COPILOTKIT_RUNTIME_URL` to point at the deployed backend `/agent/chat` endpoint so CopilotKit can reach the Mastra agent.

## Environment Variables

| App       | Variable                        | Description                                      |
|-----------|----------------------------------|--------------------------------------------------|
| Frontend  | `VITE_COPILOTKIT_RUNTIME_URL`   | HTTP endpoint that proxies chat requests.        |
| Backend   | `PORT`                          | Port for the NestJS server (defaults to `3000`). |

## Scripts

| Command                 | Description                                   |
|-------------------------|-----------------------------------------------|
| `bun run dev`           | Runs all dev servers through Turborepo.       |
| `bun run dev --filter`  | Runs a specific workspace dev server.         |
| `bun run build`         | Builds all workspaces.                         |
| `bun run lint`          | Lints all workspaces.                          |
| `bun run format`        | Placeholder for formatting tasks.             |

## Next Steps

- Connect the CopilotKit runtime to the NestJS `/agent/chat` endpoint.
- Expand the Mastra agent with tools, memory, and workflows.
- Add shared packages for domain types and utilities.
- Introduce automated testing and CI pipelines.
