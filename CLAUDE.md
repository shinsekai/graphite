# CLAUDE.md — Graphite Project Guidelines

> Graphite is a private, self-hosted note-taking application with rich-text editing.
> This file defines the rules Claude Code must follow across the entire codebase.

---

## Project Identity

- **Name**: Graphite
- **Tagline**: "Your thoughts, your infrastructure."
- **Description**: A private, self-hosted note-taking app with rich-text editing, deployed on Scaleway using Serverless Containers and Managed PostgreSQL, following Scaleway security best practices (VPC isolation, Secret Manager, Cockpit observability). Authentication is handled externally by Cloudflare Access (zero-trust tunnel).

---

## Tech Stack (non-negotiable)

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Language         | TypeScript (strict mode, ES2022+) |
| Runtime          | Bun                               |
| Package manager  | Bun workspaces                    |
| Monorepo         | Turborepo                         |
| Task runner      | Just (Justfile)                   |
| Linting/Format   | Biome                             |
| API framework    | Hono                              |
| Frontend         | React 19 + Vite                   |
| Rich-text editor | TipTap (ProseMirror)              |
| ORM              | Drizzle ORM                       |
| Database         | PostgreSQL (Scaleway Managed RDB) |
| IaC              | Pulumi (TypeScript)               |
| Container        | Docker (multi-stage, Bun base)    |
| Testing          | Vitest                            |
| Authentication   | Cloudflare Access (zero-trust)    |
| DNS / CDN        | Cloudflare (proxied CNAME)        |
| Secrets          | Scaleway Secret Manager           |
| Observability    | Scaleway Cockpit (Grafana)        |

---

## Monorepo Structure

```
graphite/
├── apps/
│   ├── web/              # React + Vite frontend
│   └── api/              # Hono + Bun API server
├── packages/
│   ├── db/               # Drizzle schema, migrations, client
│   ├── shared/           # Zod schemas, TypeScript types, constants
│   └── config/           # Shared Biome, tsconfig, Vitest configs
├── infra/                # Pulumi stack (TypeScript)
├── docker/
│   └── Dockerfile        # Multi-stage build
├── justfile              # Project command runner
├── docker-compose.yml    # Local dev: postgres + app
├── turbo.json
├── biome.json
├── package.json          # Root workspace config
├── CLAUDE.md             # This file
└── PRD.md
```

---

## Justfile

The Justfile is the **single entry point** for all project operations. Developers should never need to remember which underlying tool runs what — every action is a `just <command>`.

```just
# ── Development ──────────────────────────────────────
dev             # Start API + Web in parallel (turbo dev)
install         # bun install
check           # Biome lint + format check (turbo check)
test            # Run all tests (turbo test)
typecheck       # TypeScript type check (turbo typecheck)
build           # Production build (turbo build)

# ── Docker Compose (full local stack) ────────────────
up              # Start postgres + app containers (docker compose up -d)
down            # Stop all containers (docker compose down)
logs            # Tail app container logs (docker compose logs -f app)
restart         # Rebuild and restart app container

# ── Database ─────────────────────────────────────────
db-migrate      # Run Drizzle migrations (turbo db:migrate)
db-generate     # Generate migration from schema changes (bunx drizzle-kit generate)
db-studio       # Open Drizzle Studio GUI (bunx drizzle-kit studio)

# ── Docker (standalone image) ────────────────────────
docker-build    # Build production Docker image
docker-run      # Run production image locally with test env vars

# ── Infrastructure ───────────────────────────────────
infra-preview   # Pulumi preview (dry run)
infra-up        # Pulumi up (deploy)
deploy          # Full deploy: build → push → pulumi up

# ── Utilities ────────────────────────────────────────
clean           # Remove node_modules, .turbo, dist
format          # Auto-format all files (bunx biome format --write .)
```

**Rules:**
- Every `just` command must work from the repository root.
- Commands that operate in subdirectories (e.g., `infra/`) use `cd infra &&` internally.
- Environment variables for local dev are loaded from `.env` via `set dotenv-load`.
- The Justfile is the source of truth for how to run things — the README should reference `just` commands, not raw tool invocations.

