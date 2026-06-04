# FresherDesk REST API

JSON API for listing, retrieving, and updating helpdesk tickets. All endpoints require a valid API key.

**Base URL:** `https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets`

The API ID (`tickets`) is part of the path. Resource URLs:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tickets/tickets` | List tickets with optional filters and pagination |
| `GET` | `/tickets/tickets/{id}` | Get a single ticket by number or sys_id |
| `PATCH` | `/tickets/tickets/{id}` | Update ticket status, subject, or description |
| `POST` | `/tickets/tickets/{id}/create_child` | Create a child ticket under a parent |

**Content type:** `application/json`

---

## Authentication

Every request must include an API key in the `X-API-Key` header.

```http
X-API-Key: fd_live_your_secret_here
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

## Testing with curl on Windows

PowerShell can strip or alter inline `-d` JSON when passed directly on the command line. If you see `subject is required` with a body that looks correct, try passing the JSON from a variable (still inline, no file):

```powershell
$body = '{"subject":"Follow-up on password reset","priority":"medium"}'
curl.exe --ssl-no-revoke -i -X POST `
  -H "X-API-Key: fd_live_your_secret_here" `
  -H "Content-Type: application/json" `
  --data-raw $body `
  "https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001/create_child"
```

Or use `--data-binary "@create-child.json"` if you prefer a file. Git Bash and WSL can use the inline `-d '...'` examples below.

---

## List tickets

```http
GET /api/x_2058901_fresher/v1/tickets/tickets
```

