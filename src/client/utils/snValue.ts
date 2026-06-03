export function getDisplayValue(field: unknown): string {
    if (field == null) return ''
    if (typeof field === 'object' && field !== null && 'display_value' in field) {
        return String((field as { display_value: string }).display_value || '')
    }
    return String(field)
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
