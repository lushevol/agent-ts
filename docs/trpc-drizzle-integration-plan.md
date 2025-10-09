# tRPC + Drizzle + NestJS + Vite Integration Plan

## Objectives
- Establish a pnpm-managed monorepo layout that isolates database, shared schema, API, and web concerns.
- Leverage Drizzle ORM as the single source of truth for database models, migrations, and generated validation.
- Provide a type-safe contract between the NestJS backend and Vite frontend using tRPC and shared Zod schemas.
- Ensure developer ergonomics through shared tooling, automated validation, and reproducible local environments.

## Assumptions
- PostgreSQL is the primary persistence layer and accessible via `DATABASE_URL` environment variable.
- Existing Turborepo + Bun tooling remains the orchestration layer; pnpm workspaces can coexist for Node package boundaries.
- The backend continues to run within NestJS, and the frontend remains a Vite + React application.

## Workstreams

### 1. Workspace & Package Scaffolding
- Create `packages/db`, `packages/shared`, `packages/api`, and `packages/web` directories managed by pnpm workspaces.
- Configure each package with `tsconfig.json` extending the root base configuration and share linting/prettier rules.
- Update Turborepo and workspace configuration (`pnpm-workspace.yaml`, `package.json`, `turbo.json`) to include new packages and scripts.

### 2. Drizzle ORM Foundation
- Install Drizzle dependencies (`drizzle-orm`, `pg`, `drizzle-kit`) and add database connection utilities.
- Author core schema definitions (e.g., `users`) in `packages/db/schema.ts` and export a typed Drizzle client via `packages/db/index.ts`.
- Configure Drizzle Kit migrations and document migration workflow in repository scripts.

### 3. Shared Validation Layer
- Introduce `drizzle-zod` and `zod` within `packages/shared` to derive Zod schemas from Drizzle models.
- Export insert/select schemas and inferred TypeScript types for reuse across NestJS and React consumers.
- Provide re-export barrel files to simplify imports (`@myorg/shared/schemas`).

### 4. NestJS tRPC Server
- Install `@trpc/server` and supporting middleware adapters in the API package.
- Initialize the core router (`packages/api/src/trpc/router.ts`) using shared schemas for procedure validation.
- Implement representative query and mutation procedures (e.g., `getUsers`, `addUser`) backed by Drizzle calls.
- Wire the router into the NestJS bootstrap pipeline using the Express adapter and ensure context creation supports auth extensibility.

### 5. Vite tRPC Client Integration
- Add `@trpc/client`, `@trpc/react-query`, and `@tanstack/react-query` dependencies within the web package.
- Configure a typed tRPC client with HTTP batching that targets the NestJS `/trpc` endpoint.
- Wrap the React application with the tRPC and React Query providers and demonstrate usage via a sample component.

### 6. Testing & Validation
- Implement unit and integration tests covering Drizzle queries, tRPC procedures, and client hooks.
- Set up mocks or local PostgreSQL fixtures to exercise sample data paths.
- Document manual validation steps for running the NestJS server and Vite frontend together.

### 7. Operational Considerations
- Extend CI workflows to run database migrations, linting, and tests across the new packages.
- Capture environment variable requirements and local setup instructions in project documentation.
- Evaluate deployment packaging for API and web artifacts, ensuring shared packages are consumed consistently.

## Deliverables
- Updated TODO roadmap reflecting workstream tasks.
- Functional monorepo packages with shared types spanning database, backend, and frontend layers.
- Documentation that enables contributors to bootstrap, develop, and validate the full stack confidently.
