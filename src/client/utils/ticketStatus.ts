const STATUS_CSS_CLASS: Record<string, string> = {
    '1': 'status-open',
    '2': 'status-pending',
    '6': 'status-resolved',
    '7': 'status-closed',
}

export function ticketStatusClass(stateValue: string): string {
    return STATUS_CSS_CLASS[stateValue] ?? ''
}
