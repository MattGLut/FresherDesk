export const TICKET_STATE_MODEL_NAME = 'FresherDesk Ticket: Default'

export interface TicketStateTransitionConfig {
    targets: string[]
    terminal?: boolean
    order: number
}

export const TICKET_STATE_TRANSITION_OPEN = {
    state: '1',
    order: 100,
    targets: ['2', '6'],
    available_transitions: '2,6',
    terminal: false,
} as const

export const TICKET_STATE_TRANSITION_PENDING = {
    state: '2',
    order: 200,
    targets: ['1', '6'],
    available_transitions: '1,6',
    terminal: false,
} as const

export const TICKET_STATE_TRANSITION_RESOLVED = {
    state: '6',
    order: 300,
    targets: ['7', '1'],
    available_transitions: '7,1',
    terminal: false,
} as const

export const TICKET_STATE_TRANSITION_CLOSED = {
    state: '7',
    order: 400,
    targets: [] as string[],
    available_transitions: '',
    terminal: true,
} as const

export const TICKET_STATE_TRANSITIONS: Record<string, TicketStateTransitionConfig> = {
    [TICKET_STATE_TRANSITION_OPEN.state]: {
        targets: [...TICKET_STATE_TRANSITION_OPEN.targets],
        order: TICKET_STATE_TRANSITION_OPEN.order,
        terminal: TICKET_STATE_TRANSITION_OPEN.terminal,
    },
    [TICKET_STATE_TRANSITION_PENDING.state]: {
        targets: [...TICKET_STATE_TRANSITION_PENDING.targets],
        order: TICKET_STATE_TRANSITION_PENDING.order,
        terminal: TICKET_STATE_TRANSITION_PENDING.terminal,
    },
    [TICKET_STATE_TRANSITION_RESOLVED.state]: {
        targets: [...TICKET_STATE_TRANSITION_RESOLVED.targets],
        order: TICKET_STATE_TRANSITION_RESOLVED.order,
        terminal: TICKET_STATE_TRANSITION_RESOLVED.terminal,
    },
    [TICKET_STATE_TRANSITION_CLOSED.state]: {
        targets: [...TICKET_STATE_TRANSITION_CLOSED.targets],
        order: TICKET_STATE_TRANSITION_CLOSED.order,
        terminal: TICKET_STATE_TRANSITION_CLOSED.terminal,
    },
}

export function getAllowedNextStates(currentState: string): string[] {
    const config = TICKET_STATE_TRANSITIONS[currentState]
    if (!config) {
        return []
    }
    return [...config.targets]
}

export function getAllowedStatusOptions(currentState: string): string[] {
    const normalized = String(currentState || '1')
    const options = new Set<string>([normalized, ...getAllowedNextStates(normalized)])
    return Array.from(options)
}

export function isAllowedStateTransition(fromState: string, toState: string): boolean {
    if (fromState === toState) {
        return true
    }
    return getAllowedNextStates(fromState).includes(toState)
}
