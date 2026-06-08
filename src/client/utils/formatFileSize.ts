import { getValue } from './snValue'

export function formatFileSize(bytes: unknown): string {
    const parsed = parseInt(getValue(bytes), 10)
    if (!Number.isFinite(parsed) || parsed < 0) {
        return ''
    }
    if (parsed < 1024) {
        return `${parsed} B`
    }
    if (parsed < 1024 * 1024) {
        return `${(parsed / 1024).toFixed(1)} KB`
    }
    return `${(parsed / (1024 * 1024)).toFixed(1)} MB`
}