---

## Code Conventions

### General

- All code is TypeScript with `strict: true`. No `any` types — use `unknown` and narrow.
- No default exports. Use named exports everywhere.
- Prefer `const` over `let`. Never use `var`.
- Use `type` for type aliases. Use `interface` only when extending is needed.
- File naming: `kebab-case.ts` for all files. No `PascalCase` filenames except React components (`note-editor.tsx` not `NoteEditor.tsx` — use named export `NoteEditor` inside).
- Import order (enforced by Biome): built-ins → external deps → internal packages (`@graphite/*`) → relative imports. Blank line between groups.
- No barrel files (`index.ts` re-exporting everything). Import from the specific module.
- Maximum file length: 300 lines. Split if larger.

### API (Hono)

- All route handlers go in `apps/api/src/routes/`. One file per resource (e.g., `notes.ts`).
- Use Hono's built-in validator middleware with Zod schemas from `@graphite/shared`.
- Every endpoint returns typed JSON. Use consistent response shapes:
  - Success: `{ data: T }`
  - Error: `{ error: { code: string, message: string } }`
- HTTP status codes: `200` OK, `201` created, `400` validation error, `404` not found, `500` server error.
- All database queries go through Drizzle. No raw SQL strings in route files.
- Use `hono/cors` middleware. Configure allowed origins via environment variable.
- **No auth middleware in the app.** Authentication is handled externally by Cloudflare Access before requests reach the container.
- Health check endpoint: `GET /health` returns `{ status: "ok" | "error", timestamp: string, checks: { database } }`.

### Frontend (React)

- Functional components only. No class components.
- State management: React state + TanStack Query. No Redux, no Zustand.
- Styling: CSS Modules (`.module.css`) with CSS custom properties for theming. No Tailwind, no styled-components.
- Component structure: one component per file. Co-locate styles (`note-card.tsx` + `note-card.module.css`).
- Custom hooks go in `apps/web/src/hooks/`. Prefix with `use`.
- API calls go through a typed client in `apps/web/src/lib/api-client.ts` using TanStack Query.
- TipTap extensions are configured in `apps/web/src/editor/`. Each custom extension gets its own file.
- Icons: use `lucide-react`. No other icon libraries.
- No `console.log` in committed code. Use a logger utility if needed.
- **No auth page, no auth guard, no token management.** The user is authenticated by Cloudflare Access before they reach the app.

### Database (Drizzle)

- Schema definitions live in `packages/db/src/schema/`. One file per table.
- Use `pgTable` from `drizzle-orm/pg-core`.
- All tables must have: `id` (UUID, `gen_random_uuid()`), `createdAt` (timestamp with timezone, `defaultNow()`), `updatedAt` (timestamp with timezone, `defaultNow()`).
- Column naming: `camelCase` in TypeScript, Drizzle maps to `snake_case` in SQL.
- Migrations generated via `drizzle-kit generate`. Never hand-edit migration SQL.
- Connection pooling: use Drizzle's `postgres` driver (via `postgres` npm package).
- Database is accessed exclusively via Private Network in production. No public endpoint.

### Shared Package

- Zod schemas in `packages/shared/src/schemas/`. One file per domain (e.g., `note.ts`).
- Export both the schema and the inferred type: `export const noteSchema = z.object({...})` and `export type Note = z.infer<typeof noteSchema>`.
- Constants (limits, config keys) in `packages/shared/src/constants.ts`.
- No runtime dependencies in shared. Only `zod` as a peer dependency.

---

## Testing Rules

