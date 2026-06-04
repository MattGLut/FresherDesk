import { RESTAPIRequest } from '@servicenow/glide/sn_ws_int'
import { logApiError } from '../auth/validateApiKey.ts'

/**
 * Reads JSON from a Scripted REST POST/PATCH body without throwing on malformed input.
 * Prefer dataString (raw payload) before data (parsed object), which can throw on read.
 */
export function parseRestJsonBody<T>(request: RESTAPIRequest): T | null {
    try {
        const body = request.body
        if (!body) {
            return {} as T
        }

        const raw = body.dataString
        if (typeof raw === 'string' && raw.trim().length > 0) {
            try {
                const parsed = JSON.parse(raw) as unknown
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed as T
                }
            } catch (err) {
                logApiError('parseRestJsonBody', err, `invalid JSON in dataString: ${raw.substring(0, 200)}`)
                return null
            }
        }

        const data = body.data
        if (typeof data === 'object' && data !== null) {
            return data as T
        }

        return {} as T
    } catch (err) {
        logApiError('parseRestJsonBody', err, 'Exception while reading request body')
        return null
    }
}
