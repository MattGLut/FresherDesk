# Workspace screenshots

PNG screenshots for [README.md](../../README.md). Paths are relative from the repo root: `./docs/images/<filename>.png`.

> **Note:** Committed files may be placeholders until re-captured from a deployed instance. Follow the steps below and overwrite each PNG with a real workspace screenshot.

## Filenames

| File | Capture |
|------|---------|
| `workspace-overview.png` | Ticket index: sidebar view, tag filter, pagination, list rows |
| `ticket-detail-header.png` | Ticket detail: header, status/priority/assignee/tags, attachments section |
| `ticket-detail-children.png` | Child tickets panel with pagination |
| `ticket-detail-conversation.png` | Conversation panel — Conversation tab, thread, reply composer |
| `ticket-detail-audit.png` | Conversation panel — Audit Deltas tab (admin user) |
| `ticket-create-modal.png` | Create ticket modal from sidebar |
| `ticket-edit-modal.png` | Edit modal from detail header |

## How to capture

1. Deploy latest: `npm run build && npm run deploy`
2. Open `https://<instance>/x_2058901_fresher_ticket_workspace.do` as a user with `x_2058901_fresher.agent` (admin for audit tab).
3. Use sample data that exercises pagination: 20+ index tickets, 6+ child tickets, 11+ comments, 11+ audit deltas on one ticket.
4. Browser zoom **100%**, width **~1280px**.
5. Save PNGs into this folder (overwrite existing files).
6. Crop sensitive data (emails, internal names) if sharing publicly.

## Conventions

- **Format:** PNG only
- **No secrets** in screenshots (API keys, passwords, mailbox credentials)
- **Re-capture** when UI layout or major features change
- **Alt text** in README describes what each image shows (do not rely on filename alone)
