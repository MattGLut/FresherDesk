import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { migrateEmailAttachmentsAfterInsert } from '../../server/email/migrateEmailAttachmentsToBlob'

BusinessRule({
    $id: Now.ID['migrate-email-attachments-br'],
    name: 'FresherDesk Migrate Email Attachments to Blob',
    table: 'x_2058901_fresher_ticket',
    when: 'after',
    action: ['insert'],
    condition: 'source=email',
    script: migrateEmailAttachmentsAfterInsert,
})
