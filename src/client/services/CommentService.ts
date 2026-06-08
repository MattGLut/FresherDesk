import { TICKET_COMMENT_TABLE } from '../constants/tables'
import { commentExclusionQuery, COMMENT_TYPE_AUDIT_DELTA } from '../utils/commentTypes'

declare global {
    interface Window {
        g_ck: string
    }
}
export interface CommentRecord {
    sys_id: unknown
    ticket: unknown
    body: unknown
    author: unknown
    comment_type: unknown
    source: unknown
    sys_created_on: unknown
}

export class CommentService {
    private readonly tableName = TICKET_COMMENT_TABLE

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

    async listForTicket(ticketSysId: string): Promise<CommentRecord[]> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set('sysparm_fields', 'sys_id,ticket,body,author,comment_type,source,sys_created_on')
        searchParams.set('sysparm_query', `ticket=${ticketSysId}^${commentExclusionQuery()}^ORDERBYsys_created_on`)

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

    async listAuditDeltasForTicket(ticketSysId: string): Promise<CommentRecord[]> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set('sysparm_fields', 'sys_id,ticket,body,author,comment_type,source,sys_created_on')
        searchParams.set(
            'sysparm_query',
            `ticket=${ticketSysId}^comment_type=${COMMENT_TYPE_AUDIT_DELTA}^ORDERBYsys_created_on`
        )

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

    async create(ticketSysId: string, body: string, commentType: string): Promise<CommentRecord> {
        const response = await fetch(`/api/now/table/${this.tableName}`, {
            method: 'POST',
            headers: this.jsonHeaders(),
            body: JSON.stringify({
                ticket: ticketSysId,
                body,
                comment_type: commentType,
                source: 'agent',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        const { result } = await response.json()
        return result
    }
}
