import {
    TICKET_STATE_TRANSITION_DEFS,
    TICKET_STATE_TRANSITION_OPEN,
    TICKET_STATE_TRANSITION_PENDING,
    TICKET_STATE_TRANSITION_RESOLVED,
    TICKET_STATE_TRANSITION_CLOSED,
} from './ticketStateTransitionDefs'

export {
    TICKET_STATE_MODEL_NAME,
    TICKET_STATE_TRANSITION_OPEN,
    TICKET_STATE_TRANSITION_PENDING,
    TICKET_STATE_TRANSITION_RESOLVED,
    TICKET_STATE_TRANSITION_CLOSED,
    TICKET_STATE_TRANSITION_DEFS,
} from './ticketStateTransitionDefs'

export interface TicketStateTransitionConfig {
    targets: string[]
    terminal?: boolean
    order: number
}

export const TICKET_STATE_TRANSITIONS: Record<string, TicketStateTransitionConfig> = Object.fromEntries(
    TICKET_STATE_TRANSITION_DEFS.map((definition) => [
        definition.state,
        {
            targets: [...definition.targets],
            order: definition.order,
            terminal: definition.terminal,
        },
    ])
)

export const RESOLVED_OR_CLOSED_STATE_VALUES = [
    TICKET_STATE_TRANSITION_RESOLVED.state,
    TICKET_STATE_TRANSITION_CLOSED.state,
] as const

export function isResolvedOrClosedState(state: string): boolean {
    return (RESOLVED_OR_CLOSED_STATE_VALUES as readonly string[]).includes(state)
}

export function normalizeTicketStateValue(state: unknown): string {
    const raw = String(state ?? '').trim()
    if (!raw) {
        return TICKET_STATE_TRANSITION_OPEN.state
    }

    if (TICKET_STATE_TRANSITIONS[raw]) {
        return raw
    }

    const slugMap: Record<string, string> = {
        open: TICKET_STATE_TRANSITION_OPEN.state,
        pending: TICKET_STATE_TRANSITION_PENDING.state,
        resolved: TICKET_STATE_TRANSITION_RESOLVED.state,
        closed: TICKET_STATE_TRANSITION_CLOSED.state,
    }

    const bySlug = slugMap[raw.toLowerCase()]
    if (bySlug) {
        return bySlug
    }

    return TICKET_STATE_TRANSITION_OPEN.state
}

export function getAllowedNextStates(currentState: string): string[] {
    const normalized = normalizeTicketStateValue(currentState)
    const config = TICKET_STATE_TRANSITIONS[normalized]
    if (!config) {
        return []
    }
    return [...config.targets]
}

export function getAllowedStatusOptions(currentState: string): string[] {
    const normalized = normalizeTicketStateValue(currentState)
    const next = getAllowedNextStates(normalized)
    const options = new Set<string>([normalized, ...next])

    if (options.size === 0) {
        return TICKET_STATE_TRANSITION_DEFS.map((definition) => definition.state)
    }

    return Array.from(options)
}

export function isAllowedStateTransition(fromState: string, toState: string): boolean {
    const from = normalizeTicketStateValue(fromState)
    const to = normalizeTicketStateValue(toState)
    if (from === to) {
        return true
    }
    return getAllowedNextStates(from).includes(to)
}
