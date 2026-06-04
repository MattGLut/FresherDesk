import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import { recordTicketDeltaNotes } from '../../server/tickets/recordTicketDeltaNotes'

BusinessRule({
    $id: Now.ID['ticket-delta-audit-br'],
    name: 'FresherDesk Ticket Delta Audit',
    table: 'x_2058901_fresher_ticket',
    when: 'before',
    action: ['update'],
    script: recordTicketDeltaNotes,
})
