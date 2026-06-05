import { RESTAPIRequest } from '@servicenow/glide/sn_ws_int'

export function parseRestJsonBody<T extends Record<string, unknown>>(request: RESTAPIRequest): T {
    const envelope = request.body
    if (!envelope) {
        return {} as T
    }

    if (typeof envelope.dataString === 'string' && envelope.dataString.trim()) {
        try {
            return JSON.parse(envelope.dataString) as T
        } catch {
            // fall through
        }
    }

    const data = envelope.data
    if (data && typeof data === 'object') {
        return data as T
    }

    if (typeof data === 'string' && data.trim()) {
        try {
            return JSON.parse(data) as T
        } catch {
            return {} as T
        }
    }

    return {} as T
}
