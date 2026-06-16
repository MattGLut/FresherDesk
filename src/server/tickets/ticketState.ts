import { GlideRecord } from '@servicenow/glide'

const RESOLVED_STATES = new Set(['6', '7'])

export function applyResolvedStateFields(gr: GlideRecord<'x_2058901_fresher_ticket'>, state?: string): void {
    if (!state || !RESOLVED_STATES.has(state)) {
        return
    }

    if (!gr.getValue('close_notes')) {
        gr.setValue('close_notes', 'Updated in FresherDesk')
    }
}
