import type { CommentRecord } from '../services/CommentService'

export const OPTIMISTIC_COMMENT_PREFIX = 'optimistic:'

export function createOptimisticComment(
    ticketSysId: string,
    body: string,
    commentType: string,
    authorName: string
): CommentRecord {
    return {
        sys_id: `${OPTIMISTIC_COMMENT_PREFIX}${Date.now()}`,
        ticket: ticketSysId,
        body,
        author: authorName,
        comment_type: commentType,
        source: 'agent',
        sys_created_on: 'Sending…',
    }
}

export function isOptimisticComment(comment: { sys_id?: unknown }): boolean {
    const id = String(comment.sys_id ?? '')
    return id.startsWith(OPTIMISTIC_COMMENT_PREFIX)
}

export function getOptimisticCommentId(comment: { sys_id?: unknown }): string {
    return String(comment.sys_id ?? '')
}
