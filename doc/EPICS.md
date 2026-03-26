# Graphite — Epics & Tasks

> Each task includes a prompt to provide directly to Claude Code.
> Tasks are ordered by dependency. Complete them sequentially within each epic.
> Every task includes unit tests as a deliverable — no exceptions.

---

## Epic 1: Project Foundation & Monorepo Setup

**Goal**: Establish the Turborepo monorepo with all packages, tooling, Justfile, and shared configuration so every subsequent task has a solid foundation.

**Estimated effort**: 1.5 days

---

### Task 1.1 — Initialize monorepo skeleton and Justfile

**Description**: Create the root monorepo with Turborepo, Bun workspaces, Biome, Justfile, and shared TypeScript configuration. All packages should be empty shells that build and lint cleanly. The Justfile is the single entry point for all project operations.

**Depends on**: Nothing (first task)

**Deliverables**:
- Root `package.json` with Bun workspaces
- `turbo.json` with `build`, `dev`, `check`, `test`, `typecheck`, and `db:migrate` pipelines
- `biome.json` with the conventions from CLAUDE.md
- `justfile` with all commands documented in CLAUDE.md
- `.env.example` with all required environment variables (values blanked)
- `packages/config/` with shared `tsconfig.base.json` and `vitest.config.ts`
- `apps/web/package.json` (empty Vite + React app stub)
- `apps/api/package.json` (empty Hono + Bun app stub)
- `packages/db/package.json` (empty, depends on drizzle-orm)
- `packages/shared/package.json` (empty, depends on zod)
- All workspaces aliased as `@graphite/*`
- `just build` and `just check` pass with zero errors
- Tests: a trivial test in each package that passes via `just test`

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md in the project root for full context.

Initialize the Graphite monorepo from scratch. Create the full directory structure:

graphite/
├── apps/web/          (React + Vite, empty stub)
├── apps/api/          (Hono + Bun, empty stub)
├── packages/db/       (Drizzle ORM, empty stub)
├── packages/shared/   (Zod schemas, empty stub)
├── packages/config/   (shared tsconfig, vitest config)
├── justfile
├── .env.example
├── turbo.json
├── biome.json
├── package.json       (bun workspaces)

