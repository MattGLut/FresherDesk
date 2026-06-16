export const TICKET_STATE_MODEL_NAME = 'FresherDesk Ticket: Default'

export interface TicketStateTransitionConfig {
    targets: string[]
    terminal?: boolean
    order: number
}

interface TransitionDefinitionInput {
    state: string
    order: number
    targets: readonly string[]
    terminal: boolean
}

interface TransitionDefinition extends TicketStateTransitionConfig {
    state: string
    available_transitions: string
    terminal: boolean
}

function defineTransition(input: TransitionDefinitionInput): TransitionDefinition {
    const targets = [...input.targets]
    return {
        state: input.state,
        order: input.order,
        targets,
        available_transitions: targets.join(','),
        terminal: input.terminal,
    }
}

export const TICKET_STATE_TRANSITION_OPEN = defineTransition({
    state: '1',
    order: 100,
    targets: ['2', '6'],
    terminal: false,
})

export const TICKET_STATE_TRANSITION_PENDING = defineTransition({
    state: '2',
    order: 200,
    targets: ['1', '6'],
    terminal: false,
})

export const TICKET_STATE_TRANSITION_RESOLVED = defineTransition({
    state: '6',
    order: 300,
    targets: ['7', '1'],
    terminal: false,
})

export const TICKET_STATE_TRANSITION_CLOSED = defineTransition({
    state: '7',
    order: 400,
    targets: [],
    terminal: true,
})

export const TICKET_STATE_TRANSITION_DEFS = [
    TICKET_STATE_TRANSITION_OPEN,
    TICKET_STATE_TRANSITION_PENDING,
    TICKET_STATE_TRANSITION_RESOLVED,
    TICKET_STATE_TRANSITION_CLOSED,
] as const

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

export function getAllowedNextStates(currentState: string): string[] {
    const config = TICKET_STATE_TRANSITIONS[currentState]
    if (!config) {
        return []
    }
    return [...config.targets]
}

export function getAllowedStatusOptions(currentState: string): string[] {
    const normalized = String(currentState || TICKET_STATE_TRANSITION_OPEN.state)
    const options = new Set<string>([normalized, ...getAllowedNextStates(normalized)])
    return Array.from(options)
}

export function isAllowedStateTransition(fromState: string, toState: string): boolean {
    if (fromState === toState) {
        return true
    }
    return getAllowedNextStates(fromState).includes(toState)
}