Returns a paginated list of ticket summaries. Comments and attachments are **not** included in list responses. Only **top-level** tickets are returned (child tickets are excluded via `parentISEMPTY`); use [Get ticket](#get-ticket) on a parent to see its `children` array.

### Query parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter by status: `open`, `pending`, `resolved`, `closed` |
| `priority` | string | — | Filter by priority: `critical`, `high`, `medium`, `low`, `planning` |
| `assignee` | string | — | Assignee user sys_id, or `unassigned` for tickets with no assignee |
| `tag` | string | — | Filter tickets that include this tag (exact match within the stored tag list) |
| `updated_since` | string | — | ISO datetime; returns tickets updated on or after this time |
| `limit` | integer | `50` | Page size (minimum 1, maximum 200) |
| `offset` | integer | `0` | Number of records to skip |

Invalid or unrecognized `status` / `priority` values are silently ignored (no filter applied for that parameter).

Results are ordered by most recently updated first.

### Example request

```bash
curl -s \
  -H "X-API-Key: fd_live_your_secret_here" \
  "https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets/tickets?status=open&priority=high&tag=billing&limit=25&offset=0"
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

Numbers are detected by the `TKT` prefix. All other values are treated as sys_id lookups.

### Example request

```bash
curl -s \
  -H "X-API-Key: fd_live_your_secret_here" \
  "https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
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
          "email": "customer@example.com"
        },
        "source": "email",
        "created_at": "2026-06-01 09:15:00"
      }
    ],
    "attachments": [
      {
        "id": "b1c2d3e4f5a6789012345678901234bc",
        "file_name": "screenshot.png",
        "size_bytes": 204800,
        "content_type": "image/png",
        "created_at": "2026-06-01 09:16:00"
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

Creates a child ticket linked to the parent ticket identified in the path. The child inherits `requester_email` and `opened_by` from the parent. Returns the created ticket with `parent_id` set and an empty `children` array.

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Parent ticket number (e.g. `TKT0001001`, case-insensitive) or parent sys_id |

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Child ticket title (max 160 characters) |
| `description` | string | No | Full ticket body |
| `status` | string | No | `open`, `pending`, `resolved`, or `closed` (default: `open`) |
| `priority` | string | No | `critical`, `high`, `medium`, `low`, or `planning` |
| `category` | string | No | `general`, `billing`, `technical`, or `account` (default: `general`) |

### Example request

```bash
curl -s -X POST \
  -H "X-API-Key: fd_live_your_secret_here" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Follow-up on password reset","description":"Customer still cannot log in.","priority":"medium"}' \
  "https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001/create_child"
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

Missing or unreadable body:

```json
{
  "error": {
    "code": "bad_request",
    "message": "subject is required"
  }
}
```

If you see `subject is required` with inline `-d` on Windows PowerShell, pass the JSON via a `$body` variable and `--data-raw` as in [Testing with curl on Windows](#testing-with-curl-on-windows).

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

Send JSON with any combination of the fields below. At least one field must be present.

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `open`, `pending`, `resolved`, or `closed` |
| `subject` | string | Ticket title (maps to `short_description`, max 160 characters) |
| `title` | string | Alias for `subject` |
| `description` | string | Full ticket body |

### Side effects

- Triggers the ticket delta audit business rule, which writes **audit_delta** comments for each changed field (hidden from the agent UI and REST comment output; query the comment table directly for forensics).

### Example request

```bash
curl -s -X PATCH \
  -H "X-API-Key: fd_live_your_secret_here" \
  -H "Content-Type: application/json" \
  -d '{"status":"pending","subject":"Password reset still failing"}' \
  "https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001"
```

### Example response (200)

Same structure as the [Get ticket](#get-ticket) response, including the updated ticket fields. Audit delta comments are not included in `comments`.

### Bad request (400)

```json
{
  "error": {
    "code": "bad_request",
    "message": "Provide at least one updatable field: status, subject, description"
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
| `priority` | string | `critical`, `high`, `medium`, `low`, or `planning` |
| `category` | string | `general`, `billing`, `technical`, or `account` |
| `source` | string | How the ticket was created: `email`, `form`, or `api` |
| `tags` | string[] | Labels applied to the ticket (e.g. `["billing", "urgent"]`) |
| `requester` | object | `{ id, name, email, username }` — loaded from `opened_by` user; `email` falls back to ticket `requester_email` |
| `assignee` | object \| null | `{ id, name, email, username, roles }` or `null` if unassigned — `roles` lists ServiceNow role names |
| `opened_at` | string | Instance display datetime |
| `updated_at` | string | Instance display datetime |
| `parent_id` | string \| null | Parent ticket sys_id, or `null` for top-level tickets |
| `children` | array | Direct child ticket summaries (populated on single-ticket GET and create_child; always `[]` in list responses) |
| `comments` | array | Conversation thread (empty in list responses) |
| `attachments` | array | File metadata (empty in list responses) |

### Child ticket summary (in `children`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Child ticket sys_id |
| `number` | string | Child ticket number |
| `subject` | string | Short description |
| `status` | string | `open`, `pending`, `resolved`, or `closed` |
| `priority` | string | `critical`, `high`, `medium`, `low`, or `planning` |
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
| `id` | string | Attachment sys_id |
| `file_name` | string | Original filename |
| `size_bytes` | integer | File size in bytes |
| `content_type` | string | MIME type |
| `created_at` | string | Instance display datetime |

Attachment download is not exposed via this API in v1. Attachments are stored in ServiceNow `sys_attachment` records linked to the ticket table.

---

## Error responses

All errors return JSON with an `error` object containing `code` and `message`.

| HTTP status | Code | When |
|-------------|------|------|
| 401 | `unauthorized` | Missing, invalid, or inactive API key |
| 400 | `bad_request` | Invalid update payload or field values |
| 404 | `not_found` | Ticket does not exist |
| 500 | `internal_error` | Unexpected server failure |

### Internal error (500)

```json
{
  "error": {
    "code": "internal_error",
    "message": "Failed to list tickets"
  }
}
```

---

## Limitations (v1)

- **Partial write support** — `PATCH` updates status, subject/title, and description only
- **Child tickets** — list endpoint returns top-level tickets only; nested children are reachable via GET on the parent or by navigating to the child sys_id
- **No attachment download** — metadata only
- **No public comment creation** via REST — agent replies use the workspace; API updates create internal notes automatically
- **Audit deltas** — field-level change history is stored as `audit_delta` comments but excluded from REST and UI conversation views
- ServiceNow platform authentication is disabled on these routes; access is controlled solely by API key validation

Implementation source: [`src/fluent/rest/tickets-api.now.ts`](src/fluent/rest/tickets-api.now.ts), [`src/server/rest/`](src/server/rest/).
