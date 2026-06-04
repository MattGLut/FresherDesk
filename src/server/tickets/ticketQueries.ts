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
    status?: unknown
    priority?: unknown
    assignee?: unknown
    tag?: unknown
    updatedSince?: unknown
    limit?: number
    offset?: number
}

export function queryParamAsString(value: unknown): string | undefined {
    if (value == null || value === '') {
        return undefined
    }

    if (Array.isArray(value)) {
        const first = value[0]
        if (first == null || first === '') {
            return undefined
        }
        const normalized = String(first).trim()
        return normalized || undefined
    }

    const normalized = String(value).trim()
    return normalized || undefined
}

/** Filter-only encoded query (no sort). Used for list + aggregate count. */
export function buildTicketFilterQuery(filters: TicketFilters): string {
    const parts: string[] = []

    const status = queryParamAsString(filters.status)
    if (status) {
        const statusValue = mapStatusToState(status)
        if (statusValue) {
            parts.push(`state=${statusValue}`)
        }
    }

    const priority = queryParamAsString(filters.priority)
    if (priority) {
        const priorityValue = mapPriorityToValue(priority)
        if (priorityValue) {
            parts.push(`priority=${priorityValue}`)
        }
    }

    const assignee = queryParamAsString(filters.assignee)
    if (assignee) {
        if (assignee === 'unassigned') {
            parts.push('assigned_toISEMPTY')
        } else {
            parts.push(`assigned_to=${assignee}`)
        }
    }

    const tag = queryParamAsString(filters.tag)
    if (tag) {
        const tagQuery = buildTagQuery(tag)
        if (tagQuery) {
            parts.push(tagQuery)
        }
    }

    const updatedSince = queryParamAsString(filters.updatedSince)
    if (updatedSince) {
        parts.push(`sys_updated_on>=${updatedSince}`)
    }

    parts.push('parentISEMPTY')
    return parts.join('^')
}

export function mapStatusToState(status: unknown): string | null {
    const normalized = String(status ?? '').trim().toLowerCase()
    if (!normalized) {
        return null
    }
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

export function mapPriorityToValue(priority: unknown): string | null {
    const normalized = String(priority ?? '').trim().toLowerCase()
    if (!normalized) {
        return null
    }
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
