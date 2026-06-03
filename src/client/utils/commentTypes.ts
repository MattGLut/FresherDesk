export const COMMENT_TYPE_AUDIT_DELTA = 'audit_delta'

export function isAuditDeltaCommentType(type: string): boolean {
    return type === COMMENT_TYPE_AUDIT_DELTA
}

export function isVisibleCommentType(type: string): boolean {
    return !isAuditDeltaCommentType(type)
}

export function commentExclusionQuery(): string {
    return `comment_type!=${COMMENT_TYPE_AUDIT_DELTA}`
}
