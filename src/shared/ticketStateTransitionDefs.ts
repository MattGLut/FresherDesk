/**
 * Literal transition definitions for FresherDesk ticket state management.
 * Fluent Record() imports must use values from this file only — no runtime functions.
 */
export const TICKET_STATE_MODEL_NAME = 'FresherDesk Ticket: Default'

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
    targets: [] as const,
    available_transitions: '',
    terminal: true,
} as const

export const TICKET_STATE_TRANSITION_DEFS = [
    TICKET_STATE_TRANSITION_OPEN,
    TICKET_STATE_TRANSITION_PENDING,
    TICKET_STATE_TRANSITION_RESOLVED,
    TICKET_STATE_TRANSITION_CLOSED,
] as const
