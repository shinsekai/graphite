# Graphite — Product Requirements Document

**Version**: 1.1
**Last updated**: March 2026
**Status**: Draft

---

## 1. Overview

### 1.1 Problem Statement

Existing note-taking applications (Notion, Obsidian Sync, Evernote) either store user data on third-party infrastructure, require trusting a SaaS provider, or lack rich-text editing capabilities. Privacy-conscious users who want full ownership of their data have limited options that don't sacrifice usability.

### 1.2 Solution

Graphite is a self-hosted, private note-taking application deployed entirely on the user's own infrastructure (Scaleway). It provides a modern rich-text editing experience with an Obsidian-inspired dark aesthetic, backed by a PostgreSQL database and S3-compatible object storage — all provisioned and managed through infrastructure-as-code, following Scaleway's security best practices (VPC isolation, encrypted secrets, observability).

### 1.3 Target User

A single technical user (developer, engineer, privacy-focused professional) who:

- Wants full control over where their notes are stored.
- Prefers a dark, distraction-free writing environment.
- Values simplicity over feature bloat.
- Has the ability to deploy and maintain a Docker container on cloud infrastructure.

### 1.4 Non-Goals (v1)

- Multi-user / collaboration features.
- Real-time sync across devices (single deployment, accessed via browser).
- Offline-first / PWA capabilities.
- Plugin system or extensibility framework.
- Markdown source editing mode (rich-text only in v1).
- Mobile-native apps (responsive web only).
- Wiki-style `[[links]]` and backlinks / graph view.
- End-to-end encryption (infrastructure is private; TLS in transit + VPC isolation is sufficient).

---

## 2. Functional Requirements

### 2.1 Notes Management (CRUD)

| ID    | Requirement                                                                                              | Priority |
| ----- | -------------------------------------------------------------------------------------------------------- | -------- |
| FR-01 | User can create a new note with a title and rich-text body.                                              | Must     |
| FR-02 | User can view a list of all notes in a sidebar, sorted by last modified date (newest first).             | Must     |
| FR-03 | User can open a note to view and edit it.                                                                | Must     |
| FR-04 | User can delete a note with a confirmation prompt.                                                       | Must     |
| FR-05 | User can search notes by title and content (full-text, case-insensitive).                                | Must     |
| FR-06 | Notes auto-save after a debounced delay (1.5 seconds after last keystroke). No manual save button.       | Must     |
| FR-07 | User sees a subtle save status indicator (saving / saved / error) near the editor.                       | Must     |
| FR-08 | Empty notes (no title, no content) are automatically discarded when navigating away.                     | Should   |
| FR-09 | User can pin notes to the top of the sidebar list.                                                       | Could    |

### 2.2 Rich-Text Editing

| ID    | Requirement                                                                                              | Priority |
| ----- | -------------------------------------------------------------------------------------------------------- | -------- |
| FR-10 | Editor supports bold, italic, underline, and strikethrough text formatting.                              | Must     |
| FR-11 | Editor supports headings (H1, H2, H3).                                                                  | Must     |
| FR-12 | Editor supports bullet lists, numbered lists, and task lists (checkboxes).                               | Must     |
| FR-13 | Editor supports inline code and fenced code blocks with syntax highlighting.                             | Must     |
| FR-14 | Editor supports blockquotes.                                                                             | Must     |
| FR-15 | Editor supports hyperlinks (insert, edit, remove, click to open).                                        | Must     |
| FR-16 | Editor supports inline images (upload via drag-and-drop, paste from clipboard, or file picker).          | Must     |
| FR-17 | Editor supports horizontal rules / dividers.                                                             | Must     |
| FR-18 | Editor supports undo/redo (Ctrl+Z / Ctrl+Shift+Z).                                                      | Must     |
| FR-19 | Formatting is accessible via a floating toolbar (appears on text selection) and keyboard shortcuts.       | Must     |
| FR-20 | Editor supports tables (insert, add/remove rows and columns, basic cell editing).                        | Could    |

### 2.3 Image Handling

| ID    | Requirement                                                                                              | Priority |
| ----- | -------------------------------------------------------------------------------------------------------- | -------- |
| FR-21 | Uploaded images are stored in Scaleway Object Storage (S3-compatible, private bucket).                   | Must     |
| FR-22 | Images are client-side compressed/resized before upload (max 2048px on longest edge, JPEG quality 85%).  | Should   |
| FR-23 | Upload progress is shown in the editor while an image is being uploaded.                                 | Should   |
| FR-24 | Images are served through the API (proxied or via time-limited signed URLs). Never expose bucket directly.| Must     |
| FR-25 | Orphaned images (not referenced by any note) are cleaned up periodically.                                | Could    |

