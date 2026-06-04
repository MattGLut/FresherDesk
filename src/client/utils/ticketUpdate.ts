const RESOLVED_STATES = new Set(['6', '7'])

export function prepareTicketUpdate(data: Record<string, string>): Record<string, string> {
    const next = { ...data }

    if (next.state && RESOLVED_STATES.has(next.state) && !next.close_notes) {
        next.close_notes = 'Updated in FresherDesk'
    }

    return next
}