- **Every task must include unit tests.** No PR or task is considered complete without them.
- Test framework: Vitest (configured in `packages/config`).
- Test file naming: `*.test.ts` co-located next to the source file.
- API routes: test with Hono's `app.request()` test helper. Mock the database layer. No auth headers needed in tests.
- Frontend components: test with `@testing-library/react`. No snapshot tests.
- Shared schemas: test validation with valid and invalid inputs.
- Database: test schema definitions and query builders. Use a test database or Drizzle's mock.
- Minimum coverage expectation: all happy paths + primary error paths.
- Run tests via `just test` (which runs `turbo test`, parallelized across packages).

---

## Biome Configuration

- Formatter: 2 spaces, single quotes, trailing commas, semicolons always.
- Linter: all recommended rules enabled. Key overrides:
  - `noExplicitAny`: error
  - `useConst`: error
  - `noConsoleLog`: warn (error in CI)
  - `noUnusedVariables`: error
  - `noNonNullAssertion`: warn
- Organize imports: enabled, groups matching the import order convention above.

---

## Environment Variables

Environment variables are injected into the Serverless Container. **Sensitive values must use Scaleway's secret environment variables** (encrypted at rest) — never plain environment variables.

| Variable                     | Used by | Secret? | Description                                         |
| ---------------------------- | ------- | ------- | --------------------------------------------------- |
| `DATABASE_URL`               | api     | Yes     | PostgreSQL connection string (Private Network host)  |
| `CORS_ORIGIN`                | api     | No      | Allowed CORS origin (e.g., `https://graphite.example.com`) |
| `PORT`                       | api     | No      | Server port (default: 3000)                          |
| `VITE_API_URL`               | web     | No      | API base URL for the frontend                        |

**Rules:**
- `DATABASE_URL` uses the Private Network hostname in production (e.g., `postgresql://graphite:***@graphite-db.graphite-pn.internal:5432/graphite`). In local dev (docker-compose), it uses `localhost`.
- Environment variables are validated at startup using Zod in `apps/api/src/env.ts`. If any required variable is missing, the server refuses to start with a clear error message.
- In Pulumi, sensitive values are set via `secretEnvironmentVariables`, non-sensitive via `environmentVariables`.
- For local development, create a `.env` file at the project root (git-ignored). The Justfile loads it automatically via `set dotenv-load`.
- **No `AUTH_TOKEN` variable.** Authentication is handled by Cloudflare Access, not the application.

---

## Docker

### Production image (`docker/Dockerfile`):
- Base image: `oven/bun:1` (alpine variant).
- Multi-stage build:
  1. **deps**: install all workspace dependencies.
  2. **build**: run `turbo build` (builds both web and api).
  3. **runtime**: copy only production artifacts + `node_modules`. Run with `bun run apps/api/src/index.ts`.
- The API serves the built SPA static files via Bun's native file API (not Hono's serveStatic).
- Single container, single port. No Nginx.
- `.dockerignore` must exclude: `node_modules`, `.turbo`, `dist`, `.env*`, `infra/`.
- The container must bind to `0.0.0.0` on the `PORT` environment variable. Scaleway requires this for health detection.
- Start the web server **after** completing all startup tasks (DB connection, migrations check) — Scaleway considers the container ready once the port is bound.

### Local development (`docker-compose.yml`):
Two services:

1. **postgres**: PostgreSQL 16 for local development.
   - Image: `postgres:16-alpine`
   - Port: 5432
   - Volume for data persistence
   - Credentials: `graphite` / `graphite` / `graphite`

2. **app**: The Graphite application (production-like).
   - Builds from `docker/Dockerfile`
   - Port: 3000
   - Depends on `postgres` (with healthcheck wait)
   - Environment variables loaded from `.env` file
   - Useful for: integration testing, verifying the production build, testing the full stack before deploying

**Workflow guidance:**
- For day-to-day frontend/backend development: use `just dev` (runs Turbo with HMR, faster iteration).
- For integration testing or testing the Docker build: use `just up` (runs docker-compose with both services).
- Both modes connect to the same PostgreSQL instance if the docker-compose postgres is running.
- **No auth token needed** — in local dev there's no Cloudflare Access, so the app is open. In production, Cloudflare Access blocks unauthenticated requests before they reach the container.

---

