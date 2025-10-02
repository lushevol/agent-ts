# Project TODOs

- [x] Set up Turborepo + Bun workspace structure.
- [x] Add root configuration files (TypeScript base config, Turbo pipeline, shared linting/formatting).
- [x] Scaffold backend (NestJS + Mastra) application.
- [x] Scaffold frontend (Vite + TanStack Router + Tailwind + shadcn/ui + CopilotKit).
- [x] Configure shared dependencies and scripts for each package with Turborepo.
- [x] Write and update `AGENTS.md` with execution log/instructions.
- [x] Author initial project documentation outlining architecture and tooling.
- [ ] Implement CopilotKit runtime proxy in the backend.
- [ ] Add automated tests and continuous integration workflows.
- [ ] Expand shared packages for cross-application utilities.
- [ ] Restore real runtime dependencies and replace offline stubs when registry access is available.
- [x] Build pull request review agent service endpoints and persistence layer.
- [x] Implement prompt and issue classification management UIs.
- [x] Integrate review feedback loop to track false positives.
- [x] Deliver Mastra-driven prompt auto-tuning that incorporates reviewer feedback signals.
- [x] Stand up regression test suites that run whenever prompts or workflow logic change.
