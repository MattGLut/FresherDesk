export interface TicketSidebarView {
    id: string
    label: string
    collapsedLabel: string
}

export const TICKET_SIDEBAR_VIEWS: TicketSidebarView[] = [
    { id: 'all', label: 'All Tickets', collapsedLabel: 'All' },
    { id: 'mine', label: 'My Tickets', collapsedLabel: 'Me' },
    { id: 'open', label: 'Open', collapsedLabel: 'Opn' },
    { id: 'pending', label: 'Pending', collapsedLabel: 'Pnd' },
    { id: 'resolved', label: 'Resolved', collapsedLabel: 'Res' },
    { id: 'closed', label: 'Closed', collapsedLabel: 'Cls' },
    { id: 'unassigned', label: 'Unassigned', collapsedLabel: 'Un' },
]
