import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'
import {
    TICKET_STATE_MODEL_NAME,
    TICKET_STATE_TRANSITION_OPEN,
    TICKET_STATE_TRANSITION_PENDING,
    TICKET_STATE_TRANSITION_RESOLVED,
    TICKET_STATE_TRANSITION_CLOSED,
} from '../../shared/ticketStateTransitions'

export const fresherDeskTicketStateModel = Record({
    $id: Now.ID['ticket-state-model'],
    table: 'sys_state_model',
    data: {
        name: TICKET_STATE_MODEL_NAME,
        table: 'x_2058901_fresher_ticket',
        order: 100,
        active: true,
    },
})

export const fresherDeskTicketStateTransitionOpen = Record({
    $id: Now.ID['ticket-state-transition-open'],
    table: 'sys_state_transition',
    data: {
        state_model: fresherDeskTicketStateModel,
        state: TICKET_STATE_TRANSITION_OPEN.state,
        order: TICKET_STATE_TRANSITION_OPEN.order,
        available_transitions: TICKET_STATE_TRANSITION_OPEN.available_transitions,
        terminal: TICKET_STATE_TRANSITION_OPEN.terminal,
    },
})

export const fresherDeskTicketStateTransitionPending = Record({
    $id: Now.ID['ticket-state-transition-pending'],
    table: 'sys_state_transition',
    data: {
        state_model: fresherDeskTicketStateModel,
        state: TICKET_STATE_TRANSITION_PENDING.state,
        order: TICKET_STATE_TRANSITION_PENDING.order,
        available_transitions: TICKET_STATE_TRANSITION_PENDING.available_transitions,
        terminal: TICKET_STATE_TRANSITION_PENDING.terminal,
    },
})

export const fresherDeskTicketStateTransitionResolved = Record({
    $id: Now.ID['ticket-state-transition-resolved'],
    table: 'sys_state_transition',
    data: {
        state_model: fresherDeskTicketStateModel,
        state: TICKET_STATE_TRANSITION_RESOLVED.state,
        order: TICKET_STATE_TRANSITION_RESOLVED.order,
        available_transitions: TICKET_STATE_TRANSITION_RESOLVED.available_transitions,
        terminal: TICKET_STATE_TRANSITION_RESOLVED.terminal,
    },
})

export const fresherDeskTicketStateTransitionClosed = Record({
    $id: Now.ID['ticket-state-transition-closed'],
    table: 'sys_state_transition',
    data: {
        state_model: fresherDeskTicketStateModel,
        state: TICKET_STATE_TRANSITION_CLOSED.state,
        order: TICKET_STATE_TRANSITION_CLOSED.order,
        available_transitions: TICKET_STATE_TRANSITION_CLOSED.available_transitions,
        terminal: TICKET_STATE_TRANSITION_CLOSED.terminal,
    },
})
