export interface TicketSidebarView {
    id: string
    label: string
}

export const TICKET_SIDEBAR_VIEWS: TicketSidebarView[] = [
    { id: 'all', label: 'All Tickets' },
    { id: 'mine', label: 'My Tickets' },
    { id: 'open', label: 'Open' },
    { id: 'pending', label: 'Pending' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'closed', label: 'Closed' },
    { id: 'unassigned', label: 'Unassigned' },
]
