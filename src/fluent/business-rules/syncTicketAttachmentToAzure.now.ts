import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { syncTicketAttachmentToAzure } from '../../server/attachments/syncTicketAttachmentToAzure'

BusinessRule({
    $id: Now.ID['sync-ticket-attachment-to-azure-br'],
    name: 'FresherDesk Sync Ticket Attachment to Azure',
    table: 'sys_attachment',
    when: 'after',
    action: ['insert'],
    condition: 'table_name=x_2058901_fresher_ticket',
    script: syncTicketAttachmentToAzure,
})