## Pulumi / Infrastructure

- Stack: `graphite-prod` (single environment for now).
- Provider: `@pulumi/scaleway`.
- Region: `fr-par`, Zone: `fr-par-1`.

### Resources provisioned:

1. **VPC + Private Network** (`graphite-vpc`, `graphite-pn`):
   - A dedicated VPC with a single Private Network.
   - All backend resources (database, container) attach to this Private Network.
   - DHCP managed automatically by Scaleway.

2. **Scaleway Container Registry** (`graphite-registry`):
   - Visibility: private.
   - Used by Serverless Container to pull images. Prefer Scaleway's registry over Docker Hub to avoid rate limiting.

3. **Scaleway Managed Database** (`graphite-db`):
   - Engine: PostgreSQL 16, node type: DB-DEV-S.
   - Attached to Private Network `graphite-pn`. Public endpoint **disabled**.
   - The `DATABASE_URL` uses the private hostname assigned by DHCP/IPAM.
   - Daily backups enabled (Scaleway default).

4. **Scaleway Serverless Container** (`graphite-app`):
   - Image: from `graphite-registry`.
   - Sandbox: **v2** (explicitly set — v1 has clock drift issues).
   - Min scale: 0, max scale: 3.
   - CPU: 1000m (1 vCPU), memory: 1024 MB.
   - Port: 3000.
   - HTTPS only: enabled (HTTP → HTTPS redirect enforced at Scaleway level).
   - Privacy policy: **public** (Cloudflare Access handles authentication at the edge; the container itself has no auth layer).
   - Attached to Private Network `graphite-pn` (for DB access over private NIC).
   - **Environment variables** (non-sensitive): `CORS_ORIGIN`, `PORT`.
   - **Secret environment variables** (encrypted at rest): `DATABASE_URL`.

5. **Scaleway Serverless Container Domain** (`graphite.example.com`):
   - Managed via `scaleway.containers.Domain` Pulumi resource.
   - Points to the container. TLS certificate auto-generated by Scaleway via Let's Encrypt HTTP-01 challenge.

6. **Scaleway Cockpit** (observability):
   - Enabled for the project. All Serverless Containers automatically send logs and metrics.
   - Grafana dashboard accessible via Scaleway console.
   - Alerts configured for: container error rate > 5%, p95 latency > 1s, container restart loops.

### Cloudflare Configuration (manual, documented):

