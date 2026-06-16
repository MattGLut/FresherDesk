import { TICKET_LIST_PAGE_SIZE } from '../constants/tickets'
import { TICKET_TABLE } from '../constants/tables'
import { prepareTicketUpdate } from '../utils/ticketUpdate'
import { extractApiErrorMessage } from '../utils/apiErrors'
import { fetchTablePage } from '../utils/tableApiPage'

declare global {
    interface Window {
        g_ck: string
    }
}

export interface TicketRecord {
    sys_id: unknown
    number: unknown
    short_description: unknown
    description: unknown
    state: unknown
    priority: unknown
    assigned_to: unknown
    opened_by: unknown
    requester_email: unknown
    source: unknown
    category: unknown
    parent: unknown
    tags: unknown
    sys_updated_on: unknown
    opened_at: unknown
}

export interface TicketFilter {
    view?: string
    status?: string
    assignee?: string
    tag?: string
}

export interface TicketListResult {
    tickets: TicketRecord[]
    total: number
    limit: number
    offset: number
}

export class TicketService {
    private readonly tableName = TICKET_TABLE

    private headers(): Record<string, string> {
        return {
            Accept: 'application/json',
            'X-UserToken': window.g_ck,
        }
    }

    private jsonHeaders(): Record<string, string> {
        return {
            ...this.headers(),
            'Content-Type': 'application/json',
        }
    }

    buildQuery(filter: TicketFilter): string {
        const parts: string[] = []

        switch (filter.view) {
            case 'open':
                parts.push('state=1')
                break
            case 'pending':
                parts.push('state=2')
                break
            case 'resolved':
                parts.push('state=6')
                break
            case 'closed':
                parts.push('state=7')
                break
            case 'mine':
                parts.push('assigned_to=javascript:gs.getUserID()')
                break
            case 'unassigned':
                parts.push('assigned_toISEMPTY')
                break
            default:
                break
        }

        if (filter.status) {
            parts.push(`state=${filter.status}`)
        }

        if (filter.assignee === 'me') {
            parts.push('assigned_to=javascript:gs.getUserID()')
        } else if (filter.assignee) {
            parts.push(`assigned_to=${filter.assignee}`)
        }

        if (filter.tag?.trim()) {
            parts.push(`tagsLIKE"${filter.tag.trim()}"`)
        }

        parts.push('parentISEMPTY')
        parts.push('ORDERBYDESCsys_updated_on')
        return parts.join('^')
    }

    async list(filter: TicketFilter = {}): Promise<TicketRecord[]> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set(
            'sysparm_fields',
            'sys_id,number,short_description,description,state,priority,assigned_to,opened_by,requester_email,source,category,tags,parent,sys_updated_on,opened_at'
        )
        searchParams.set('sysparm_query', this.buildQuery(filter))

        const response = await fetch(`/api/now/table/${this.tableName}?${searchParams.toString()}`, {
            method: 'GET',
            headers: this.headers(),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        const { result } = await response.json()
        return result || []
    }

    async listPage(
        filter: TicketFilter = {},
        limit: number = TICKET_LIST_PAGE_SIZE,
        offset: number = 0
    ): Promise<TicketListResult> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set(
            'sysparm_fields',
            'sys_id,number,short_description,description,state,priority,assigned_to,opened_by,requester_email,source,category,tags,parent,sys_updated_on,opened_at'
        )
        searchParams.set('sysparm_query', this.buildQuery(filter))
        searchParams.set('sysparm_limit', String(limit))
        searchParams.set('sysparm_offset', String(offset))

        const response = await fetch(`/api/now/table/${this.tableName}?${searchParams.toString()}`, {
            method: 'GET',
            headers: this.headers(),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        const { result } = await response.json()
        const totalHeader = response.headers.get('X-Total-Count')
        const total = totalHeader != null ? parseInt(totalHeader, 10) || 0 : (result || []).length

        return {
            tickets: result || [],
            total,
            limit,
            offset,
        }
    }

    async listChildrenPage(parentSysId: string, limit: number, offset: number) {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set(
            'sysparm_fields',
            'sys_id,number,short_description,description,state,priority,assigned_to,opened_by,requester_email,source,category,tags,parent,sys_updated_on,opened_at'
        )
        searchParams.set('sysparm_query', `parent=${parentSysId}^ORDERBYDESCsys_updated_on`)

        return fetchTablePage<TicketRecord>(this.tableName, searchParams, this.headers(), limit, offset)
    }

    async get(sysId: string): Promise<TicketRecord> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')

        const response = await fetch(`/api/now/table/${this.tableName}/${sysId}?${searchParams.toString()}`, {
            method: 'GET',
            headers: this.headers(),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        const { result } = await response.json()
        return result
    }

    async create(data: Record<string, string>): Promise<TicketRecord> {
        const response = await fetch(`/api/now/table/${this.tableName}`, {
            method: 'POST',
            headers: this.jsonHeaders(),
            body: JSON.stringify({
                ...data,
                source: 'form',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(extractApiErrorMessage(errorData, `HTTP error ${response.status}`))
        }

        const { result } = await response.json()
        return result
    }

    async update(sysId: string, data: Record<string, string>): Promise<TicketRecord> {
        const payload = prepareTicketUpdate(data)
        const response = await fetch(`/api/now/table/${this.tableName}/${sysId}`, {
            method: 'PATCH',
            headers: this.jsonHeaders(),
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(extractApiErrorMessage(errorData, `HTTP error ${response.status}`))
        }

        const { result } = await response.json()
        return result
    }

    async delete(sysId: string): Promise<boolean> {
        const response = await fetch(`/api/now/table/${this.tableName}/${sysId}`, {
            method: 'DELETE',
            headers: this.headers(),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        return response.ok
    }
}
