import { buildTagQuery } from './ticketTags.ts'

const TICKET_TABLE = 'x_2058901_fresher_ticket'

const STATUS_MAP: Record<string, string> = {
    '1': 'open',
    '2': 'pending',
    '3': 'pending',
    '6': 'resolved',
    '7': 'closed',
}

const PRIORITY_MAP: Record<string, string> = {
    '1': 'critical',
    '2': 'high',
    '3': 'medium',
    '4': 'low',
    '5': 'planning',
}

export interface TicketFilters {
    status?: string
    priority?: string
    assignee?: string
    tag?: string
    updatedSince?: string
    limit?: number
    offset?: number
}

export function buildTicketQuery(filters: TicketFilters): string {
    const parts: string[] = []

    if (filters.status) {
        const statusValue = mapStatusToState(filters.status)
        if (statusValue) {
            parts.push(`state=${statusValue}`)
        }
    }

    if (filters.priority) {
        const priorityValue = mapPriorityToValue(filters.priority)
        if (priorityValue) {
            parts.push(`priority=${priorityValue}`)
        }
    }

    if (filters.assignee) {
        if (filters.assignee === 'unassigned') {
            parts.push('assigned_toISEMPTY')
        } else {
            parts.push(`assigned_to=${filters.assignee}`)
        }
    }

    if (filters.tag) {
        const tagQuery = buildTagQuery(filters.tag)
        if (tagQuery) {
            parts.push(tagQuery)
        }
    }

    if (filters.updatedSince) {
        parts.push(`sys_updated_on>=${filters.updatedSince}`)
    }

    parts.push('ORDERBYDESCsys_updated_on')
    return parts.join('^')
}

export function mapStatusToState(status: string): string | null {
    const normalized = status.toLowerCase()
    switch (normalized) {
        case 'open':
            return '1'
        case 'pending':
            return '2'
        case 'resolved':
            return '6'
        case 'closed':
            return '7'
        default:
            return null
    }
}

export function mapPriorityToValue(priority: string): string | null {
    const normalized = priority.toLowerCase()
    switch (normalized) {
        case 'critical':
            return '1'
        case 'high':
            return '2'
        case 'medium':
            return '3'
        case 'low':
            return '4'
        case 'planning':
            return '5'
        default:
            return null
    }
}

export function mapStateToStatus(state: string): string {
    return STATUS_MAP[state] || 'open'
}

export function mapPriorityToLabel(priority: string): string {
    return PRIORITY_MAP[priority] || 'medium'
}

export function isTicketNumber(id: string): boolean {
    return id.toUpperCase().startsWith('TKT')
}

export function getTicketTableName(): string {
    return TICKET_TABLE
}

export function parseLimit(value: string | undefined, defaultValue: number, max: number): number {
    if (!value) {
        return defaultValue
    }
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 1) {
        return defaultValue
    }
    return Math.min(parsed, max)
}

export function parseOffset(value: string | undefined): number {
    if (!value) {
        return 0
    }
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 0) {
        return 0
    }
    return parsed
}
