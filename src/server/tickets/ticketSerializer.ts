import { GlideRecord } from '@servicenow/glide'
import { mapStateToStatus, mapPriorityToLabel } from './ticketQueries.ts'

const COMMENT_TABLE = 'x_2058901_fresher_ticket_comment'
const TICKET_TABLE = 'x_2058901_fresher_ticket'

export interface UserDto {
    id: string
    name: string
    email: string
}

export interface CommentDto {
    id: string
    type: string
    body: string
    author: UserDto | null
    source: string
    created_at: string
}

export interface AttachmentDto {
    id: string
    file_name: string
    size_bytes: number
    content_type: string
    created_at: string
}

export interface TicketDto {
    id: string
    number: string
    subject: string
    description: string
    status: string
    priority: string
    category: string
    source: string
    requester: { email: string; name: string; id: string | null }
    assignee: UserDto | null
    opened_at: string
    updated_at: string
    comments: CommentDto[]
    attachments: AttachmentDto[]
}

function serializeUser(gr: GlideRecord<'sys_user'> | null, sysId: string): UserDto | null {
    if (!sysId) {
        return null
    }
    const user = gr || new GlideRecord('sys_user')
    if (!gr && !user.get(sysId)) {
        return { id: sysId, name: '', email: '' }
    }
    return {
        id: sysId,
        name: user.getDisplayValue('name') || '',
        email: user.getValue('email') || '',
    }
}

function loadComments(ticketSysId: string): CommentDto[] {
    const comments: CommentDto[] = []
    const gr = new GlideRecord(COMMENT_TABLE)
    gr.addQuery('ticket', ticketSysId)
    gr.orderBy('sys_created_on')
    gr.query()

    while (gr.next()) {
        const authorId = gr.getValue('author') || ''
        comments.push({
            id: gr.getUniqueValue(),
            type: gr.getValue('comment_type') || 'public_reply',
            body: gr.getValue('body') || '',
            author: serializeUser(null, authorId),
            source: gr.getValue('source') || 'agent',
            created_at: gr.getDisplayValue('sys_created_on') || '',
        })
    }

    return comments
}

function loadAttachments(ticketSysId: string): AttachmentDto[] {
    const attachments: AttachmentDto[] = []
    const gr = new GlideRecord('sys_attachment')
    gr.addQuery('table_name', TICKET_TABLE)
    gr.addQuery('table_sys_id', ticketSysId)
    gr.orderBy('sys_created_on')
    gr.query()

    while (gr.next()) {
        attachments.push({
            id: gr.getUniqueValue(),
            file_name: gr.getValue('file_name') || '',
            size_bytes: parseInt(gr.getValue('size_bytes') || '0', 10),
            content_type: gr.getValue('content_type') || '',
            created_at: gr.getDisplayValue('sys_created_on') || '',
        })
    }

    return attachments
}

export function serializeTicket(gr: GlideRecord<'x_2058901_fresher_ticket'>, includeRelated = true): TicketDto {
    const ticketId = gr.getUniqueValue()
    const openedBy = gr.getValue('opened_by') || ''
    const assignedTo = gr.getValue('assigned_to') || ''
    const requesterEmail = gr.getValue('requester_email') || ''

    let requesterName = ''
    if (openedBy) {
        const userGr = new GlideRecord('sys_user')
        if (userGr.get(openedBy)) {
            requesterName = userGr.getDisplayValue('name') || ''
        }
    }

    const ticket: TicketDto = {
        id: ticketId,
        number: gr.getValue('number') || '',
        subject: gr.getValue('short_description') || '',
        description: gr.getValue('description') || '',
        status: mapStateToStatus(gr.getValue('state') || '1'),
        priority: mapPriorityToLabel(gr.getValue('priority') || '3'),
        category: gr.getValue('category') || 'general',
        source: gr.getValue('source') || 'form',
        requester: {
            email: requesterEmail,
            name: requesterName,
            id: openedBy || null,
        },
        assignee: serializeUser(null, assignedTo),
        opened_at: gr.getDisplayValue('opened_at') || gr.getDisplayValue('sys_created_on') || '',
        updated_at: gr.getDisplayValue('sys_updated_on') || '',
        comments: [],
        attachments: [],
    }

    if (includeRelated) {
        ticket.comments = loadComments(ticketId)
        ticket.attachments = loadAttachments(ticketId)
    }

    return ticket
}

export function createInitialEmailComment(ticketSysId: string, body: string, authorSysId: string): void {
    const gr = new GlideRecord(COMMENT_TABLE)
    gr.initialize()
    gr.setValue('ticket', ticketSysId)
    gr.setValue('body', body)
    gr.setValue('author', authorSysId)
    gr.setValue('comment_type', 'public_reply')
    gr.setValue('source', 'email')
    gr.insert()
}
