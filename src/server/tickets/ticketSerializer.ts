import { GlideRecord } from '@servicenow/glide'
import { mapStateToStatus, mapPriorityToLabel } from './ticketQueries.ts'
import { getAllowedNextStates } from '../../shared/ticketStateTransitions.ts'
import { parseTags } from './ticketTags.ts'
import { commentExclusionQuery, isVisibleCommentType } from './commentTypes.ts'
import { isAzureBlobConfigured } from '../azure/azureBlobConfig.ts'
import { loadAttachmentsForTicket, ensureAttachmentsSyncedForTicket } from './ticketAttachments.ts'

const COMMENT_TABLE = 'x_2058901_fresher_ticket_comment'
const TICKET_TABLE = 'x_2058901_fresher_ticket'

export interface UserDto {
    id: string
    name: string
    email: string
    username: string
}

export interface RequesterDto {
    id: string | null
    name: string
    email: string
    username: string
}

export interface AssigneeDto extends UserDto {
    roles: string[]
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
    sys_attachment_id?: string
    download_url?: string
    download_url_expires_at?: string
}

export interface ChildTicketDto {
    id: string
    number: string
    subject: string
    status: string
    priority: string
    updated_at: string
}

export interface TicketDto {
    id: string
    number: string
    subject: string
    description: string
    status: string
    allowed_statuses: string[]
    priority: string
    category: string
    source: string
    tags: string[]
    parent_id: string | null
    requester: RequesterDto
    assignee: AssigneeDto | null
    opened_at: string
    updated_at: string
    children: ChildTicketDto[]
    comments: CommentDto[]
    attachments: AttachmentDto[]
}

function loadUserById(sysId: string): GlideRecord<'sys_user'> | null {
    if (!sysId) {
        return null
    }
    const user = new GlideRecord('sys_user')
    return user.get(sysId) ? user : null
}

function loadUserRoles(userId: string): string[] {
    const roles: string[] = []
    const gr = new GlideRecord('sys_user_has_role')
    gr.addQuery('user', userId)
    gr.query()

    while (gr.next()) {
        const roleName = gr.getDisplayValue('role')
        if (roleName) {
            roles.push(roleName)
        }
    }

    return roles
}

function serializeUserFromRecord(user: GlideRecord<'sys_user'>): UserDto {
    return {
        id: user.getUniqueValue(),
        name: user.getDisplayValue('name') || '',
        email: user.getValue('email') || '',
        username: user.getValue('user_name') || '',
    }
}

function serializeUser(sysId: string): UserDto | null {
    if (!sysId) {
        return null
    }

    const user = loadUserById(sysId)
    if (!user) {
        return { id: sysId, name: '', email: '', username: '' }
    }

    return serializeUserFromRecord(user)
}

function serializeAssignee(sysId: string): AssigneeDto | null {
    const user = serializeUser(sysId)
    if (!user) {
        return null
    }

    return {
        ...user,
        roles: loadUserRoles(user.id),
    }
}

function serializeRequester(openedBy: string, requesterEmail: string): RequesterDto {
    if (openedBy) {
        const user = loadUserById(openedBy)
        if (user) {
            const profile = serializeUserFromRecord(user)
            return {
                id: openedBy,
                name: profile.name,
                username: profile.username,
                email: requesterEmail || profile.email,
            }
        }
    }

    return {
        id: openedBy || null,
        name: '',
        email: requesterEmail,
        username: '',
    }
}

function serializeCommentAuthor(sysId: string): UserDto | null {
    return serializeUser(sysId)
}

function loadComments(ticketSysId: string): CommentDto[] {
    const comments: CommentDto[] = []
    const gr = new GlideRecord(COMMENT_TABLE)
    gr.addQuery('ticket', ticketSysId)
    gr.addEncodedQuery(commentExclusionQuery())
    gr.orderBy('sys_created_on')
    gr.query()

    while (gr.next()) {
        const commentType = gr.getValue('comment_type') || 'public_reply'
        if (!isVisibleCommentType(commentType)) {
            continue
        }

        const authorId = gr.getValue('author') || ''
        comments.push({
            id: gr.getUniqueValue(),
            type: gr.getValue('comment_type') || 'public_reply',
            body: gr.getValue('body') || '',
            author: serializeCommentAuthor(authorId),
            source: gr.getValue('source') || 'agent',
            created_at: gr.getDisplayValue('sys_created_on') || '',
        })
    }

    return comments
}

