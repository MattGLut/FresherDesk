import { GlideRecord } from '@servicenow/glide'
import { isResolvedOrClosedState } from '../../shared/ticketStateTransitions.ts'

export function applyResolvedStateFields(gr: GlideRecord<'x_2058901_fresher_ticket'>, state?: string): void {
    if (!state || !isResolvedOrClosedState(state)) {
        return
    }

    if (!gr.getValue('close_notes')) {
        gr.setValue('close_notes', 'Updated in FresherDesk')
    }
}