### 2.4 User Interface

| ID    | Requirement                                                                                              | Priority |
| ----- | -------------------------------------------------------------------------------------------------------- | -------- |
| FR-26 | Application has a fixed left sidebar showing the note list, and a main editor pane.                      | Must     |
| FR-27 | Sidebar displays note title, a content preview (first ~80 characters), and relative timestamp.           | Must     |
| FR-28 | Sidebar has a search input at the top that filters notes in real time.                                   | Must     |
| FR-29 | A "New note" button is prominently placed in the sidebar.                                                | Must     |
| FR-30 | Dark theme is the default. Follows the aesthetic defined in CLAUDE.md.                                   | Must     |
| FR-31 | Light theme is available as an alternative, toggled via a settings control.                               | Should   |
| FR-32 | UI is responsive: sidebar collapses to a hamburger menu on viewports < 768px.                            | Should   |
| FR-33 | Keyboard shortcut `Ctrl+K` opens a command palette for quick actions (new note, search, theme toggle).   | Could    |

### 2.5 Authentication

| ID    | Requirement                                                                                              | Priority |
| ----- | -------------------------------------------------------------------------------------------------------- | -------- |
| FR-34 | API endpoints are protected by a bearer token (shared secret configured via Scaleway secret env var).     | Must     |
| FR-35 | Frontend stores the token in memory (prompted on first visit, persisted in localStorage).                 | Must     |
| FR-36 | Unauthorized requests return 401 with a clear error message. Frontend redirects to a token entry screen.  | Must     |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID     | Requirement                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| NFR-01 | API CRUD responses < 100ms (p95) for a vault of up to 10,000 notes.                   |
| NFR-02 | Frontend initial load (TTI) < 2s on broadband, < 4s on 3G.                            |
| NFR-03 | Editor input latency < 16ms (no perceptible lag while typing).                         |
| NFR-04 | Search results return within 200ms for full-text queries over 10,000 notes.            |

### 3.2 Reliability

| ID     | Requirement                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| NFR-05 | Autosave never silently fails. Errors are shown to the user with a retry option.       |
| NFR-06 | Application handles API downtime gracefully (queues saves, shows status).               |
| NFR-07 | Database migrations are forward-only and non-destructive. No data loss on deploy.       |

### 3.3 Security

| ID     | Requirement                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| NFR-08 | All traffic encrypted via TLS. HTTPS enforced at both Cloudflare and Scaleway levels.  |
| NFR-09 | S3 bucket is private. No public access. Images served via API proxy or signed URLs.    |
| NFR-10 | No secrets in client-side code, logs, or error responses.                              |
| NFR-11 | Content-Security-Policy headers set to prevent XSS.                                    |
| NFR-12 | Database accessible only via Private Network. No public endpoint.                      |
| NFR-13 | Sensitive env vars use Scaleway's secret environment variables (encrypted at rest).     |
| NFR-14 | Serverless Container uses sandbox v2 for proper isolation and no clock drift.           |
| NFR-15 | Cloudflare proxy (orange cloud) provides WAF and DDoS protection at the edge.          |

### 3.4 Maintainability

| ID     | Requirement                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| NFR-16 | All code passes Biome linting with zero errors.                                        |
| NFR-17 | All packages have unit tests. Tests run in CI before every deploy.                     |
| NFR-18 | Infrastructure is fully reproducible via `pulumi up`.                                  |

### 3.5 Observability

| ID     | Requirement                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| NFR-19 | Scaleway Cockpit enabled for logs, metrics, and alerting.                              |
| NFR-20 | Alerts configured for: error rate > 5%, p95 latency > 1s, container restart loops.    |
| NFR-21 | Structured JSON logging in production for machine-parseable log analysis.              |
| NFR-22 | Health endpoint checks DB and S3 connectivity, reports degraded/error states.          |

---

## 4. Data Model

### 4.1 Notes Table

