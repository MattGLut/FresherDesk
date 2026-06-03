import { gs, GlideRecord } from '@servicenow/glide'
import { createInitialEmailComment } from '../tickets/ticketSerializer'

const TICKET_TABLE = 'x_2058901_fresher_ticket'

function resolveRequester(fromAddress: string): { userId: string; email: string } {
    const email = (fromAddress || '').trim().toLowerCase()
    if (!email) {
        return { userId: gs.getUserID(), email: '' }
    }

    const userGr = new GlideRecord('sys_user')
    userGr.addQuery('email', email)
    userGr.query()
    if (userGr.next()) {
        return { userId: userGr.getUniqueValue(), email }
    }

    return { userId: gs.getUserID(), email }
}

export function createTicketFromEmail(...args: unknown[]): void {
    const current = args[0] as GlideRecord<'x_2058901_fresher_ticket'>
    const email = args[2] as {
        origfrom?: string
        body_text?: string
        body?: string
        subject?: string
    }

    const fromAddress = email.origfrom || ''
    const requester = resolveRequester(fromAddress)
    const subject = email.subject || 'No Subject'
    const body = email.body_text || email.body || ''

    current.setValue('short_description', subject.substring(0, 160))
    current.setValue('description', body)
    current.setValue('requester_email', requester.email)
    current.setValue('opened_by', requester.userId)
    current.setValue('source', 'email')
    current.setValue('state', '1')
    current.setValue('priority', '3')
    current.setValue('category', 'general')
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

    const authorId = current.getValue('opened_by') || gs.getUserID()
    createInitialEmailComment(current.getUniqueValue(), body, authorId)
}

export { TICKET_TABLE }
