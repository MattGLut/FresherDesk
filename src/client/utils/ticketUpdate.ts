import { isResolvedOrClosedState } from '../../shared/ticketStateTransitions'

export function prepareTicketUpdate(data: Record<string, string>): Record<string, string> {
    const next = { ...data }

    if (next.state && isResolvedOrClosedState(next.state) && !next.close_notes) {
        next.close_notes = 'Updated in FresherDesk'
    }

    return next
}
