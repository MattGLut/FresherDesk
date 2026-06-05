import { GlideRecord } from '@servicenow/glide'
import { createInitialEmailComment } from '../tickets/ticketSerializer.ts'

const TICKET_TABLE = 'x_2058901_fresher_ticket'

interface InboundEmailLogger {
    info?: (message: string) => void
    warn?: (message: string) => void
}

interface InboundEmailWrapper {
    origfrom?: string
    body_text?: string
    body?: string
    subject?: string
    saveAttachments?: (record: GlideRecord) => void
}

function resolveRequester(fromAddress: string): { userId: string; email: string } {
    const email = (fromAddress || '').trim().toLowerCase()
    if (!email) {
        return { userId: '', email: '' }
    }

    const userGr = new GlideRecord('sys_user')
    userGr.addQuery('email', email)
    userGr.query()
    if (userGr.next()) {
        return { userId: userGr.getUniqueValue(), email }
    }

    return { userId: '', email }
}

function saveEmailAttachments(
    email: InboundEmailWrapper,
    current: GlideRecord<'x_2058901_fresher_ticket'>,
    logger?: InboundEmailLogger
): void {
    if (typeof email.saveAttachments !== 'function') {
        return
    }

    try {
        email.saveAttachments(current)
    } catch (err) {
        logger?.warn?.(`Failed to save email attachments: ${String(err)}`)
    }
}

export function createTicketFromEmail(...args: unknown[]): void {
    const current = args[0] as GlideRecord<'x_2058901_fresher_ticket'>
    const email = args[2] as InboundEmailWrapper
    const logger = args[3] as InboundEmailLogger | undefined

    const fromAddress = email.origfrom || ''
    const requester = resolveRequester(fromAddress)
    const subject = email.subject || 'No Subject'
    const body = email.body_text || email.body || ''

    current.setValue('short_description', subject.substring(0, 160))
    current.setValue('description', body)
    current.setValue('requester_email', requester.email)
    if (requester.userId) {
        current.setValue('opened_by', requester.userId)
    }
    current.setValue('source', 'email')
    current.setValue('state', '1')
    current.setValue('priority', '3')
    current.setValue('category', 'general')

    saveEmailAttachments(email, current, logger)
}

export function createEmailCommentAfterInsert(
    current: GlideRecord<'x_2058901_fresher_ticket'>
): void {
    if (current.getValue('source') !== 'email') {
        return
    }

    const body = current.getValue('description') || ''
    if (!body) {
        return
    }

    const authorId = current.getValue('opened_by') || ''
    createInitialEmailComment(current.getUniqueValue(), body, authorId || undefined)
}

export { TICKET_TABLE }
