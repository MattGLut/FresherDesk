import type { PaginatedResult } from '../constants/pagination'

export async function fetchTablePage<T>(
    tableName: string,
    searchParams: URLSearchParams,
    headers: Record<string, string>,
    limit: number,
    offset: number
): Promise<PaginatedResult<T>> {
    searchParams.set('sysparm_limit', String(limit))
    searchParams.set('sysparm_offset', String(offset))

    const response = await fetch(`/api/now/table/${tableName}?${searchParams.toString()}`, {
        method: 'GET',
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
    }

    const { result } = await response.json()
    const items = (result || []) as T[]
    const totalHeader = response.headers.get('X-Total-Count')
    const total = totalHeader != null ? parseInt(totalHeader, 10) || 0 : items.length

    return {
        items,
        total,
        limit,
        offset,
    }
}
