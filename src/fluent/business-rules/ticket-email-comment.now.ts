import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { createEmailCommentAfterInsert } from '../../server/email/createTicketFromEmail'

BusinessRule({
    $id: Now.ID['ticket-email-comment-br'],
    name: 'FresherDesk Email Comment on Insert',
    table: 'x_2058901_fresher_ticket',
    when: 'after',
    action: ['insert'],
    condition: 'source=email',
    script: createEmailCommentAfterInsert,
})
