export const COMMENT_TYPE_PUBLIC = 'public_reply'
export const COMMENT_TYPE_INTERNAL = 'internal_note'
export const COMMENT_TYPE_AUDIT_DELTA = 'audit_delta'

export const VISIBLE_COMMENT_TYPES = [COMMENT_TYPE_PUBLIC, COMMENT_TYPE_INTERNAL]

export function isVisibleCommentType(type: string): boolean {
    return VISIBLE_COMMENT_TYPES.includes(type)
}
