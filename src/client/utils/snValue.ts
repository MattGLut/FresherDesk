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