**DNS (CNAME):**
- CNAME record: `graphite.example.com` → `{container-default-url}.functions.fnc.fr-par.scw.cloud`.
- Proxy status: **Proxied** (orange cloud) — enables WAF, DDoS protection, and edge caching for static assets.
- SSL/TLS mode: **Full (strict)** — Cloudflare ↔ Scaleway both use valid TLS certificates.
- "Always Use HTTPS": enabled.
- **Initial setup order** (to avoid HTTP-01 challenge failure):
  1. Create the CNAME in Cloudflare with proxy **disabled** (gray cloud / DNS only).
  2. Run `just infra-up` to create the container and custom domain.
  3. Wait for domain status to become `ready` (Scaleway issues the Let's Encrypt cert).
  4. Switch the Cloudflare CNAME to **proxied** (orange cloud).
  5. After this, cert renewals work automatically through Cloudflare.

**Cloudflare Access (zero-trust authentication):**
- A Cloudflare Access application is configured for `graphite.example.com`.
- Authentication policy: configured per user preference (e.g., email OTP, GitHub SSO, Google SSO).
- All requests to the domain are authenticated by Cloudflare before they reach the Scaleway container.
- The Graphite app itself has **no auth middleware** — it trusts that Cloudflare Access has already verified the user.
- Cloudflare Access is configured manually in the Cloudflare Zero Trust dashboard (not managed by Pulumi).

### Pulumi secrets management:

- Sensitive config values are set via `pulumi config set --secret`.
- These are: `db-password`.
- Pulumi passes them to the container as `secretEnvironmentVariables`, which Scaleway encrypts at rest.

### Outputs:

- `apiUrl`: the custom domain URL (`https://graphite.example.com`).
- `containerDefaultUrl`: the Scaleway-assigned `.scw.cloud` URL (for CNAME target).
- `dbHost`: the private hostname of the database.
- `registryEndpoint`: the container registry endpoint.
- `cockpitUrl`: the Grafana dashboard URL.

---

## Git Conventions

- Branch naming: `epic/short-name`, `task/EPIC-TASK-short-description` (e.g., `task/1-1-monorepo-init`).
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
- One logical change per commit. Don't mix refactors with features.

---

## Design Aesthetic

The UI follows a dark-first, minimal design language inspired by Obsidian:

- **Dark background**: `#1e1e1e` (primary), `#252525` (surfaces), `#2d2d2d` (elevated).
- **Light text**: `#e0e0e0` (primary), `#a0a0a0` (secondary), `#666666` (muted).
- **Accent**: `#7c5cbf` (purple, for interactive elements and focus states).
- **Borders**: `#333333` (subtle), `#444444` (hover).
- **Font**: `Inter` for UI, `JetBrains Mono` for code blocks.
- **Spacing**: 4px base unit. Padding/margins in multiples of 4.
- **Radius**: 4px for small elements (buttons, inputs), 8px for cards/panels.
- **Transitions**: 150ms ease for hover states. No animations longer than 300ms.
- **Layout**: fixed sidebar (240px) + fluid editor pane. Resizable divider optional.
- **Light mode**: supported as a secondary theme via CSS custom properties, but dark is the default.

---

## Performance Constraints

- API response time: < 100ms for CRUD operations (p95).
- Frontend bundle size: < 500KB gzipped (excluding TipTap).
- Time to interactive: < 2 seconds on 3G.
- Note content: stored as TipTap JSON (ProseMirror doc). Max 1MB per note.

---

## Security

### Authentication:
- **Cloudflare Access (zero-trust)** authenticates all users at the edge before requests reach the Scaleway container.
- The Graphite application has **no auth middleware, no login page, no token management**. It trusts Cloudflare Access completely.
- In local development, there is no authentication — the app is open on `localhost:3000`. This is intentional; the app is only accessible locally.
- Cloudflare Access is configured in the Cloudflare Zero Trust dashboard (email OTP, GitHub SSO, or other identity providers).

### Application level:
- XSS mitigated by TipTap's built-in sanitization and React's default escaping.
- SQL injection prevented by Drizzle's parameterized queries. No raw SQL.
- CORS locked to the specific origin (`CORS_ORIGIN`).
- Application secrets never logged or exposed in error responses.

### Infrastructure level (Scaleway best practices):
- **Network isolation**: Database has no public endpoint. All DB traffic flows over Private Network. The Serverless Container is the only resource with a public-facing endpoint.
- **Secrets encrypted at rest**: Sensitive environment variables use Scaleway's `secretEnvironmentVariables`, which are encrypted in storage and not visible in the console after creation.
- **HTTPS enforced**: Both at the Scaleway container level (HTTP → HTTPS redirect) and at Cloudflare (Always Use HTTPS). SSL mode: Full (strict).
- **WAF and DDoS protection**: Cloudflare proxy (orange cloud) provides edge security, rate limiting, and bot mitigation in front of the Scaleway container.
- **Zero-trust authentication**: Cloudflare Access ensures only authenticated users can reach the app. Unauthenticated requests are blocked at the Cloudflare edge, never reaching the container.
- **Sandbox v2**: Serverless Container uses the recommended v2 sandbox for better security isolation and no clock drift.
- **Container Registry**: Private. Scaleway's own registry is used instead of Docker Hub to avoid rate limiting and supply chain risks.
- **Observability**: Scaleway Cockpit provides logs, metrics, and alerting. Anomalous behavior (error spikes, latency degradation) triggers alerts.
- **Minimal attack surface**: Single container, single port, no SSH access, no public database endpoint, no app-level auth code to exploit.