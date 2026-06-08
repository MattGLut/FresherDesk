/** Format a term for ServiceNow LIKE/NQ encoded queries. */
export function formatSearchTerm(term: string): string {
    const trimmed = term.trim().replace(/"/g, '')
    if (!trimmed) {
        return ''
    }
    if (/\s|\^/.test(trimmed)) {
        return `"${trimmed}"`
    }
    return trimmed
}

/** Build NQ blocks so search ORs combine correctly with AND filters. */
export function buildSearchEncodedQuery(baseQuery: string, rawTerm: string): string {
    const term = formatSearchTerm(rawTerm)
    if (!term) {
        return baseQuery
    }

    const fields = [`numberLIKE${term}`, `short_descriptionLIKE${term}`, `requester_emailLIKE${term}`]
    const blocks = fields.map((fieldQuery) => (baseQuery ? `${baseQuery}^${fieldQuery}` : fieldQuery))
    return blocks.join('^NQ')
}
