# FresherDesk REST API

Read-only JSON API for listing and retrieving helpdesk tickets. All endpoints require a valid API key.

**Base URL:** `https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets`

The API ID (`tickets`) is part of the path. Resource URLs:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tickets/tickets` | List tickets with optional filters and pagination |
| `GET` | `/tickets/tickets/{id}` | Get a single ticket by number or sys_id |

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

## List tickets

```http
GET /api/x_2058901_fresher/v1/tickets/tickets
```

Returns a paginated list of ticket summaries. Comments and attachments are **not** included in list responses.

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
  -H "X-API-Key: YOUR_SECRET" \
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

Returns a single ticket with its full conversation thread and attachments.

### Path parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Ticket number (e.g. `TKT0001001`, case-insensitive) or ticket sys_id |

Numbers are detected by the `TKT` prefix. All other values are treated as sys_id lookups.

### Example request

```bash
curl -s \
  -H "X-API-Key: YOUR_SECRET" \
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
| `comments` | array | Conversation thread (empty in list responses) |
| `attachments` | array | File metadata (empty in list responses) |

### Comment object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Comment sys_id |
| `type` | string | `public_reply` or `internal_note` |
| `body` | string | Comment text |
| `author` | object \| null | `{ id, name, email, username }` |
| `source` | string | `agent`, `email`, or `system` |
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

- **Read-only** — no `POST`, `PUT`, `PATCH`, or `DELETE` endpoints
- **No attachment download** — metadata only
- **No comment creation** via REST — use the agent workspace or email ingestion
- ServiceNow platform authentication is disabled on these routes; access is controlled solely by API key validation

Implementation source: [`src/fluent/rest/tickets-api.now.ts`](src/fluent/rest/tickets-api.now.ts), [`src/server/rest/`](src/server/rest/).
