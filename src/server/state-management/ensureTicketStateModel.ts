import { GlideRecord } from '@servicenow/glide'
import { TICKET_STATE_MODEL_NAME, TICKET_STATE_TRANSITIONS } from '../../shared/ticketStateTransitions.ts'
import { getTicketTableName } from '../tickets/ticketQueries.ts'

/** Manual fallback if state model metadata must be repaired on an instance (Background Script). */
function upsertStateModel(): string {
    const ticketTable = getTicketTableName()
    const gr = new GlideRecord('sys_state_model')
    gr.addQuery('name', TICKET_STATE_MODEL_NAME)
    gr.addQuery('table', ticketTable)
    gr.query()

    const exists = gr.next()
    if (!exists) {
        gr.initialize()
        gr.setValue('name', TICKET_STATE_MODEL_NAME)
        gr.setValue('table', ticketTable)
    }

    gr.setValue('order', 100)
    gr.setValue('active', true)

    if (!exists) {
        return gr.insert()
    }

    gr.update()
    return gr.getUniqueValue()
}

function upsertTransition(
    modelSysId: string,
    fromState: string,
    config: { targets: string[]; terminal?: boolean; order: number }
): void {
    const gr = new GlideRecord('sys_state_transition')
    gr.addQuery('state_model', modelSysId)
    gr.addQuery('state', fromState)
    gr.query()

    const exists = gr.next()
    if (!exists) {
        gr.initialize()
        gr.setValue('state_model', modelSysId)
        gr.setValue('state', fromState)
    }

    gr.setValue('order', config.order)
    gr.setValue('available_transitions', config.targets.join(','))
    gr.setValue('terminal', config.terminal ?? false)

    if (!exists) {
        gr.insert()
        return
    }

    gr.update()
}

export function ensureTicketStateModel(): void {
    const modelSysId = upsertStateModel()
    if (!modelSysId) {
        throw new Error('Failed to create or update FresherDesk ticket state model')
    }

    for (const [fromState, config] of Object.entries(TICKET_STATE_TRANSITIONS)) {
        upsertTransition(modelSysId, fromState, config)
    }
}