Requirements:
1. Root package.json uses Bun workspaces pointing to apps/* and packages/*.
2. turbo.json defines pipelines: build, dev, check (runs biome), test (runs vitest), typecheck (runs tsc --noEmit), db:migrate.
3. biome.json follows the conventions in CLAUDE.md: 2 spaces, single quotes, trailing commas, semicolons, strict linting rules.
4. packages/config/ exports a base tsconfig.json (strict: true, ES2022, module: ESNext, moduleResolution: bundler) and a base vitest.config.ts.
5. Each app/package has its own tsconfig.json extending the base, and a "typecheck" script running tsc --noEmit.
6. Workspace aliases: @graphite/web, @graphite/api, @graphite/db, @graphite/shared, @graphite/config.
7. apps/web is a minimal Vite + React + TypeScript app that renders "Graphite" in an h1.
8. apps/api is a minimal Hono server that responds to GET / with { message: "Graphite API" }. Entry point: src/index.ts.
9. packages/db has an empty src/index.ts exporting a placeholder.
10. packages/shared has an empty src/index.ts exporting a placeholder.
11. Add a trivial .test.ts in each package that passes (e.g., assert 1+1 === 2).

12. Create the justfile with `set dotenv-load`. Commands:
    dev, install, check, test, typecheck, build,
    up, down, logs, restart, db-only,
    db-migrate, db-generate, db-studio,
    docker-build, docker-run,
    infra-preview, infra-up, deploy,
    clean, format
    (see CLAUDE.md Justfile section for exact definitions)

13. Create .env.example with all variables from CLAUDE.md (DATABASE_URL, CORS_ORIGIN, PORT, AUTH_TOKEN, VITE_API_URL), values blanked with comments.
14. Add .env to .gitignore.
15. Verify: `bun install`, `just build`, `just check`, and `just test` all pass with zero errors.

Do NOT use default exports anywhere. Use named exports only.
```

---

### Task 1.2 — Shared types and Zod schemas

**Description**: Define the shared domain types and Zod validation schemas used by both the API and the frontend.

**Depends on**: Task 1.1

**Deliverables**:
- `packages/shared/src/schemas/note.ts` — Zod schemas for Note, CreateNote, UpdateNote, NoteSummary
- `packages/shared/src/schemas/common.ts` — Shared schemas (API response wrappers, error shape, search query)
- `packages/shared/src/constants.ts` — Constants
- Exported TypeScript types inferred from each schema
- Tests: validate each schema with correct data, invalid data, and edge cases

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md for full context. Work in the packages/shared/ package.

Create the shared Zod schemas and TypeScript types for Graphite:

1. packages/shared/src/schemas/note.ts:
   - noteSchema: { id: uuid, title: string (max 500), content: jsonb (record), plaintext: string, pinned: boolean, createdAt: datetime string, updatedAt: datetime string }
   - createNoteSchema: { title?: string, content?: record } (both optional, defaults handled server-side)
   - updateNoteSchema: { title?: string, content?: record, plaintext?: string, pinned?: boolean } (all optional)
   - noteSummarySchema: { id: uuid, title: string, preview: string (max 80 chars), pinned: boolean, updatedAt: datetime string }
   - Export inferred types: Note, CreateNote, UpdateNote, NoteSummary

2. packages/shared/src/schemas/common.ts:
   - apiSuccessSchema(dataSchema): generic wrapper { data: T }
   - apiErrorSchema: { error: { code: string, message: string } }
   - searchQuerySchema: { q: string (min 1, max 200) }
   - Export types: ApiSuccess<T>, ApiError, SearchQuery

3. packages/shared/src/constants.ts:
   - NOTE_TITLE_MAX_LENGTH = 500
   - NOTE_CONTENT_MAX_BYTES = 1_048_576 (1MB)
   - NOTE_PREVIEW_LENGTH = 80
   - AUTOSAVE_DEBOUNCE_MS = 1500
   - SEARCH_DEBOUNCE_MS = 300

4. packages/shared/src/index.ts: re-export everything from schemas/ and constants.

5. Write thorough tests in packages/shared/src/schemas/note.test.ts, common.test.ts:
   - Valid data parses correctly
   - Missing required fields fail
   - Fields exceeding max lengths fail
   - Optional fields can be omitted
   - UUID format is validated
   - Edge cases: empty strings, null values, extra fields stripped

Run `just test` and ensure all tests pass.
```

---

### Task 1.3 — Drizzle database schema and migrations

**Description**: Define the PostgreSQL schema using Drizzle ORM and generate the initial migration.

**Depends on**: Task 1.2

**Deliverables**:
- `packages/db/src/schema/notes.ts` — Notes table definition
- `packages/db/src/client.ts` — Database client factory
- `packages/db/src/index.ts` — Exports schema and client
- `packages/db/drizzle.config.ts` — Drizzle Kit configuration
- Generated migration SQL in `packages/db/migrations/`
- Tests: schema definition tests (column types, defaults, constraints)

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md for full context, especially the Data Model section in PRD.md. Work in packages/db/.

Create the Drizzle ORM schema and database client for Graphite:

1. packages/db/src/schema/notes.ts:
   - Define `notes` table using pgTable with columns matching PRD section 4.1:
     - id: uuid, primaryKey, default gen_random_uuid()
     - title: varchar(500), notNull, default ''
     - content: jsonb, notNull, default {}
     - plaintext: text, notNull, default ''
     - pinned: boolean, notNull, default false
     - createdAt: timestamp with timezone, notNull, defaultNow()
     - updatedAt: timestamp with timezone, notNull, defaultNow()
   - Define indexes: idx_notes_updated_at on updatedAt DESC
   - Export the table and its inferred select/insert types

2. packages/db/src/client.ts:
   - Export a function `createDb(connectionString: string)` that creates and returns a Drizzle instance using the `postgres` driver (npm package `postgres`).
   - The function should accept the connection string as a parameter, not read from env directly.
   - Note: in production, the connection string uses a Private Network hostname (see CLAUDE.md).

3. packages/db/drizzle.config.ts:
   - Configure drizzle-kit: dialect postgresql, schema path, migrations output directory.

4. Generate the initial migration: run `just db-generate` and verify the SQL is correct.

5. packages/db/src/index.ts: export everything (schema table, types, client factory).

6. Tests in packages/db/src/schema/notes.test.ts:
   - Test that table definition has the expected columns, types, and defaults
   - Test that the table has the correct indexes
   - Test that createDb returns a valid Drizzle instance (mock the connection)

Run `just test` and ensure all tests pass.
```

---

### Task 1.4 — Docker and docker-compose setup

**Description**: Create the production Dockerfile and the docker-compose file with both PostgreSQL and the Graphite app for local full-stack development and integration testing.

**Depends on**: Task 1.1

**Deliverables**:
- `docker/Dockerfile` — Multi-stage production build
- `docker-compose.yml` — Local dev with PostgreSQL + app services
- `.dockerignore`
- Tests: Dockerfile builds successfully, `just up` starts both services, health endpoint responds

**Prompt for Claude Code**:
```
Read CLAUDE.md for full context, especially the Docker section. Create the Docker setup for Graphite.

1. docker/Dockerfile (multi-stage build):
   Stage 1 "deps": FROM oven/bun:1-alpine, copy package.json + workspace package.jsons + bun.lock, run bun install --frozen-lockfile.
   Stage 2 "build": FROM deps, copy all source, run turbo build (builds both apps/web and apps/api).
   Stage 3 "runtime": FROM oven/bun:1-alpine, copy only: built API (apps/api/dist or src), built web assets (apps/web/dist), production node_modules. Entry: bun run apps/api/src/index.ts. Expose port 3000. Set NODE_ENV=production.

   Key details:
   - The API serves static frontend files via Hono's serveStatic.
   - Only production dependencies in the final stage.
   - The container must bind to 0.0.0.0 on the PORT env var.
   - Start the web server AFTER completing startup tasks (DB connection check).

2. docker-compose.yml with TWO services:

   Service 1 — postgres:
   - Image: postgres:16-alpine
   - Port: 5432:5432
   - Volume: graphite-pgdata:/var/lib/postgresql/data
   - Environment: POSTGRES_DB=graphite, POSTGRES_USER=graphite, POSTGRES_PASSWORD=graphite
   - Healthcheck: pg_isready -U graphite -d graphite

   Service 2 — app:
   - Build: context ".", dockerfile "docker/Dockerfile"
   - Port: 3000:3000
   - Depends on: postgres (condition: service_healthy)
   - Environment: DATABASE_URL=postgresql://graphite:graphite@postgres:5432/graphite, CORS_ORIGIN=http://localhost:3000, AUTH_TOKEN from .env, PORT=3000
   - Restart: unless-stopped

   IMPORTANT: The app's DATABASE_URL uses "postgres" as the host (the compose service name), NOT "localhost".

3. .dockerignore: node_modules, .turbo, dist, .env*, infra/, .git, *.md (except CLAUDE.md).

4. Update the justfile commands:
   - `just up` → docker compose up -d
   - `just down` → docker compose down
   - `just logs` → docker compose logs -f app
   - `just restart` → docker compose up -d --build app
   - `just db-only` → docker compose up -d postgres

5. Tests: Write docker/test-build.sh that builds, starts, verifies health, stops.

Verify the Dockerfile builds and `just up` starts both services.
```

---

## Epic 2: API Server

**Goal**: Build the Hono API with all CRUD endpoints, authentication middleware, and error handling.

**Estimated effort**: 2 days

---

### Task 2.1 — Hono server bootstrap and middleware

**Description**: Set up the Hono application with environment validation, CORS, auth middleware, error handling, and the health endpoint.

**Depends on**: Task 1.1, Task 1.2

**Deliverables**:
- `apps/api/src/index.ts` — Server entry point
- `apps/api/src/app.ts` — Hono app factory (testable without starting the server)
- `apps/api/src/env.ts` — Zod-based environment variable validation
- `apps/api/src/middleware/auth.ts` — Bearer token auth middleware
- `apps/api/src/middleware/error-handler.ts` — Global error handler
- `GET /health` endpoint
- Tests: auth middleware, error handler, health endpoint, env validation

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md for context. Work in apps/api/.

Bootstrap the Hono API server for Graphite:

1. apps/api/src/env.ts:
   - Define a Zod schema for all required environment variables (see CLAUDE.md):
   - Non-sensitive: CORS_ORIGIN, PORT (default "3000").
   - Sensitive (Scaleway secret env vars in production, .env locally): DATABASE_URL, AUTH_TOKEN.
   - Export a validated `env` object. If validation fails, log errors and exit with code 1.

2. apps/api/src/app.ts:
   - Export a `createApp(deps)` function that builds and returns a Hono app. The `deps` parameter receives injected dependencies (db instance, env config) for testability.
   - Register middleware: error handler, CORS (env.CORS_ORIGIN), auth (skip for GET /health).
   - Register GET /health → { status: "ok", timestamp: new Date().toISOString() }.

3. apps/api/src/middleware/auth.ts:
   - Check Authorization header for "Bearer <token>".
   - Compare using crypto.timingSafeEqual.
   - Return 401 on failure. Skip for /health.

4. apps/api/src/middleware/error-handler.ts:
   - AppError class (statusCode, code, message). Known errors → proper status. Unknown → 500 generic. Never leak stack traces.

5. apps/api/src/index.ts:
   - Bind to 0.0.0.0. Complete DB connection check BEFORE starting server (Scaleway readiness).
   - Log "Graphite API listening on port {PORT}".

6. Tests: auth (valid/missing/wrong/malformed token, health skips auth), error handler (AppError, generic Error), env validation.

Use Hono's app.request() for testing. Mock the database.
Run `just test` and ensure all tests pass.
```

---

### Task 2.2 — Notes CRUD endpoints

**Description**: Implement all note endpoints: list, get, create, update, delete, and search.

**Depends on**: Task 2.1, Task 1.3

**Deliverables**:
- `apps/api/src/routes/notes.ts` — All note routes
- `apps/api/src/services/notes.ts` — Business logic / database queries
- Full-text search using PostgreSQL `to_tsvector` / `to_tsquery`
- Tests: CRUD operations, validation errors, not-found cases, search

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md (especially sections 5.1 and 4.1) for full context. Work in apps/api/.

Implement the notes CRUD routes and service layer for Graphite:

1. apps/api/src/services/notes.ts:
   - Export a NotesService that takes a Drizzle db instance.
   - Methods:
     - list(): notes ordered by pinned DESC, updatedAt DESC. Returns NoteSummary[].
     - getById(id): full Note or null.
     - create(data: CreateNote): insert, return Note.
     - update(id, data: UpdateNote): update + set updatedAt to now(). Return Note or null.
     - remove(id): delete. Return { id } or null.
     - search(query): PostgreSQL full-text search with to_tsvector/plainto_tsquery, ordered by ts_rank. Returns NoteSummary[].

2. apps/api/src/routes/notes.ts:
   - GET /api/notes, GET /api/notes/search?q=, GET /api/notes/:id, POST /api/notes, PUT /api/notes/:id, DELETE /api/notes/:id
   - Use Hono's validator middleware with Zod schemas from @graphite/shared.
   - IMPORTANT: /search route defined BEFORE /:id.

3. Register in app.ts.

4. Tests: mock NotesService. Test all routes (list, create valid/invalid, get found/not-found/invalid-uuid, update found/not-found, delete found/not-found, search with/without query). Test service methods with mocked Drizzle.

Run `just test` and ensure all tests pass.
```

---

## Epic 3: Frontend Core

**Goal**: Build the React frontend with the sidebar, editor, and data layer. This epic produces a fully functional note-taking interface.

**Estimated effort**: 3.5 days

---

### Task 3.1 — React app bootstrap and API client

**Description**: Set up the Vite + React app with routing, TanStack Query, and a typed API client.

**Depends on**: Task 1.1, Task 1.2

**Deliverables**:
- Vite config with path aliases and API proxy
- React Router setup (two routes: `/` main, `/auth` token entry)
- TanStack Query provider
- Typed API client using fetch + Zod parsing
- Auth token storage and guard
- Tests: API client functions (mocked fetch), auth token logic

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md for context. Work in apps/web/.

Set up the React frontend foundation for Graphite:

1. Vite config: React plugin, "@/" path alias, proxy /api to localhost:3000.

2. main.tsx: StrictMode, QueryClientProvider, BrowserRouter.

3. app.tsx: routes "/" → MainLayout (guarded), "/auth" → AuthPage. AuthGuard checks localStorage token.

4. lib/api-client.ts: typed methods for notes.list(), notes.get(id), notes.create(data), notes.update(id, data), notes.remove(id), notes.search(query). Each attaches Bearer token, parses with Zod. Helpers: getAuthToken(), setAuthToken(), clearAuthToken().

5. hooks/use-notes.ts: TanStack Query hooks — useNotes(), useNote(id), useCreateNote(), useUpdateNote(), useDeleteNote(), useSearchNotes(query).

6. pages/auth-page.tsx: token input form, validates by calling API, redirects on success.

7. layouts/main-layout.tsx: empty shell with "Graphite" heading.

8. Tests: api-client methods, hooks with mocked api-client.

Run `just test` and ensure all tests pass.
```

---

### Task 3.2 — Sidebar and note list

**Description**: Build the sidebar component with note listing, search, and new note creation.

**Depends on**: Task 3.1

**Deliverables**:
- Sidebar component with note list, search, new note button
- Debounce hook, date formatting utility
- Tests: sidebar rendering, search, note selection, date formatting

**Prompt for Claude Code**:
```
Read CLAUDE.md (Design Aesthetic section) and PRD.md (sections 2.1, 2.3) for context. Work in apps/web/.

Build the sidebar: sidebar.tsx (240px fixed, header with "Graphite" + new note button, search input, scrollable note list), note-list-item.tsx (title, preview, relative timestamp, pin icon, active highlight, delete on right-click), search-input.tsx (debounced, clear button, Escape), use-debounce.ts hook, format-date.ts utility. Update main-layout.tsx with sidebar + main content area. CSS Modules with dark aesthetic.

Tests: sidebar states, note item rendering, search debounce, format-date ranges.

Run `just test` and ensure all tests pass.
```

---

### Task 3.3 — TipTap rich-text editor integration

**Description**: Integrate the TipTap editor with all required formatting extensions (text formatting, headings, lists, code blocks, links, horizontal rules) and connect it to the note data with autosave.

**Depends on**: Task 3.1

**Deliverables**:
- TipTap editor component with all extensions (FR-10 through FR-18)
- Floating toolbar and fixed toolbar
- Autosave with debounce and status indicator
- Tests: editor rendering, toolbar interactions, autosave trigger

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md (section 2.2) for context. Work in apps/web/.

Integrate the TipTap rich-text editor for Graphite:

1. Install TipTap packages: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/extension-link, @tiptap/extension-underline, @tiptap/extension-task-list, @tiptap/extension-task-item, @tiptap/extension-code-block-lowlight, @tiptap/extension-horizontal-rule. Install lowlight for syntax highlighting.

   NOTE: Do NOT install @tiptap/extension-image — image uploads are out of scope for v1.

2. editor/extensions.ts: configure StarterKit (heading 1-3, bold, italic, strikethrough, lists, blockquote, codeBlock disabled), Underline, Link (autolink, openOnClick, linkOnPaste), TaskList+TaskItem, CodeBlockLowlight (js, ts, python, bash, json, html, css), HorizontalRule, Placeholder.

3. editor/note-editor.tsx: title input + TipTap editor. Autosave on debounce (AUTOSAVE_DEBOUNCE_MS). Save status indicator ("Saving...", "Saved", "Error — retry"). Empty state when no note.

4. editor/floating-toolbar.tsx: BubbleMenu with Bold, Italic, Underline, Strikethrough, Code, Link, Heading dropdown, List buttons, Blockquote.

5. editor/editor-toolbar.tsx: fixed toolbar with same formatting plus Code block, Horizontal rule.

6. Update main-layout.tsx: render NoteEditor with selected note data.

7. Tests: editor empty/loaded states, autosave triggers, toolbar buttons present and active states.

Run `just test` and ensure all tests pass.
```

---

## Epic 4: UI Polish & Dark Aesthetic

**Goal**: Apply the Obsidian-inspired dark theme and polish the UI to a production-quality standard.

**Estimated effort**: 3 days

---

### Task 4.1 — Design system and CSS foundation

**Description**: Create CSS custom properties, global styles, and theme toggle.

**Depends on**: Task 3.2

**Prompt for Claude Code**:
```
Read CLAUDE.md (Design Aesthetic section) for exact color values. Work in apps/web/.

Create the design system: tokens.css (dark + light theme custom properties per CLAUDE.md), global.css (reset, typography, scrollbars, selection, focus-visible), use-theme.ts hook (localStorage, data-theme attribute), theme-toggle.tsx (sun/moon icons). Import global.css in main.tsx.

Tests: theme defaults to dark, persists, toggles correctly.

Run `just test` and ensure all tests pass.
```

---

### Task 4.2 — Sidebar styling

**Description**: Apply the dark theme to the sidebar.

**Depends on**: Task 4.1, Task 3.2

**Prompt for Claude Code**:
```
Read CLAUDE.md (Design Aesthetic section). Work in apps/web/.

Style the sidebar: fixed left panel, search input with focus ring, note list items with hover/active/pinned states, responsive collapse on mobile (hamburger, slide-over, useSidebar hook).

Tests: responsive behavior, active item CSS class.

Run `just test` and ensure all tests pass.
```

---

### Task 4.3 — Editor styling and typography

**Description**: Style the TipTap editor and content elements.

**Depends on**: Task 4.1, Task 3.3

**Prompt for Claude Code**:
```
Read CLAUDE.md (Design Aesthetic section). Work in apps/web/.

Style the editor: editor.module.css (container, title input, save status), prose.css (headings, paragraphs, bold, italic, links, inline code, code blocks with syntax highlighting, blockquotes, lists, task lists, horizontal rule, placeholder), toolbar.module.css (fixed toolbar, floating BubbleMenu, button states, separators).

Tests: content renders with styles, toolbar active states, save status colors.

Run `just test` and ensure all tests pass.
```

---

### Task 4.4 — Keyboard shortcuts and command palette

**Description**: Add keyboard shortcuts and command palette.

**Depends on**: Task 3.3, Task 3.2

**Prompt for Claude Code**:
```
Read CLAUDE.md and PRD.md (FR-27). Work in apps/web/.

Add: use-keyboard-shortcuts.ts (Ctrl+N new note, Ctrl+P focus search, Ctrl+K toggle palette, Ctrl+S force save, Ctrl+Backspace delete), command-palette.tsx (modal overlay, search/filter, keyboard nav, commands: New note, Search, Toggle theme, Delete note).

Tests: shortcuts trigger actions, palette opens/closes/filters/navigates.

Run `just test` and ensure all tests pass.
```

---

## Epic 5: Infrastructure & Deployment

**Goal**: Provision all Scaleway resources with Pulumi following security best practices and establish the deployment pipeline.

**Estimated effort**: 2 days

---

### Task 5.1 — Pulumi stack for Scaleway (VPC, secrets, Cockpit)

**Description**: Create the Pulumi infrastructure-as-code following Scaleway best practices: VPC with Private Network, secret env vars, sandbox v2, HTTPS-only, Cockpit, custom domain.

**Depends on**: Task 1.4

**Prompt for Claude Code**:
```
Read CLAUDE.md (Pulumi / Infrastructure section) and PRD.md (section 7) for full context. Work in infra/.

Create the Pulumi stack with these resources:

a. VPC ("graphite-vpc") + Private Network ("graphite-pn") with DHCP.
b. Container Registry ("graphite-registry") — private, Scaleway's own (not Docker Hub).
c. Managed Database ("graphite-db") — PostgreSQL 16, DB-DEV-S, attached to Private Network ONLY, NO public endpoint. DATABASE_URL uses private hostname.
d. Serverless Container ("graphite-app") — sandbox v2, HTTPS-only, attached to Private Network. Non-sensitive vars in environmentVariables (CORS_ORIGIN, PORT). Sensitive vars in secretEnvironmentVariables (DATABASE_URL, AUTH_TOKEN).
e. Container Domain — scaleway.containers.Domain for the custom hostname.
f. Cockpit — enable for the project, document alert setup.

Create infra/CLOUDFLARE_SETUP.md with the step-by-step CNAME guide.
Create infra/scripts/deploy.sh (build → push to Scaleway registry → pulumi up).

Tests: verify resource count, RDB has no public endpoint, container sandbox is v2, secrets are in secretEnvironmentVariables, container is on Private Network, registry is private.
```

---

### Task 5.2 — Health checks and observability

**Description**: Enhanced health endpoint, structured JSON logging for Cockpit, request logging.

**Depends on**: Task 2.1, Task 5.1

**Prompt for Claude Code**:
```
Read CLAUDE.md. Work in apps/api/.

1. health.ts: check DB (SELECT 1 over Private Network) with 5s timeout. Return { status: "ok" | "error", timestamp, checks: { database } }.
2. logger.ts: structured JSON to stdout (Cockpit ingests this). Redact sensitive values. Human-readable in dev.
3. request-logger.ts: Hono middleware logging method, path, status, duration. Skip /health.

Tests: health states, JSON log format, sensitive value redaction, request logging.

Run `just test` and ensure all tests pass.
```

---

### Task 5.3 — CI pipeline configuration

**Description**: GitHub Actions for CI and deployment.

**Depends on**: All previous tasks

**Prompt for Claude Code**:
```
Read CLAUDE.md. Work in project root.

1. .github/workflows/ci.yml: push/PR to main → checkout → setup Bun → install → just check → just typecheck → just test → just build → just docker-build.
2. .github/workflows/deploy.yml: workflow_dispatch → build → push to private Scaleway registry → pulumi up.
3. Ensure all turbo pipelines used in CI exist in turbo.json.

Tests: validate CI YAML syntax, verify referenced pipelines exist.

Run `just test` and ensure all tests pass.
```

---

## Summary

| Epic | Tasks | Estimated Effort |
| ---- | ----- | ---------------- |
| 1. Foundation & Monorepo | 4 tasks (1.1–1.4) | 1.5 days |
| 2. API Server | 2 tasks (2.1–2.2) | 2 days |
| 3. Frontend Core | 3 tasks (3.1–3.3) | 3.5 days |
| 4. UI Polish & Aesthetic | 4 tasks (4.1–4.4) | 3 days |
| 5. Infrastructure & Deploy | 3 tasks (5.1–5.3) | 2 days |
| **Total** | **16 tasks** | **~12 days** |

### Dependency Graph

```
1.1 ──→ 1.2 ──→ 1.3
 │        │       │
 │        ▼       ▼
 ├──→ 2.1 ──→ 2.2
 │
 ├──→ 3.1 ──→ 3.2 ──→ 4.2
 │    │       │
 │    │       3.3 ──→ 4.3
 │    │         │
 │    │         4.4
 │    ▼
 │    4.1
 │
 ├──→ 1.4 ──→ 5.1 ──→ 5.2
 │
 └──→ 5.3 (after all others)
```

### How to Use

1. Start with Epic 1 tasks sequentially.
2. After Task 1.1, Epics 2, 3, and the Docker task (1.4) can be parallelized.
3. Epic 4 depends on both Epic 3 components and Epic 4.1 (design tokens).
4. Epic 5 can mostly be done in parallel with Epics 3–4.
5. Task 5.3 (CI) should be last, as it validates everything.

For each task, copy the **Prompt for Claude Code** block and provide it to Claude Code. Ensure CLAUDE.md and PRD.md are in the project root so Claude Code can reference them.

### Scaleway Best Practices Checklist

Before considering the project complete, verify:

- [ ] Database has NO public endpoint — only reachable via Private Network
- [ ] Container and Database are on the same Private Network
- [ ] All sensitive env vars use `secretEnvironmentVariables` (not plain `environmentVariables`)
- [ ] Container sandbox is explicitly set to v2
- [ ] Container has HTTPS-only redirect enabled
- [ ] Container Registry is private (not Docker Hub)
- [ ] Cloudflare CNAME is proxied (orange cloud) with Full (strict) SSL
- [ ] Scaleway Cockpit is enabled, logs are structured JSON
- [ ] Custom domain is managed via Pulumi `scaleway.containers.Domain`
- [ ] `just infra-up` provisions the full stack with zero manual console steps (except Cloudflare CNAME)
- [ ] All operations runnable via `just` commands
