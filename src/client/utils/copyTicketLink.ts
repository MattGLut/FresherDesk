export function buildTicketDeepLink(sysId: string): string {
    const base = `${window.location.origin}${window.location.pathname}`
    return `${base}#/tickets/${sysId}`
}

export async function copyTicketLink(sysId: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(buildTicketDeepLink(sysId))
        return true
    } catch {
        return false
    }
}
