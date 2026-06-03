# FresherDesk

A Freshdesk-style helpdesk built on ServiceNow using the [Now SDK](https://www.servicenow.com/docs/bundle/zurich-application-development/page/build/applications/now-sdk/concept/now-sdk-landing.html) Fluent framework.

## Features

- **Agent workspace** — three-pane UI (sidebar filters, ticket list, ticket detail with conversation thread)
- **Ticket creation** — web form and inbound email ingestion
- **Attachments** — ServiceNow native `sys_attachment` storage (Azure Blob planned for future)
- **REST API** — API-key-authenticated read endpoints ([API.md](API.md))

## Prerequisites

- Node.js 20+
- ServiceNow developer instance with scoped app `x_2058901_fresher` installed
- Users assigned role `x_2058901_fresher.agent` (admins: `x_2058901_fresher.admin`)

## Local development

```bash
npm ci
npm run build
npm run deploy   # deploys to instance configured in now.config.json / env vars
```

Open the agent workspace:

```
https://<instance>.service-now.com/x_2058901_fresher_ticket_workspace.do
```

## GitHub Actions deployment

Configure repository **Settings → Secrets and variables → Actions**:

| Type | Name | Purpose |
|------|------|---------|
| Variable | `SN_SDK_INSTANCE_URL` | e.g. `https://yourinstance.service-now.com` |
| Variable | `SN_SDK_USER` | Deploy username |
| Secret | `SN_SDK_USER_PWD` | Deploy password |

Pushes to `master` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (build + `now-sdk install`).

## Email ingestion setup

1. In ServiceNow, configure **System Mailboxes → Inbound Actions** (or Email Actions) for your support address.
2. Ensure the **FresherDesk Create Ticket from Email** inbound action is active (deployed with the app).
3. Send a test email to the configured address — a ticket is created with source `email`, and an initial public reply comment is added via business rule.

## API key provisioning

API keys are stored as SHA-256 hashes in `x_2058901_fresher_api_key`. Create keys as a user with `x_2058901_fresher.admin`:

1. Generate a random secret (e.g. `fd_live_abc123...`).
2. In **Scripts - Background**, compute the hash:

```javascript
var digest = new GlideDigest();
gs.info(digest.getSHA256Hex('YOUR_SECRET_HERE'));
```

3. Create a record in **FresherDesk API Key** with `name`, `key_hash` (output from step 2), and `active=true`.
4. Store the plaintext secret securely — it cannot be recovered from the hash.

## REST API

See **[API.md](API.md)** for full endpoint documentation, request/response schemas, and error codes.

Quick start:

```bash
curl -s -H "X-API-Key: YOUR_SECRET" \
  "https://<instance>.service-now.com/api/x_2058901_fresher/v1/tickets?status=open&limit=50"
```

## Project structure

```
src/
  fluent/          # Tables, ACLs, REST API, inbound email, UI page metadata
  server/          # Server modules (API handlers, serializers, email logic)
  client/          # React agent workspace
```

## Roles

| Role | Access |
|------|--------|
| `x_2058901_fresher.agent` | CRUD tickets, comments; use agent UI |
| `x_2058901_fresher.admin` | Manage API keys (includes agent role) |

## Out of scope (v1)

- Customer portal
- Azure Blob attachments (ServiceNow storage used for now)
- REST write endpoints (POST/PATCH)
- Email reply threading
