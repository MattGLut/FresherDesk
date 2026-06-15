export function getDisplayValue(field: unknown): string {
    if (field == null) return ''
    if (typeof field !== 'object') return String(field)

    const record = field as Record<string, unknown>
    const display = record.display_value
    if (display != null && String(display) !== '') {
        return String(display)
    }

    if ('value' in record && record.value != null && record.value !== '') {
        return String(record.value)
    }

    return ''
}

export const STATE_DISPLAY_LABELS: Record<string, string> = {
    '1': 'Open',
    '2': 'Pending',
    '6': 'Resolved',
    '7': 'Closed',
}

export const PRIORITY_DISPLAY_LABELS: Record<string, string> = {
    '1': 'Critical',
    '2': 'High',
    '3': 'Medium',
    '4': 'Low',
}

export const PRIORITY_VALUES = ['1', '2', '3', '4'] as const

export function priorityCssClass(priorityValue: string): string {
    switch (priorityValue) {
        case '1':
            return 'priority-critical'
        case '2':
            return 'priority-high'
        case '3':
            return 'priority-medium'
        case '4':
            return 'priority-low'
        default:
            return ''
    }
}

export function getChoiceDisplay(field: unknown, labelMap: Record<string, string>): string {
    const value = getValue(field)
    const display = getDisplayValue(field)

    if (display && display !== value) {
        return display
    }

    return labelMap[value] || display || value
}

export function getRequesterDisplay(ticket: {
    requester_email?: unknown
    opened_by?: unknown
}): string {
    const email = getDisplayValue(ticket.requester_email)
    if (email) {
        return email
    }

    const openedByDisplay = getDisplayValue(ticket.opened_by)
    if (openedByDisplay) {
        return openedByDisplay
    }

    return ''
}

export function getValue(field: unknown): string {
    if (field == null) return ''
    if (typeof field === 'object' && field !== null && 'value' in field) {
        return String((field as { value: string }).value || '')
    }
    return String(field)
}

export function getSysId(record: { sys_id?: unknown }): string {
    return getValue(record.sys_id)
}

const COMMENT_TYPE_LABELS: Record<string, string> = {
    internal_note: 'Internal Note',
    public_reply: 'Public Reply',
    audit_delta: 'Delta',
}

export function getCommentTypeValue(field: unknown): string {
    const value = getValue(field)
    if (value in COMMENT_TYPE_LABELS) return value

    const display = getDisplayValue(field).toLowerCase()
    if (display === 'internal note' || display === 'internal_note') return 'internal_note'

    return 'public_reply'
}

export function getCommentTypeLabel(field: unknown): string {
    return COMMENT_TYPE_LABELS[getCommentTypeValue(field)] ?? 'Public Reply'
}

export function isInternalComment(field: unknown): boolean {
    return getCommentTypeValue(field) === 'internal_note'
}

export function isAuditDeltaComment(field: unknown): boolean {
    return getCommentTypeValue(field) === 'audit_delta'
}

export function isVisibleCommentType(field: unknown): boolean {
    return !isAuditDeltaComment(field)
}
