import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKeyOrAgent,
    forbiddenResponse,
    notFoundResponse,
    badRequestResponse,
    serviceUnavailableResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { isAzureBlobConfigured } from '../azure/azureBlobConfig.ts'
import { findTicketByIdOrNumber } from '../tickets/ticketLookup.ts'
import { uploadTicketAttachment } from '../tickets/ticketAttachments.ts'

interface UploadAttachmentBody {
    file_name?: unknown
    content_type?: unknown
    content_base64?: unknown
}

function parseRequestBody(request: RESTAPIRequest): UploadAttachmentBody {
    const envelope = request.body
    if (!envelope) {
        return {}
    }

    const data = envelope.data
    if (data && typeof data === 'object') {
        return data as UploadAttachmentBody
    }

    if (typeof data === 'string' && data) {
        try {
            return JSON.parse(data) as UploadAttachmentBody
        } catch {
            return {}
        }
    }

    if (typeof envelope.dataString === 'string' && envelope.dataString) {
        try {
            return JSON.parse(envelope.dataString) as UploadAttachmentBody
        } catch {
            return {}
        }
    }

    return {}
}

export function uploadTicketAttachmentHandler(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        if (!validateApiKeyOrAgent(request)) {
            setJsonResponse(response, 403, forbiddenResponse())
            return
        }

        if (!isAzureBlobConfigured()) {
            setJsonResponse(
                response,
                503,
                serviceUnavailableResponse('Azure Blob storage is not configured on this instance')
            )
            return
        }

        const id = request.pathParams.id
        if (!id) {
            setJsonResponse(response, 400, notFoundResponse('Ticket'))
            return
        }

        const ticket = findTicketByIdOrNumber(id)
        if (!ticket) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        const body = parseRequestBody(request)
        const fileName = typeof body.file_name === 'string' ? body.file_name.trim() : ''
        const contentBase64 = typeof body.content_base64 === 'string' ? body.content_base64.trim() : ''
        const contentType =
            typeof body.content_type === 'string' && body.content_type.trim()
                ? body.content_type.trim()
                : 'application/octet-stream'

        if (!fileName || !contentBase64) {
            setJsonResponse(response, 400, badRequestResponse('file_name and content_base64 are required'))
            return
        }

        const source = request.getHeader('x-api-key') ? 'api' : 'agent'
        const attachment = uploadTicketAttachment({
            ticketSysId: ticket.getUniqueValue(),
            fileName,
            contentType,
            contentBase64,
            source,
        })

        setJsonResponse(response, 201, { attachment })
    } catch (err) {
        logApiError('uploadTicketAttachment', err)
        setJsonResponse(response, 500, {
            error: { code: 'internal_error', message: String(err) || 'Failed to upload attachment' },
        })
    }
}
