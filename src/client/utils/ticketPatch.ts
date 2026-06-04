import { getSysId, STATE_DISPLAY_LABELS, PRIORITY_DISPLAY_LABELS } from './snValue'
import type { TicketRecord } from '../services/TicketService'

function snField(value: string, displayValue?: string) {
    return { value, display_value: displayValue ?? value }
}

function mergeField(existing: unknown, value: string, displayValue?: string) {
    if (typeof existing === 'object' && existing !== null && 'value' in existing) {
        return {
            ...(existing as Record<string, unknown>),
            value,
            display_value: displayValue ?? value,
        }
    }
    return snField(value, displayValue)
}

export function mergeTicketUpdate(ticket: TicketRecord, data: Record<string, string>): TicketRecord {
    const next = { ...ticket }

    for (const [field, value] of Object.entries(data)) {
        if (field === 'state') {
            next.state = mergeField(ticket.state, value, STATE_DISPLAY_LABELS[value] ?? value)
        } else if (field === 'priority') {
            next.priority = mergeField(ticket.priority, value, PRIORITY_DISPLAY_LABELS[value] ?? value)
        } else if (field === 'tags') {
            next.tags = snField(value, value)
        } else if (field === 'assigned_to') {
            next.assigned_to = value ? mergeField(ticket.assigned_to, value) : snField('', '')
        } else {
            ;(next as Record<string, unknown>)[field] = mergeField(
                (ticket as unknown as Record<string, unknown>)[field],
                value
            )
        }
    }

    return next
}

export function replaceTicketInList(tickets: TicketRecord[], sysId: string, updated: TicketRecord): TicketRecord[] {
    return tickets.map((ticket) => (getSysId(ticket) === sysId ? updated : ticket))
}