function loadAttachmentsFromSysAttachment(ticketSysId: string): AttachmentDto[] {
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
            sys_attachment_id: gr.getUniqueValue(),
        })
    }

    return attachments
}

function loadAttachments(ticketSysId: string): AttachmentDto[] {
    if (isAzureBlobConfigured()) {
        ensureAttachmentsSyncedForTicket(ticketSysId)
        const azureAttachments = loadAttachmentsForTicket(ticketSysId, true)
        if (azureAttachments.length > 0) {
            return azureAttachments
        }
    }

    return loadAttachmentsFromSysAttachment(ticketSysId)
}

function loadChildTickets(parentSysId: string): ChildTicketDto[] {
    const children: ChildTicketDto[] = []
    const gr = new GlideRecord(TICKET_TABLE)
    gr.addQuery('parent', parentSysId)
    gr.orderByDesc('sys_updated_on')
    gr.query()

    while (gr.next()) {
        children.push({
            id: gr.getUniqueValue(),
            number: gr.getValue('number') || '',
            subject: gr.getValue('short_description') || '',
            status: mapStateToStatus(gr.getValue('state') || '1'),
            priority: mapPriorityToLabel(gr.getValue('priority') || '3'),
            updated_at: gr.getDisplayValue('sys_updated_on') || '',
        })
    }

    return children
}

export function serializeTicket(gr: GlideRecord<'x_2058901_fresher_ticket'>, includeRelated = true): TicketDto {
    const ticketId = gr.getUniqueValue()
    const openedBy = gr.getValue('opened_by') || ''
    const assignedTo = gr.getValue('assigned_to') || ''
    const requesterEmail = gr.getValue('requester_email') || ''
    const parentId = gr.getValue('parent') || ''

    const currentState = gr.getValue('state') || '1'
    const currentStatus = mapStateToStatus(currentState)
    const allowedStatuses = [
        currentStatus,
        ...getAllowedNextStates(currentState).map((state) => mapStateToStatus(state)),
    ].filter((status, index, values) => values.indexOf(status) === index)

    const ticket: TicketDto = {
        id: ticketId,
        number: gr.getValue('number') || '',
        subject: gr.getValue('short_description') || '',
        description: gr.getValue('description') || '',
        status: currentStatus,
        allowed_statuses: allowedStatuses,
        priority: mapPriorityToLabel(gr.getValue('priority') || '3'),
        category: gr.getValue('category') || 'general',
        source: gr.getValue('source') || 'form',
        tags: parseTags(gr.getValue('tags') || '[]'),
        parent_id: parentId || null,
        requester: serializeRequester(openedBy, requesterEmail),
        assignee: serializeAssignee(assignedTo),
        opened_at: gr.getDisplayValue('opened_at') || gr.getDisplayValue('sys_created_on') || '',
        updated_at: gr.getDisplayValue('sys_updated_on') || '',
        children: [],
        comments: [],
        attachments: [],
    }

    if (includeRelated) {
        ticket.comments = loadComments(ticketId)
        ticket.attachments = loadAttachments(ticketId)
        ticket.children = loadChildTickets(ticketId)
    }

    return ticket
}

export function createInitialEmailComment(ticketSysId: string, body: string, authorSysId?: string): void {
    const gr = new GlideRecord(COMMENT_TABLE)
    gr.initialize()
    gr.setValue('ticket', ticketSysId)
    gr.setValue('body', body)
    if (authorSysId) {
        gr.setValue('author', authorSysId)
    }
    gr.setValue('comment_type', 'public_reply')
    gr.setValue('source', 'email')
    gr.insert()
}
