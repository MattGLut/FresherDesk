import { GlideRecord } from '@servicenow/glide'
import { migrateSysAttachmentsToBlob } from '../tickets/ticketAttachments.ts'

export function migrateEmailAttachmentsAfterInsert(
    current: GlideRecord<'x_2058901_fresher_ticket'>
): void {
    if (current.getValue('source') !== 'email') {
        return
    }

    migrateSysAttachmentsToBlob(current.getUniqueValue(), 'email')
}