| Column       | Type                      | Constraints                          | Description                          |
| ------------ | ------------------------- | ------------------------------------ | ------------------------------------ |
| `id`         | `uuid`                    | PK, default `gen_random_uuid()`      | Unique note identifier               |
| `title`      | `varchar(500)`            | NOT NULL, default `''`               | Note title                           |
| `content`    | `jsonb`                   | NOT NULL, default `{}`               | TipTap document JSON                 |
| `plaintext`  | `text`                    | NOT NULL, default `''`               | Plain-text extraction for search     |
| `pinned`     | `boolean`                 | NOT NULL, default `false`            | Whether note is pinned to top        |
| `created_at` | `timestamp with timezone` | NOT NULL, default `now()`            | Creation timestamp                   |
| `updated_at` | `timestamp with timezone` | NOT NULL, default `now()`            | Last modification timestamp          |

**Indexes:**

- `idx_notes_updated_at` on `updated_at DESC` (sidebar ordering).
- `idx_notes_search` GIN index on `to_tsvector('english', plaintext || ' ' || title)` (full-text search).

### 4.2 Images Table

| Column       | Type                      | Constraints                          | Description                          |
| ------------ | ------------------------- | ------------------------------------ | ------------------------------------ |
| `id`         | `uuid`                    | PK, default `gen_random_uuid()`      | Unique image identifier              |
| `note_id`    | `uuid`                    | FK → notes.id, nullable              | Associated note (null = orphaned)    |
| `s3_key`     | `varchar(1024)`           | NOT NULL, UNIQUE                     | Object key in S3 bucket              |
| `filename`   | `varchar(255)`            | NOT NULL                             | Original filename                    |
| `mime_type`  | `varchar(100)`            | NOT NULL                             | MIME type (image/jpeg, image/png)    |
| `size_bytes` | `integer`                 | NOT NULL                             | File size in bytes                   |
| `created_at` | `timestamp with timezone` | NOT NULL, default `now()`            | Upload timestamp                     |

---

## 5. API Specification

### 5.1 Notes Endpoints

| Method   | Path              | Description              | Request Body                      | Response                  |
| -------- | ----------------- | ------------------------ | --------------------------------- | ------------------------- |
| `GET`    | `/api/notes`      | List all notes           | —                                 | `{ data: NoteSummary[] }` |
| `GET`    | `/api/notes/:id`  | Get full note            | —                                 | `{ data: Note }`          |
| `POST`   | `/api/notes`      | Create note              | `{ title?, content? }`            | `{ data: Note }` (201)    |
| `PUT`    | `/api/notes/:id`  | Update note              | `{ title?, content?, pinned? }`   | `{ data: Note }`          |
| `DELETE` | `/api/notes/:id`  | Delete note              | —                                 | `{ data: { id } }`        |
| `GET`    | `/api/notes/search` | Search notes           | `?q=query`                        | `{ data: NoteSummary[] }` |

**`NoteSummary`**: `{ id, title, preview, pinned, updatedAt }` (preview = first 80 chars of plaintext).

### 5.2 Upload Endpoint

| Method | Path            | Description    | Request Body        | Response                              |
| ------ | --------------- | -------------- | ------------------- | ------------------------------------- |
| `POST` | `/api/uploads`  | Upload image   | `multipart/form-data` (file field) | `{ data: { id, url } }` (201) |
| `GET`  | `/api/uploads/:id` | Get image   | —                   | Image binary (proxied from S3)        |

### 5.3 System Endpoints

| Method | Path         | Description          | Response                                                                           |
| ------ | ------------ | -------------------- | ---------------------------------------------------------------------------------- |
| `GET`  | `/health`    | Health check (no auth) | `{ status: "ok" | "degraded" | "error", timestamp, checks: { database, storage } }` |

---

## 6. User Flows

### 6.1 First Visit

1. User opens Graphite URL in browser (`https://graphite.example.com`).
2. Request flows through Cloudflare (WAF, DDoS protection) → Scaleway Serverless Container.
3. Frontend detects no stored token → shows a minimal token entry screen ("Enter your access token").
4. User enters the bearer token (configured in their deployment via Scaleway secret env var).
5. Token is validated against the API (`GET /health` with auth header).
6. On success, token is stored in `localStorage`, user sees the main app.
7. On failure, error message is shown, user can retry.

### 6.2 Creating and Editing a Note

1. User clicks "New note" in the sidebar.
2. A new untitled note is created (optimistically added to sidebar).
3. Cursor is placed in the title field.
4. User types title, presses Enter or clicks into the body.
5. User writes content using the rich-text editor.
6. After 1.5s of inactivity, content is auto-saved. Status indicator shows "Saving..." then "Saved".
7. If save fails, status shows "Error saving" with a retry button.

### 6.3 Searching Notes

