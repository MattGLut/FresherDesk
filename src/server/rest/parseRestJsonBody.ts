import { RESTAPIRequest } from '@servicenow/glide/sn_ws_int'
import { logApiError } from '../auth/validateApiKey.ts'

/**
 * Reads JSON from a Scripted REST POST/PATCH body.
 * For application/json, use request.body.data first — the stream can only be read once,
 * so reading dataString before data can make data throw and leave the body unreadable.
 */
export function parseRestJsonBody<T>(request: RESTAPIRequest): T | null {
    let body
    try {
        body = request.body
    } catch (err) {
        logApiError('parseRestJsonBody', err, 'request.body access failed')
        return null
    }

    if (!body) {
        return {} as T
    }

    try {
        const data = body.data
        if (data != null && data !== '') {
            if (typeof data === 'object') {
                return data as T
            }
            if (typeof data === 'string') {
                const parsed = JSON.parse(data) as unknown
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed as T
                }
            }
        }
    } catch (err) {
        logApiError('parseRestJsonBody', err, 'request.body.data read failed')
    }

    try {
        const raw = body.dataString
        if (typeof raw === 'string' && raw.trim().length > 0) {
            const parsed = JSON.parse(raw) as unknown
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed as T
            }
        }
    } catch (err) {
        logApiError('parseRestJsonBody', err, 'request.body.dataString read failed')
        return null
    }

    return {} as T
}
