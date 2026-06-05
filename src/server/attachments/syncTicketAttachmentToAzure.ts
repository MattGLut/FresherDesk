import { GlideRecord } from '@servicenow/glide'
import { syncSysAttachmentToAzureSafe } from '../tickets/ticketAttachments.ts'

export function syncTicketAttachmentToAzure(current: GlideRecord<'sys_attachment'>): void {
    syncSysAttachmentToAzureSafe(current)
}
