import { gs, GlideRecord } from '@servicenow/glide'
import {
    COMMENT_TYPE_AUDIT_DELTA,
    COMMENT_TYPE_INTERNAL,
} from './commentTypes.ts'

const COMMENT_TABLE = 'x_2058901_fresher_ticket_comment'

export interface TicketCommentInput {
    ticketSysId: string
    body: string
    commentType: string
    source: string
    authorSysId?: string
}

export function insertTicketComment(input: TicketCommentInput): string | null {
    const gr = new GlideRecord(COMMENT_TABLE)
    gr.initialize()
    gr.setValue('ticket', input.ticketSysId)
    gr.setValue('body', input.body)
    gr.setValue('comment_type', input.commentType)
    gr.setValue('source', input.source)

    const author = input.authorSysId || gs.getUserID()
    if (author) {
        gr.setValue('author', author)
    }

    return gr.insert() || null
}

export interface ApiFieldChange {
    field: string
    from: string
    to: string
}

export function createApiUpdateInternalNote(ticketSysId: string, changes: ApiFieldChange[]): void {
    if (changes.length === 0) {
        return
    }

    const lines = changes.map((change) => `- ${change.field}: ${change.from || '(empty)'} → ${change.to || '(empty)'}`)
    const body = ['Ticket updated via REST API.', ...lines].join('\n')

    insertTicketComment({
        ticketSysId,
        body,
        commentType: COMMENT_TYPE_INTERNAL,
        source: 'api',
    })
}

export function createAuditDeltaNote(
    ticketSysId: string,
    payload: {
        field: string
        oldValue: string
        newValue: string
        oldDisplay: string
        newDisplay: string
        source: string
    }
): void {
    const body = JSON.stringify({
        field: payload.field,
        old_value: payload.oldValue,
        new_value: payload.newValue,
        old_display: payload.oldDisplay,
        new_display: payload.newDisplay,
        source: payload.source,
    })

    insertTicketComment({
        ticketSysId,
        body,
        commentType: COMMENT_TYPE_AUDIT_DELTA,
        source: 'system',
    })
}

export const UPDATE_SOURCE_SESSION_KEY = 'fresher_update_source'

export function setUpdateSource(source: string): void {
    gs.getSession().putClientData(UPDATE_SOURCE_SESSION_KEY, source)
}

export function clearUpdateSource(): void {
    gs.getSession().putClientData(UPDATE_SOURCE_SESSION_KEY, '')
}

export function resolveUpdateSource(): string {
    const sessionSource = gs.getSession().getClientData(UPDATE_SOURCE_SESSION_KEY)
    if (sessionSource) {
        return sessionSource
    }

    if (gs.getSession().isInteractive()) {
        return 'agent'
    }

    return 'system'
}
