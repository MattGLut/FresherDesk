import { RESTAPIRequest } from '@servicenow/glide/sn_ws_int'
import { logApiError } from '../auth/validateApiKey.ts'

function hasKeys(value: Record<string, unknown>): boolean {
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            return true
        }
    }
    return false
}

function parseJsonValue<T>(value: unknown): T | undefined {
    if (value == null || value === '') {
        return undefined
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>
        return hasKeys(record) ? (record as T) : undefined
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) {
            return undefined
        }

        try {
            const parsed = JSON.parse(trimmed) as unknown
            if (typeof parsed === 'object' && parsed !== null && hasKeys(parsed as Record<string, unknown>)) {
                return parsed as T
            }
        } catch (err) {
            logApiError('parseRestJsonBody', err, `invalid JSON string: ${trimmed.substring(0, 200)}`)
        }
    }

    return undefined
}

/**
 * Reads JSON from a Scripted REST POST/PATCH body.
 * Read dataString before data: touching an empty body.data can consume the stream
 * and leave dataString unreadable (common with curl on Windows).
 */
export function parseRestJsonBody<T>(request: RESTAPIRequest): T {
    try {
        const body = request.body
        if (!body) {
            return {} as T
        }

        const fromString = parseJsonValue<T>(body.dataString)
        if (fromString) {
            return fromString
        }

        const fromData = parseJsonValue<T>(body.data)
        if (fromData) {
            return fromData
        }

        return {} as T
    } catch (err) {
        logApiError('parseRestJsonBody', err, 'Exception while reading request body')
        return {} as T
    }
}
