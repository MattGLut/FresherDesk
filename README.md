# FresherDesk

A Freshdesk-style helpdesk built on ServiceNow using the [Now SDK](https://www.servicenow.com/docs/bundle/zurich-application-development/page/build/applications/now-sdk/concept/now-sdk-landing.html) Fluent framework.

## Features

- **Agent workspace** — hash-routed SPA: ticket index (`#/`) and ticket show (`#/tickets/{sys_id}`)
- **Ticket creation** — web form and inbound email ingestion
- **Attachments** — `sys_attachment` in the UI; Azure Blob sync + SAS download URLs on REST responses that include attachments (GET, PATCH, create_child) ([docs/AZURE.md](docs/AZURE.md))
- **REST API** — API-key-authenticated ticket API: list, get, PATCH update, child create ([API.md](API.md))

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
https://dev385836.service-now.com/x_2058901_fresher_ticket_workspace.do
```

The UI is a single-page app with hash routes:

| URL | Page |
|-----|------|
| `...ticket_workspace.do#/` | Ticket index (list + filters) |
| `...ticket_workspace.do#/?view=open&tag=billing` | Index with view/tag filters |
| `...ticket_workspace.do#/tickets/{sys_id}` | Ticket detail |

Use the ticket `sys_id` (not the display number) in show URLs.

## GitHub Actions deployment

Configure repository **Settings → Secrets and variables → Actions**:

| Type | Name | Purpose |
|------|------|---------|
| Variable | `SN_SDK_INSTANCE_URL` | e.g. `https://yourinstance.service-now.com` |
| Variable | `SN_SDK_USER` | Deploy username |
| Secret | `SN_SDK_USER_PWD` | Deploy password |

Pushes to `master` run [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (build + `now-sdk install`).

## Email ingestion setup

Full guide: **[docs/EMAIL.md](docs/EMAIL.md)** (mailbox on `dev385836`, inbound action binding, test checklist, troubleshooting).

Summary:

1. Deploy the app so **FresherDesk Create Ticket from Email** and **FresherDesk Email Comment on Insert** are active in scope `x_2058901_fresher`.
2. Create an **IMAP/POP inbound email account** in ServiceNow and bind it on the inbound action **Mailbox** field.
3. Send a test email — ticket with `source=email`, initial **public_reply** comment, and attachments on the ticket (Azure sync when configured — [docs/AZURE.md](docs/AZURE.md)).

## Azure Blob attachments

See **[docs/AZURE.md](docs/AZURE.md)** for storage setup and the background script for instance properties.

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

Quick start (Windows cmd — see [API.md](API.md) for full examples):

```cmd
curl.exe --ssl-no-revoke -s -H "X-API-Key: fd_live_dev_test_abc123xyz" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets?status=open&limit=50"
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
- REST attachment upload (use agent UI / email; files land on `sys_attachment` first)
- REST top-level ticket create, comment create
- Email reply threading
