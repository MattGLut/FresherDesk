# FresherDesk REST API

JSON API for listing, retrieving, updating, and creating child helpdesk tickets. All endpoints require a valid API key.

**Agents** use the [agent workspace UI](README.md#agent-workspace) for day-to-day ticket handling. This API is for **integrations** (scripts, external apps, automation). Changes made via PATCH or child create appear in the workspace the same as UI edits.

![Ticket detail — fields agents see in the workspace](./docs/images/ticket-detail-header.png)

**Base URL:** `https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets`

Examples use the dev instance `dev385836.service-now.com` (no trailing slash on URLs) and the dev API key `fd_live_dev_test_abc123xyz` (hash must exist in **FresherDesk API Key** on that instance — see [README.md — API key provisioning](README.md#api-key-provisioning)).

The API ID (`tickets`) is part of the path. Resource URLs:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tickets/tickets` | List tickets with optional filters and pagination |
| `GET` | `/tickets/tickets/{id}` | Get a single ticket by number or sys_id |
| `PATCH` | `/tickets/tickets/{id}` | Update ticket status, subject, description, or tags |
| `POST` | `/tickets/tickets/{id}/create_child` | Create a child ticket under a parent |

**Content type:** `application/json`

Example requests below use **Windows Command Prompt** (`cmd.exe`) and **`curl.exe --ssl-no-revoke`** (required on many Windows setups for ServiceNow HTTPS). JSON bodies use double quotes with inner quotes escaped as `\"` (do not use single-quoted `'...'` — that is Bash syntax, not cmd). To continue a command on the next line, end the line with `^`.

Successful responses are wrapped by ServiceNow as `{"result":{...}}` (e.g. `result.tickets`, `result.ticket`, `result.error`).

---

## Authentication

Every request must include an API key in the `X-API-Key` header.

```http
X-API-Key: fd_live_dev_test_abc123xyz
```

Keys are stored as SHA-256 hashes in the `x_2058901_fresher_api_key` table. Only users with the `x_2058901_fresher.admin` role can create key records. See [README.md — API key provisioning](README.md#api-key-provisioning) for setup steps.

On each successful request, the matching key record's `last_used` timestamp is updated.

### Unauthorized (401)

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Valid X-API-Key header is required"
  }
}
```

---

## List tickets

```http
GET /api/x_2058901_fresher/v1/tickets/tickets
```

Returns a paginated list of ticket summaries. `comments` and `attachments` are always present but **always empty arrays** on list responses (no thread or file metadata is loaded). Only **top-level** tickets are returned (child tickets are excluded via `parentISEMPTY`); use [Get ticket](#get-ticket) on a parent to see its `children` array, or GET the child by number/sys_id directly.

### Query parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter by status: `open`, `pending`, `resolved`, `closed` |
| `priority` | string | — | Filter by priority: `critical`, `high`, `medium`, `low` |
| `assignee` | string | — | Assignee user sys_id, or `unassigned` for tickets with no assignee |
| `tag` | string | — | Filter tickets whose stored JSON tag field contains this substring (e.g. `tag=billing` matches `billing` in `["billing","urgent"]`). Use distinctive tag names; short values can match unintended substrings inside the JSON. |
| `updated_since` | string | — | Glide/datetime string compared to `sys_updated_on` (e.g. `2026-06-01 00:00:00` in the instance timezone). Invalid values may yield empty results rather than an error. |
| `limit` | integer | `50` | Page size (minimum 1, maximum 200). Values below 1 or above 200 are clamped. |
| `offset` | integer | `0` | Number of records to skip. Negative values are treated as `0`. |

Invalid or unrecognized `status` / `priority` values are silently ignored (no filter applied for that parameter).

Results are ordered by most recently updated first.

### Example request

```cmd
curl.exe --ssl-no-revoke -s -H "X-API-Key: fd_live_dev_test_abc123xyz" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets?status=open&priority=high&tag=billing&limit=25&offset=0"
```

### Example response (200)

```json
{
  "tickets": [
    {
      "id": "a1b2c3d4e5f6789012345678901234ab",
      "number": "TKT0001001",
      "subject": "Cannot reset password",
      "description": "User reports login issues after password reset.",
      "status": "open",
      "priority": "high",
      "category": "technical",
      "source": "email",
      "tags": ["billing", "urgent"],
      "requester": {
        "id": "c1d2e3f4a5b6789012345678901234cd",
        "name": "Jane Customer",
        "email": "customer@example.com",
        "username": "jane.customer"
      },
      "assignee": {
        "id": "e1f2a3b4c5d6789012345678901234ef",
        "name": "Support Agent",
        "email": "agent@example.com",
        "username": "support.agent",
        "roles": ["x_2058901_fresher.agent"]
      },
      "opened_at": "2026-06-01 09:15:00",
      "updated_at": "2026-06-02 14:30:00",
      "parent_id": null,
      "children": [],
      "comments": [],
      "attachments": []
    }
  ],
  "meta": {
    "total": 42,
    "limit": 25,
    "offset": 0
  }
}
```

---

## Get ticket

```http
GET /api/x_2058901_fresher/v1/tickets/tickets/{id}
```

Returns a single ticket with its full conversation thread, attachments, and direct child ticket summaries.

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Ticket number (e.g. `TKT0001001`, case-insensitive) or ticket sys_id |

Numbers are detected by the `TKT` prefix (case-insensitive). All other path values are treated as ticket sys_id lookups.

### Example requests

By ticket number:

```cmd
curl.exe --ssl-no-revoke -s -H "X-API-Key: fd_live_dev_test_abc123xyz" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
```

By sys_id:

```cmd
curl.exe --ssl-no-revoke -s -H "X-API-Key: fd_live_dev_test_abc123xyz" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/a1b2c3d4e5f6789012345678901234ab"
```

### Example response (200)

```json
{
  "ticket": {
    "id": "a1b2c3d4e5f6789012345678901234ab",
    "number": "TKT0001001",
    "subject": "Cannot reset password",
    "description": "User reports login issues after password reset.",
    "status": "open",
    "priority": "high",
    "category": "technical",
    "source": "email",
    "tags": ["billing", "urgent"],
    "requester": {
      "id": "c1d2e3f4a5b6789012345678901234cd",
      "name": "Jane Customer",
      "email": "customer@example.com",
      "username": "jane.customer"
    },
    "assignee": {
      "id": "e1f2a3b4c5d6789012345678901234ef",
      "name": "Support Agent",
      "email": "agent@example.com",
      "username": "support.agent",
      "roles": ["x_2058901_fresher.agent"]
    },
    "opened_at": "2026-06-01 09:15:00",
    "updated_at": "2026-06-02 14:30:00",
    "parent_id": null,
    "children": [
      {
        "id": "d2e3f4a5b6c7890123456789012345de",
        "number": "TKT0001002",
        "subject": "Follow-up on password reset",
        "status": "open",
        "priority": "medium",
        "updated_at": "2026-06-02 16:00:00"
      }
    ],
    "comments": [
      {
        "id": "f1a2b3c4d5e6789012345678901234fa",
        "type": "public_reply",
        "body": "User reports login issues after password reset.",
        "author": {
          "id": "c1d2e3f4a5b6789012345678901234cd",
          "name": "Jane Customer",
          "email": "customer@example.com",
          "username": "jane.customer"
        },
        "source": "email",
        "created_at": "2026-06-01 09:15:00"
      }
    ],
    "attachments": [
      {
        "id": "c1d2e3f4a5b6789012345678901234aa",
        "file_name": "screenshot.png",
        "size_bytes": 204800,
        "content_type": "image/png",
        "created_at": "2026-06-01 09:16:00",
        "sys_attachment_id": "b1c2d3e4f5a6789012345678901234bc",
        "download_url": "https://{account}.blob.core.windows.net/ticket-attachments/{path}?sv=...",
        "download_url_expires_at": "2026-06-01 09:31:00"
      }
    ]
  }
}
```

### Not found (404)

```json
{
  "error": {
    "code": "not_found",
    "message": "Ticket not found"
  }
}
```

---

## Create child ticket

```http
POST /api/x_2058901_fresher/v1/tickets/tickets/{id}/create_child
```

Creates a child ticket linked to the parent ticket identified in the path. The child inherits `requester_email` and `opened_by` from the parent, sets `source` to `api`, and does **not** copy parent tags. Returns **201** with the created ticket (`parent_id` set, `children: []`). There is no REST endpoint to create a top-level ticket in v1.

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Parent ticket number (e.g. `TKT0001001`, case-insensitive) or parent sys_id |

### Request body

Send a JSON object with `Content-Type: application/json`. Malformed JSON or an empty body returns **400** with `subject is required`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Child ticket title (max 160 characters) |
| `description` | string | No | Full ticket body |
| `status` | string | No | `open`, `pending`, `resolved`, or `closed` (default: `open`) |
| `priority` | string | No | `critical`, `high`, `medium`, or `low` (default: `medium` when omitted) |
| `category` | string | No | `general`, `billing`, `technical`, or `account` (default: `general`). Other values return **400**. |

### Example request

```cmd
curl.exe --ssl-no-revoke -s -X POST -H "X-API-Key: fd_live_dev_test_abc123xyz" -H "Content-Type: application/json" -d "{\"subject\":\"Follow-up on password reset\",\"description\":\"Customer still cannot log in.\",\"priority\":\"medium\"}" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001/create_child"
```

Multi-line (cmd line continuation):

```cmd
curl.exe --ssl-no-revoke -s -X POST ^
  -H "X-API-Key: fd_live_dev_test_abc123xyz" ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\":\"Follow-up on password reset\",\"description\":\"Customer still cannot log in.\",\"priority\":\"medium\"}" ^
  "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001/create_child"
```

### Example response (201)

Same structure as [Get ticket](#get-ticket). The child ticket includes `parent_id` pointing at the parent sys_id and `children: []`.

```json
{
  "ticket": {
    "id": "d2e3f4a5b6c7890123456789012345de",
    "number": "TKT0001002",
    "subject": "Follow-up on password reset",
    "parent_id": "a1b2c3d4e5f6789012345678901234ab",
    "children": []
  }
}
```

### Bad request (400)

```json
{
  "error": {
    "code": "bad_request",
    "message": "subject is required"
  }
}
```

---

## Update ticket

```http
PATCH /api/x_2058901_fresher/v1/tickets/tickets/{id}
```

Updates one or more ticket fields. Returns the updated ticket (same shape as [Get ticket](#get-ticket)).

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Ticket number (e.g. `TKT0001001`, case-insensitive) or ticket sys_id |

### Request body

Send a JSON object with `Content-Type: application/json` and any combination of the fields below. At least one recognized field key must be present (values may match the current record — see [No-op updates](#no-op-updates)).

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `open`, `pending`, `resolved`, or `closed` |
| `subject` | string | Ticket title (maps to `short_description`, max 160 characters) |
| `title` | string | Alias for `subject` |
| `description` | string | Full ticket body |
| `tags` | string[] | Replaces the full tag list (e.g. `["billing", "urgent"]`). Send `[]` to clear all tags. Duplicates are removed; order is not preserved. |

Malformed JSON or an empty body is treated as no fields and returns **400** with `Provide at least one updatable field: …`.

### Side effects

- Triggers the ticket delta audit business rule, which writes **audit_delta** comments for each changed field. These are excluded from REST `comments` and from the main Conversation tab in the agent workspace; users with the **admin** role can view them in the workspace **Audit Deltas** tab. Query `x_2058901_fresher_ticket_comment` with `comment_type=audit_delta` for forensics.
- Setting `status` to `resolved` or `closed` may set `close_notes` to `Updated in FresherDesk` when that field was empty (platform task behavior).

### No-op updates

If every supplied field already matches the stored value, the handler skips the database update and returns **200** with the current ticket (no audit deltas).

### Example requests

Full update:

```cmd
curl.exe --ssl-no-revoke -s -X PATCH -H "X-API-Key: fd_live_dev_test_abc123xyz" -H "Content-Type: application/json" -d "{\"status\":\"pending\",\"subject\":\"Password reset still failing\",\"tags\":[\"billing\",\"urgent\"]}" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
```

Tags only (replaces entire tag list):

```cmd
curl.exe --ssl-no-revoke -s -X PATCH -H "X-API-Key: fd_live_dev_test_abc123xyz" -H "Content-Type: application/json" -d "{\"tags\":[\"billing\"]}" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
```

Clear all tags:

```cmd
curl.exe --ssl-no-revoke -s -X PATCH -H "X-API-Key: fd_live_dev_test_abc123xyz" -H "Content-Type: application/json" -d "{\"tags\":[]}" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
```

Multi-line (cmd line continuation):

```cmd
curl.exe --ssl-no-revoke -s -X PATCH ^
  -H "X-API-Key: fd_live_dev_test_abc123xyz" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"pending\",\"subject\":\"Password reset still failing\",\"tags\":[\"billing\",\"urgent\"]}" ^
  "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
```

### Example response (200)

Same structure as the [Get ticket](#get-ticket) response, including the updated ticket fields. Audit delta comments are not included in `comments`.

### Bad request (400)

```json
{
  "error": {
    "code": "bad_request",
    "message": "Provide at least one updatable field: status, subject, description, tags"
  }
}
```

---

## Data model

### Ticket object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Ticket sys_id |
| `number` | string | Auto-numbered ticket ID (prefix `TKT`) |
| `subject` | string | Short description (max 160 characters) |
| `description` | string | Full ticket body |
| `status` | string | `open`, `pending`, `resolved`, or `closed` |
| `priority` | string | `critical`, `high`, `medium`, or `low` |
| `category` | string | `general`, `billing`, `technical`, or `account` |
| `source` | string | How the ticket was created: `email`, `form`, or `api` (email tickets: see [docs/EMAIL.md](docs/EMAIL.md)) |
| `tags` | string[] | Labels applied to the ticket (e.g. `["billing", "urgent"]`) |
| `requester` | object | `{ id, name, email, username }` — `id` may be `null` when `opened_by` is empty; `email` falls back to ticket `requester_email` |
| `assignee` | object \| null | `{ id, name, email, username, roles }` or `null` if unassigned — `roles` lists ServiceNow role names |
| `opened_at` | string | Instance display datetime |
| `updated_at` | string | Instance display datetime |
| `parent_id` | string \| null | Parent ticket sys_id, or `null` for top-level tickets |
| `children` | array | Direct child ticket summaries (populated on single-ticket GET and create_child; always `[]` in list responses). Ordered by most recently updated first. |
| `comments` | array | Conversation thread (empty in list responses) |
| `attachments` | array | File metadata (empty in list responses) |

### Child ticket summary (in `children`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Child ticket sys_id |
| `number` | string | Child ticket number |
| `subject` | string | Short description |
| `status` | string | `open`, `pending`, `resolved`, or `closed` |
| `priority` | string | `critical`, `high`, `medium`, or `low` |
| `updated_at` | string | Instance display datetime |

### Comment object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Comment sys_id |
| `type` | string | `public_reply`, `internal_note`, or `audit_delta` (audit deltas are excluded from API responses) |
| `body` | string | Comment text |
| `author` | object \| null | `{ id, name, email, username }` |
| `source` | string | `agent`, `email`, `system`, or `api` |
| `created_at` | string | Instance display datetime |

Comments are ordered oldest-first.

### Attachment object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Attachment identifier — see [Attachment modes](#attachment-modes) below |
| `file_name` | string | Original filename |
| `size_bytes` | integer | File size in bytes |
| `content_type` | string | MIME type |
| `created_at` | string | Instance display datetime |
| `sys_attachment_id` | string | Linked ServiceNow `sys_attachment` sys_id |
| `download_url` | string | Time-limited Azure read SAS URL (Azure-synced mode only) |
| `download_url_expires_at` | string | When `download_url` expires (**UTC**, unlike other datetime fields) |

Files are stored in **`sys_attachment`** for the agent UI. After insert, a business rule copies bytes to Azure Blob and creates a metadata row. **Any REST response that includes the full ticket object** (GET, PATCH, create_child) generates a fresh read SAS per synced attachment (`download_url`, `download_url_expires_at`). When a URL expires, call GET ticket again.

The first GET (or PATCH/create_child that returns attachments) on a ticket with legacy `sys_attachment` rows may upload files that lack metadata — see [docs/AZURE.md](docs/AZURE.md) (GET backfill).

Setup: [docs/AZURE.md](docs/AZURE.md).

#### Attachment modes

| Mode | When | `id` | `download_url` |
|------|------|------|----------------|
| **Azure-synced** | Azure configured and metadata row exists | Metadata table sys_id (`x_2058901_fresher_ticket_attachment`) | Present |
| **Fallback** | Azure disabled, or no metadata rows yet for any file on the ticket | Same as `sys_attachment_id` | Omitted |

When Azure is configured and **some** files on a ticket have synced but others failed, only successfully synced files appear in `attachments` (failed syncs are logged on the instance, not listed via fallback).

---

## Error responses

All errors return JSON with an `error` object containing `code` and `message`.

| HTTP status | Code | When |
|-------------|------|------|
| 401 | `unauthorized` | Missing, invalid, or inactive API key |
| 400 | `bad_request` | Invalid payload, missing required fields, or invalid field values (see messages below) |
| 404 | `not_found` | Ticket does not exist (`Ticket not found`) |
| 500 | `internal_error` | Unexpected server failure |

### Common `bad_request` messages

| Message | Endpoint | Cause |
|---------|----------|--------|
| `subject is required` | `POST …/create_child` | Missing/empty `subject` or unreadable JSON body |
| `subject must be 160 characters or fewer` | `POST …/create_child`, `PATCH` | Subject too long |
| `status must be one of: open, pending, resolved, closed` | `POST …/create_child`, `PATCH` | Invalid or empty `status` |
| `priority must be one of: critical, high, medium, low` | `POST …/create_child` | Invalid `priority` |
| `category must be one of: general, billing, technical, account` | `POST …/create_child` | Invalid `category` |
| `tags must be an array of strings` | `PATCH` | `tags` not a string array |
| `Provide at least one updatable field: status, subject, description, tags` | `PATCH` | Empty body, invalid JSON (parsed as empty), or no recognized keys |

### Internal error (500)

Messages vary by handler: `Failed to list tickets`, `Failed to retrieve ticket`, `Failed to update ticket`, `Failed to create child ticket`, `Failed to retrieve created ticket`, `Failed to retrieve updated ticket`.

```json
{
  "error": {
    "code": "internal_error",
    "message": "Failed to list tickets"
  }
}
```

---

## Manual test checklist

Use a real ticket number/sys_id from your instance after [deploy](README.md#local-development). Expect **401** if the header is missing or wrong.

| # | Command (from sections above) | Expected |
|---|------------------------------|----------|
| 1 | List with filters (`?status=open&…`) | **200**, `tickets` + `meta` |
| 2 | GET by `TKT…` number | **200**, `ticket` with comments/attachments when present |
| 3 | GET by sys_id | **200**, same shape |
| 4 | GET unknown id | **404** |
| 5 | `POST …/create_child` with subject | **201**, `parent_id` set, `source` `api` |
| 6 | `POST …/create_child` without subject | **400** `subject is required` |
| 7 | `PATCH` with status/subject/tags | **200**, fields updated |
| 8 | `PATCH` tags-only / `tags:[]` | **200**, tags replaced or cleared |
| 9 | `PATCH` with no recognized fields | **400** |
| 10 | `PATCH` with invalid `status` | **400** |

**cmd.exe pitfalls:** Use `curl.exe --ssl-no-revoke` and escaped double quotes (`\"`) in `-d` JSON. Without `--ssl-no-revoke`, curl often exits **35** with no output. Bash-style `-d '{"…"}'` often sends an empty body and triggers **400**/**500**. Prefer a JSON file: `curl.exe --ssl-no-revoke … -d @payload.json` when bodies are large.

---

## Limitations (v1)

- **No top-level ticket create** — only `POST …/create_child` under an existing parent
- **Partial write support** — `PATCH` updates `status`, `subject`/`title`, `description`, and `tags` only (full tag list replacement). Ignored if sent: `priority`, `category`, `assignee`, `parent`, `requester`, etc.
- **Child tickets** — list endpoint returns top-level tickets only; children via parent GET `children` (most recently updated first) or direct GET by child id
- **Attachments** — Azure-synced responses use metadata table `id` plus `sys_attachment_id`; fallback mode uses `sys_attachment` sys_id for both. See [Attachment modes](#attachment-modes). Partial sync: only successfully synced files appear when Azure is on.
- **No REST attachment upload** — files are uploaded via agent UI or email (`sys_attachment`); Azure sync is automatic
- **No comment creation** via REST — conversation replies use the agent workspace
- **Audit deltas** — `PATCH` changes emit `audit_delta` comments (excluded from REST `comments`; admins see them in the workspace Audit Deltas tab)
- ServiceNow platform authentication is disabled on these routes; access is controlled solely by API key validation

Implementation source: [`src/fluent/rest/tickets-api.now.ts`](src/fluent/rest/tickets-api.now.ts), [`src/server/rest/`](src/server/rest/).

## Related

- [README.md — Agent workspace](README.md#agent-workspace) — UI tour and screenshots
- [docs/EMAIL.md](docs/EMAIL.md) — inbound email ticket creation
- [docs/AZURE.md](docs/AZURE.md) — attachment sync and SAS URLs
