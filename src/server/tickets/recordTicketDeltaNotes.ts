import { GlideRecord } from '@servicenow/glide'
import { mapStateToStatus, mapPriorityToLabel, getTicketTableName } from './ticketQueries.ts'
import {
    createAuditDeltaNote,
    resolveUpdateSource,
} from './ticketComments.ts'

interface TrackedField {
    name: string
    label: string
    display?: (value: string) => string
    useRecordDisplay?: boolean
}

const TRACKED_FIELDS: TrackedField[] = [
    { name: 'short_description', label: 'subject' },
    { name: 'description', label: 'description' },
    { name: 'state', label: 'status', display: mapStateToStatus },
    { name: 'priority', label: 'priority', display: mapPriorityToLabel },
    { name: 'assigned_to', label: 'assignee', useRecordDisplay: true },
    { name: 'category', label: 'category' },
    { name: 'tags', label: 'tags' },
    { name: 'requester_email', label: 'requester_email' },
]

function displayForField(
    field: TrackedField,
    record: GlideRecord<'x_2058901_fresher_ticket'>,
    value: string
): string {
    if (field.useRecordDisplay) {
        return record.getDisplayValue(field.name) || value
    }

    if (field.display) {
        return field.display(value)
    }

    return value
}

export function recordTicketDeltaNotes(...args: unknown[]): void {
    const current = args[0] as GlideRecord<'x_2058901_fresher_ticket'>
    if (!current) {
        return
    }

    const previous = new GlideRecord(getTicketTableName())
    if (!previous.get(current.getUniqueValue())) {
        return
    }

    const ticketSysId = current.getUniqueValue()
    const source = resolveUpdateSource()

    for (const field of TRACKED_FIELDS) {
        const oldValue = previous.getValue(field.name) || ''
        const newValue = current.getValue(field.name) || ''

        if (oldValue === newValue) {
            continue
        }

        createAuditDeltaNote(ticketSysId, {
            field: field.label,
            oldValue,
            newValue,
            oldDisplay: displayForField(field, previous, oldValue),
            newDisplay: displayForField(field, current, newValue),
            source,
        })
    }
}
