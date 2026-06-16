export function extractApiErrorMessage(errorData: unknown, fallback: string): string {
    if (!errorData || typeof errorData !== 'object') {
        return fallback
    }

    const record = errorData as {
        error?: { message?: string; detail?: string }
        status?: string
    }

    const message = record.error?.message || record.error?.detail || record.status
    return message && String(message).trim() ? String(message) : fallback
}

export function isStateTransitionError(message: string): boolean {
    return /state transition|invalid state/i.test(message)
}
