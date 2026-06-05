# Azure Blob attachments

FresherDesk keeps **ServiceNow `sys_attachment`** as the primary store for the agent UI and inbound email. A business rule copies each new ticket attachment to **Azure Blob** and writes metadata to `x_2058901_fresher_ticket_attachment`. The REST API returns time-limited **read SAS URLs** from that metadata table.

## Flow

```
Agent UI / email → sys_attachment (on ticket)
                        │
                        ▼ after insert
              Sync Ticket Attachment to Azure (BR)
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   Azure Blob                   metadata table
   (file bytes)            (blob path, ticket link, sys_attachment id)
                        │
                        ▼
              GET/PATCH/create_child API → download_url (fresh SAS)
```

- **`sys_attachment` is not deleted** — agents keep using native upload/download in the workspace.
- **API consumers** use metadata record `id` and `download_url` on any full-ticket REST response (re-GET to refresh expired SAS).
- **GET backfill** — the first REST call that loads attachments for a ticket with legacy `sys_attachment` rows (uploaded before Azure was enabled, or before the sync BR ran) uploads any files that lack a metadata row. Subsequent calls only refresh SAS URLs.
- **Fallback mode** — when Azure is disabled or no metadata exists yet, API attachment `id` equals `sys_attachment_id` and `download_url` is omitted.

## Business rule

**FresherDesk Sync Ticket Attachment to Azure** runs after insert on `sys_attachment` when `table_name=x_2058901_fresher_ticket`. It is deployed with **`access: public`** so it fires on platform attachment uploads (`/api/now/attachment/upload`) and inbound email attachments, not only in-app scoped transactions.

Email attachments use the same BR as agent UI uploads — see [EMAIL.md](EMAIL.md).

## Configure Azure (Background Script)

Run once as **admin** on the instance:

```javascript
(function () {
    gs.setProperty('x_2058901_fresher.azure.storage_account', 'YOUR_ACCOUNT');
    gs.setProperty('x_2058901_fresher.azure.container', 'ticket-attachments');
    gs.setProperty('x_2058901_fresher.azure.account_key', 'YOUR_KEY1_OR_KEY2');
    gs.setProperty('x_2058901_fresher.azure.sas_ttl_minutes', '15');
    gs.setProperty('x_2058901_fresher.azure.enabled', 'true');
    gs.info('FresherDesk Azure properties set');
})();
```

| Property | Purpose |
|----------|---------|
| `x_2058901_fresher.azure.storage_account` | Storage account name |
| `x_2058901_fresher.azure.container` | Private container (e.g. `ticket-attachments`) |
| `x_2058901_fresher.azure.account_key` | Account key (secret) |
| `x_2058901_fresher.azure.sas_ttl_minutes` | SAS lifetime (default 15) |
| `x_2058901_fresher.azure.enabled` | `false` disables sync and SAS URLs |

Until configured, attachments work via `sys_attachment` only; the API returns attachment metadata without `download_url`, and attachment `id` is the `sys_attachment` sys_id.

## Provision Azure storage

1. Create a **Standard** storage account and **private** container.
2. Disable anonymous public access; require HTTPS.
3. Copy **Key1** or **Key2** into the script above.

Blob path layout: `{ticketSysId}/{sysAttachmentSysId}/{safeFileName}`

## Test checklist

| Step | Expected |
|------|----------|
| Upload file in agent workspace | File on ticket via `sys_attachment`; metadata row in `x_2058901_fresher_ticket_attachment` |
| REST GET ticket | `attachments[].download_url` present when Azure configured |
| REST PATCH / create_child | Same attachment + SAS shape when response includes attachments |
| Open `download_url` | File downloads until SAS expiry; re-GET ticket for a new URL |
| Email with attachment | Same as UI — `sys_attachment` + metadata row |
| Azure disabled | UI still works; API omits `download_url` |

## Related

- [API.md](../API.md) — attachment object on GET ticket
- [EMAIL.md](EMAIL.md) — inbound email setup
