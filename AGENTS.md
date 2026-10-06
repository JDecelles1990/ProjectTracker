# Agent and contributor guidance

> Documentation cross-reference: [Documentation matrix](DOCS-MATRIX.md).

These instructions apply to changes in ProjectTracker. Read [README.md](README.md) for the product overview and the relevant guides under [`docs/`](docs/) before changing behavior or architecture.

## Architectural boundaries

- Keep ProjectTracker a modular monolith. Renderer, preload, main process, and shared contracts are layers in one desktop application, not separate services.
- Keep renderer code presentational. It may keep UI state and call typed `window.tracker` methods, but must not access Node.js, SQLite, filesystem APIs, or raw IPC.
- Keep the preload API narrow and explicitly allow-listed. Add named methods; do not expose generic IPC capabilities.
- Treat renderer-supplied IPC payloads as untrusted. Validate mutation inputs in `src/main/validation.ts` before persistence.
- Keep SQLite operations in `src/main/repositories.ts`, connection lifecycle in `src/main/database.ts`, and schema migrations in `src/main/schema.ts`. Use parameterized SQL only.
- Preserve Electron safeguards: `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- Limit `src/shared/types.ts` to shared domain and API contracts; keep UI and database behavior out of it.

See [Architecture](docs/architecture.md) for process boundaries and request flow, and [Module responsibilities](docs/modules.md) for source ownership.

## Data and migrations

- SQLite is the source of truth for project, task, and user preference records. Markdown is for product, architecture, usage, and development documentation only.
- Add schema changes as forward, transactional migrations in `src/main/schema.ts`. Never edit a migration that may already have shipped; preserve existing user data.
- Preserve established deletion semantics: deleting a project detaches its tasks instead of deleting them.
- Update [Data model](docs/data-model.md) whenever tables, fields, constraints, relationships, or migration policy change.
- Validate preference values at the IPC boundary and keep persisted preference defaults aligned with the renderer's initial state.

## Implementation practices

- Follow the existing TypeScript, React, Electron, and Vitest patterns. Prefer explicit domain types and runtime guards over unsafe casts.
- Keep changes focused and responsibilities with their owning modules. Avoid unrelated refactors, unnecessary abstractions, and new dependencies unless needed.
- Surface errors; do not silently swallow failures or return success-shaped fallbacks.
- Never add credentials or other secrets to source or documentation.
- Update user and architecture documentation when behavior, product scope, setup, or system boundaries change. Keep the README concise and link to focused guides rather than duplicating them.
- Use the status indicators defined in [Product scope](docs/product-scope.md) when describing capabilities: distinguish implemented, planned, partial, and idea-only work. Do not label a feature implemented unless it exists in the current code.
- Keep the README, product-scope, usage, architecture, and data-model docs consistent with the shipped behavior. When a feature changes, review all directly related docs and remove stale claims.
- Keep the Usage guide limited to workflows users can perform now. Keep proposed work under an explicitly labeled **Ideas — not implemented** section unless it has been approved as planned; retain status labels when updating docs from another contributor or assistant.

## Validation

Run checks relevant to the change:

```powershell
npm test
npm run typecheck
npm run build
```

At minimum, cover changed behavior with focused tests. Database tests use `createTestDatabase()` from `src/main/test-utils.ts` to create an isolated in-memory database. For documentation-only changes, check links and ensure commands and claims match the current project; code checks are unnecessary unless the docs reveal a code discrepancy.

## Documentation map

- [README](README.md): product overview, quick start, development checks, and links to guides.
- [Architecture](docs/architecture.md): process boundaries, IPC flow, persistence, safeguards, and extension guidance.
- [Module responsibilities](docs/modules.md): source file ownership.
- [Data model](docs/data-model.md): database schema and migration policy.
- [Product scope](docs/product-scope.md): MVP capabilities and non-goals.
- [Feature plan](PLAN.md): proposed future increments; planning only, not implementation authorization.
- [Documentation matrix](DOCS-MATRIX.md): Markdown topic ownership, cross-references, and consistency rules.
- [Usage](docs/usage.md): user workflows.
- [Setup and development](docs/setup.md): prerequisites, commands, troubleshooting, and packaging notes.
