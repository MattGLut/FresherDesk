export const CHILD_TICKET_PAGE_SIZE = 5
export const COMMENT_PAGE_SIZE = 10
export const AUDIT_DELTA_PAGE_SIZE = 10

export interface PaginatedResult<T> {
    items: T[]
    total: number
    limit: number
    offset: number
}

export function totalPages(total: number, pageSize: number): number {
    return Math.max(1, Math.ceil(total / pageSize))
}

export function pageOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize
}
