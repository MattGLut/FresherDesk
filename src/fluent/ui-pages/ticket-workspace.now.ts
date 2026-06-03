import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import ticketPage from '../../client/index.html'

UiPage({
    $id: Now.ID['ticket-workspace-page'],
    endpoint: 'x_2058901_fresher_ticket_workspace.do',
    description: 'FresherDesk Agent Ticket Workspace',
    category: 'general',
    html: ticketPage,
    direct: true,
})