1. User clicks the search input in the sidebar (or presses `Ctrl+P`).
2. User types a query.
3. After 300ms debounce, results are fetched from `GET /api/notes/search?q=...`.
4. Sidebar updates to show matching notes, highlighted.
5. Clearing the search restores the default sorted list.

### 6.4 Inserting an Image

1. User drags an image onto the editor (or pastes from clipboard, or uses the toolbar button).
2. A placeholder with a progress bar appears inline in the editor.
3. Image is compressed client-side, then uploaded via `POST /api/uploads`.
4. API stores the image in the private S3 bucket and records metadata in the database.
5. On success, the placeholder is replaced with the rendered image (src = `/api/uploads/:id`).
6. On failure, the placeholder shows an error with a retry option.

---

## 7. Infrastructure

### 7.1 Target Platform

All infrastructure runs on Scaleway (Paris region, `fr-par`), following Scaleway's documented security best practices:

- **Network**: Scaleway VPC with a dedicated Private Network. All backend resources (database, container) communicate over the Private Network, isolated from the public internet.
- **Compute**: Scaleway Serverless Container (sandbox v2, auto-scaling 0-3 instances). The only resource with a public-facing endpoint.
- **Database**: Scaleway Managed Database for PostgreSQL 16 (DB-DEV-S plan). Attached to Private Network only — public endpoint disabled.
- **Storage**: Scaleway Object Storage bucket (S3-compatible API, private ACL, CORS configured for the app domain).
- **Registry**: Scaleway Container Registry (private). Preferred over Docker Hub to avoid rate limiting.
- **Secrets**: Sensitive environment variables use Scaleway's secret environment variables (encrypted at rest, not visible in console after creation).
- **Observability**: Scaleway Cockpit (managed Grafana) for logs, metrics, and alerting.
- **DNS**: Cloudflare CNAME (proxied) pointing to the container's default URL. Provides WAF, DDoS protection, and edge caching.
- **TLS**: Dual enforcement — Scaleway auto-generates a Let's Encrypt certificate for the custom domain; Cloudflare terminates TLS at the edge with "Full (strict)" SSL mode.
- **Custom domain**: Managed via `scaleway.containers.Domain` Pulumi resource, bound to `graphite.example.com`.

### 7.2 Network Topology

```
User (Browser)
    │
    ▼ HTTPS
Cloudflare (proxied CNAME)
  - WAF, DDoS protection
  - Edge caching for static assets
  - SSL/TLS: Full (strict)
    │
    ▼ HTTPS
Scaleway Serverless Container (public endpoint, sandbox v2)
  - Hono API + Static SPA
  - HTTPS-only redirect enforced
  - Auth middleware (Bearer token)
    │
    ├──▶ Private Network ──▶ Managed PostgreSQL 16
    │         (no public endpoint, DHCP-managed IP)
    │
    └──▶ S3 API ──▶ Object Storage (private bucket)
```

### 7.3 Provisioning

All resources are defined in Pulumi (TypeScript) and can be created/destroyed with a single command. No manual setup in the Scaleway console except the initial Cloudflare CNAME record.

### 7.4 Deployment Flow

1. Build Docker image locally or in CI.
2. Push to Scaleway Container Registry (private).
3. Run `pulumi up` to deploy the new image.
4. Pulumi updates the Serverless Container to use the new image tag.
5. Scaleway handles rolling deployment with zero downtime.

### 7.5 Cloudflare CNAME Setup (one-time, manual)

1. In Cloudflare DNS, add a CNAME record: `graphite` → `{container-default-url}.functions.fnc.fr-par.scw.cloud`.
2. Initially set proxy status to **DNS only** (gray cloud) so Scaleway can complete the Let's Encrypt HTTP-01 challenge.
3. Run `pulumi up` — this creates the `scaleway.containers.Domain` resource.
4. Wait for the domain status to become `ready` in Scaleway console.
5. In Cloudflare, switch the CNAME to **Proxied** (orange cloud).
6. Set SSL/TLS mode to **Full (strict)**.
7. Enable "Always Use HTTPS" under SSL/TLS → Edge Certificates.

---

## 8. Success Metrics

| Metric                        | Target         |
| ----------------------------- | -------------- |
| Notes CRUD latency (p95)      | < 100ms        |
| Time to interactive           | < 2s           |
| Autosave reliability          | 99.9% success  |
| Monthly infra cost            | < €15          |
| Deployment time (push to live)| < 5 minutes    |
| Security posture              | No public DB endpoint, no public bucket, secrets encrypted |
