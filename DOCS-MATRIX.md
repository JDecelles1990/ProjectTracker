# Documentation cross-reference matrix

This root document is the index and consistency map for ProjectTracker's Markdown documentation. Use it to find the authoritative source for a topic, identify documents that must agree, and avoid treating proposals or historical notes as implemented behavior.

## Document ownership matrix

| Document | Primary purpose / authority | Must stay aligned with | Not authoritative for |
|---|---|---|---|
| [README](README.md) | Public-facing overview, current top-level capability summary, quick start, and links | Product scope, Usage, Setup, this matrix | Detailed schema, architecture decisions, feature approval |
| [AGENTS](AGENTS.md) | Contributor constraints, safety rules, validation expectations, and documentation update rules | Architecture, Data model, Product scope, this matrix | Product roadmap or user-facing feature promises |
| [Implementation status](IMPLEMENTATION.md) | Concise snapshot of behavior verified in the current source | README, Product scope, Usage, source/tests | Historical build evidence, future roadmap, authorization |
| [Feature plan](PLAN.md) | Planning-only proposals, slice boundaries, decisions, and acceptance criteria | Product scope, Architecture, Data model, this matrix | Implemented behavior or permission to begin a slice |
| [Product scope](docs/product-scope.md) | Product intent, feature-status definitions, current scope, and explicit non-goals | README, Implementation status, Usage, Feature plan | Detailed setup or schema definition |
| [Usage guide](docs/usage.md) | User workflows available in the current app | README, Product scope, Implementation status | Planned/idea features or internal implementation design |
| [Architecture](docs/architecture.md) | Runtime/process boundaries, data flow, safety, persistence ownership | Module responsibilities, Data model, AGENTS, Feature plan | Exact user walkthrough or release roadmap |
| [Data model](docs/data-model.md) | SQLite records, constraints, relationships, defaults, and migration policy | Architecture, Module responsibilities, Feature plan, schema source | UI behavior or unimplemented proposed schema |
| [Module responsibilities](docs/modules.md) | Source-path ownership and layer boundaries | Architecture, AGENTS, current source tree | Feature requirements or complete API specification |
| [Setup and development](docs/setup.md) | Requirements, startup, validation commands, troubleshooting, packaging status | README, Architecture, package/config files | Product roadmap or user feature behavior |

## Topic cross-reference matrix

| Topic | Primary source | Cross-check these documents | Implementation truth |
|---|---|---|---|
| Feature status and product scope | [Product scope](docs/product-scope.md) | README, Implementation status, Usage, Feature plan | Current application source and tests |
| User workflows | [Usage guide](docs/usage.md) | README, Product scope, Implementation status | Renderer and exposed app behavior |
| Future ideas and slice acceptance | [Feature plan](PLAN.md) | Product scope, Architecture, Data model, this matrix | Not implemented until verified and status is changed |
| SQLite schema and migration version | [Data model](docs/data-model.md) | Architecture, Module responsibilities, Feature plan | `src/main/schema.ts`, repositories, migration tests |
| Process boundaries and IPC | [Architecture](docs/architecture.md) | Module responsibilities, AGENTS, Feature plan | `src/main/index.ts`, `src/preload/index.ts`, `src/shared/types.ts` |
| File/source ownership | [Module responsibilities](docs/modules.md) | Architecture, AGENTS | Current source tree |
| Install, run, test, build, native ABI | [Setup and development](docs/setup.md) | README, AGENTS | `package.json`, build config, current toolchain |
| Contributor safeguards and documentation policy | [AGENTS](AGENTS.md) | Architecture, Data model, Product scope | Repository instructions and code review |
| Summary of shipped capabilities | [Implementation status](IMPLEMENTATION.md) | README, Product scope, Usage | Current source plus applicable tests |
| Project entry point and link directory | [README](README.md) | All documents listed above | Repository root |

## Consistency rules

1. **Source code and tests decide whether a feature exists.** Documentation is not evidence that a behavior has been implemented.
2. **Product scope owns the status vocabulary:** ✅ Implemented, 🚧 Planned, 💡 Idea (not implemented), and ⚠️ Partial. Keep labels consistent wherever a feature is mentioned.
3. **Feature plan is non-authoritative for shipped behavior.** A proposal stays an idea until intentionally selected; it becomes implemented only after code, tests, and applicable documentation are updated.
4. **Data model owns the documented database contract.** A schema or migration change requires updating it and checking that Architecture and Feature plan no longer contradict it.
5. **Usage describes only user-visible behavior available now.** Do not put proposed workflows in the Usage guide.
6. **README is a concise public summary.** Link to focused documents instead of copying their detailed contracts.
7. **Implementation status is a current snapshot, not a history log.** Replace stale claims and old validation results rather than preserving them as current fact.
8. **After a feature change, update all affected rows in this matrix.** In particular, review README, Product scope, Usage, Implementation status, Architecture, Data model, Module responsibilities, Setup, and Feature plan as applicable.
9. **When documents conflict, use this precedence:** current source and tests for behavior; `src/main/schema.ts` for actual migrations; Product scope for feature-status meanings; then the topic-specific authority identified above. Correct every affected document—do not leave the conflict for readers to resolve.
10. **Each Markdown document links back here.** Keep this root matrix exhaustive when adding, renaming, or removing a Markdown file.

## Markdown inventory

The repository Markdown inventory is maintained by the Document ownership matrix above. When adding a `.md` file, add it to both matrices, choose one primary authority, add links to the relevant documents, and include a link back to this matrix.
