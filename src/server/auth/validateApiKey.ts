import { gs, GlideRecord, GlideDigest, GlideDateTime } from '@servicenow/glide'
import { RESTAPIRequest } from '@servicenow/glide/sn_ws_int'

const API_KEY_TABLE = 'x_2058901_fresher_api_key'
const API_KEY_HEADER = 'x-api-key'

function hashApiKey(apiKey: string): string {
    const digest = new GlideDigest()
    return digest.getSHA256Hex(apiKey)
}

export function validateApiKey(request: RESTAPIRequest): boolean {
    const apiKey = request.getHeader(API_KEY_HEADER)
    if (!apiKey) {
        return false
    }

    const keyHash = hashApiKey(apiKey)
    const gr = new GlideRecord(API_KEY_TABLE)
    gr.addQuery('key_hash', keyHash)
    gr.addQuery('active', true)
    gr.query()

    if (!gr.next()) {
        return false
    }

    gr.setValue('last_used', new GlideDateTime().getDisplayValue())
    gr.update()
    return true
}

export function hashKeyForStorage(apiKey: string): string {
    return hashApiKey(apiKey)
}

export function getApiKeyFromRequest(request: RESTAPIRequest): string | null {
    return request.getHeader(API_KEY_HEADER) || null
}

export function unauthorizedResponse(): { error: { code: string; message: string } } {
    return {
        error: {
            code: 'unauthorized',
            message: 'Valid X-API-Key header is required',
        },
    }
}

export function notFoundResponse(resource: string): { error: { code: string; message: string } } {
    return {
        error: {
            code: 'not_found',
            message: `${resource} not found`,
        },
    }
}

export function badRequestResponse(message: string): { error: { code: string; message: string } } {
    return {
        error: {
            code: 'bad_request',
            message,
        },
    }
}

export function setJsonResponse(response: { setStatus: (code: number) => void; setBody: (body: unknown) => void }, status: number, body: unknown): void {
    response.setStatus(status)
    response.setBody(body)
}

export function logApiError(context: string, err: unknown): void {
    gs.error(`FresherDesk API ${context}: ${String(err)}`)
}
