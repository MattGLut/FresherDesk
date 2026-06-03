import '@servicenow/sdk/global'
import { InboundEmailAction } from '@servicenow/sdk/core'
import { createTicketFromEmail } from '../../server/email/createTicketFromEmail'

InboundEmailAction({
    $id: Now.ID['create-ticket-from-email'],
    name: 'FresherDesk Create Ticket from Email',
    description: 'Creates a new FresherDesk ticket when an email is received',
    table: 'x_2058901_fresher_ticket',
    type: 'new',
    action: 'record_action',
    active: true,
    order: 100,
    stopProcessing: true,
    script: createTicketFromEmail,
})
