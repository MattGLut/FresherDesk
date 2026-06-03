export function parseTags(raw: string): string[] {
    if (!raw) {
        return []
    }

    try {
        const parsed = JSON.parse(raw) as unknown
        if (!Array.isArray(parsed)) {
            return []
        }

        return parsed
            .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
            .map((tag) => tag.trim())
    } catch {
        return []
    }
}

export function serializeTags(tags: string[]): string {
    const normalized = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
    return JSON.stringify(normalized)
}

export function buildTagQuery(tag: string): string | null {
    const normalized = tag.trim()
    if (!normalized) {
        return null
    }

    return `tagsLIKE"${normalized}"`
}
