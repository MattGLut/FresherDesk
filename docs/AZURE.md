# Azure Blob attachment storage

FresherDesk stores ticket attachments in **Azure Blob Storage**. Metadata lives in `x_2058901_fresher_ticket_attachment`; file bytes are uploaded via the ServiceNow server using Shared Key auth. External consumers receive time-limited **read SAS URLs** on GET ticket responses (Freshdesk / S3 presigned GET equivalent).

## Architecture

```
Agent UI / inbound email
        │
        ▼
ServiceNow (x_2058901_fresher)
  • POST upload (UI session or API key)
  • Email: sys_attachment → after-insert BR → blob + metadata
  • GET ticket / download refresh → fresh read SAS per request
        │
        ▼
Azure Blob (private container)
  {ticketSysId}/{attachmentSysId}/{safeFileName}
```

## Mitsui provisioning checklist

1. Create an Azure **Storage account** (e.g. `mitsuifresherdesk`) in the agreed subscription/region.
2. Create a **private container** (e.g. `ticket-attachments`).
3. Disable **anonymous public access** on the account and container.
4. Copy the storage account **access key** (Key1 or Key2) securely — it is stored only in ServiceNow system properties, never in source code.
5. Optionally restrict network access (firewall / private endpoint) so only ServiceNow egress IPs can reach blob endpoints.

## ServiceNow configuration

Set these **scoped system properties** on the instance (System Properties → filter `x_2058901_fresher.azure`):

| Property | Example | Notes |
|----------|---------|-------|
| `x_2058901_fresher.azure.storage_account` | `mitsuifresherdesk` | Storage account name |
| `x_2058901_fresher.azure.container` | `ticket-attachments` | Private container name |
| `x_2058901_fresher.azure.account_key` | *(secret)* | Base64 account key from Azure portal |
| `x_2058901_fresher.azure.sas_ttl_minutes` | `15` | Read SAS lifetime (default 15) |
| `x_2058901_fresher.azure.enabled` | `true` | Set `false` to disable uploads and omit SAS URLs |

Until properties are set, uploads return **503** with a clear message; GET ticket still returns attachment metadata without `download_url`.

### Set properties (Background script)

```javascript
gs.setProperty('x_2058901_fresher.azure.storage_account', 'YOUR_ACCOUNT');
gs.setProperty('x_2058901_fresher.azure.container', 'ticket-attachments');
gs.setProperty('x_2058901_fresher.azure.account_key', 'YOUR_BASE64_KEY');
gs.setProperty('x_2058901_fresher.azure.sas_ttl_minutes', '15');
gs.setProperty('x_2058901_fresher.azure.enabled', 'true');
```

## Ingest paths

| Source | Flow |
|--------|------|
| **Agent UI** | Workspace upload → `POST /tickets/{id}/attachments` (session + agent role) → blob + metadata (`source=agent`) |
| **Inbound email** | Email action saves to `sys_attachment` at insert → **Migrate Email Attachments to Blob** business rule uploads to blob, writes metadata (`source=email`), deletes `sys_attachment` |
| **REST API key** | Same POST route with `X-API-Key` sets `source=api` |

## Download URLs

- **GET ticket** — each attachment includes `download_url` and `download_url_expires_at` when Azure is configured (new SAS on every GET).
- **GET `/tickets/{id}/attachments/{attachmentId}/download`** — refresh an expired SAS without reloading the full ticket. Accepts API key or agent session.

SAS tokens are **read-only**, HTTPS-only, and short-lived. The account key never leaves ServiceNow.

## Security notes

- Container must remain private; do not enable static website or anonymous blob access.
- Rotate storage account keys on a schedule; update `account_key` property after rotation.
- SAS expiry limits exposure if a URL is leaked.
- Compare to Freshdesk: their attachment URLs are time-limited presigned links; FresherDesk uses Azure Blob read SAS the same way.

## Manual test checklist

Requires Azure properties configured on the instance.

| # | Test | Expected |
|---|------|----------|
| 1 | Agent UI: upload PDF on a ticket | Metadata row in `x_2058901_fresher_ticket_attachment`; GET ticket returns `download_url`; URL downloads file in browser |
| 2 | Send email with attachment to inbound mailbox | Ticket created; attachment in metadata table; no leftover `sys_attachment` on ticket |
| 3 | GET same ticket twice via REST | Different SAS query string each time; new `download_url_expires_at` |
| 4 | Wait for SAS expiry, call download refresh route | **200** with fresh URL |
| 5 | Set `azure.enabled=false` | Upload **503**; GET ticket attachments omit `download_url` |

### REST examples (after Azure configured)

Upload (API key):

```cmd
curl.exe --ssl-no-revoke -s -X POST -H "X-API-Key: fd_live_dev_test_abc123xyz" -H "Content-Type: application/json" -d "{\"file_name\":\"test.txt\",\"content_type\":\"text/plain\",\"content_base64\":\"dGVzdA==\"}" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001/attachments"
```

Refresh download URL:

```cmd
curl.exe --ssl-no-revoke -s -H "X-API-Key: fd_live_dev_test_abc123xyz" "https://dev385836.service-now.com/api/x_2058901_fresher/v1/tickets/tickets/TKT0001001/attachments/{attachmentSysId}/download"
```

## Local development without Azure

Leave `account_key` empty or set `enabled=false`. UI upload shows an error from the REST handler; list/load still works for metadata-only rows if any exist.

Optional offline testing: [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) with a real storage account key from the Azurite well-known dev connection string (not wired by default in this app).

## Related docs

- [API.md](../API.md) — attachment object and REST routes
- [EMAIL.md](EMAIL.md) — inbound email setup
