import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    isAgentUser,
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
import { parseRestJsonBody } from './parseRestBody.ts'

interface UploadAttachmentBody extends Record<string, unknown> {
    file_name?: unknown
    content_type?: unknown
    content_base64?: unknown
}

function handleUpload(
    request: RESTAPIRequest,
    response: RESTAPIResponse,
    mode: 'agent' | 'api'
): void {
    if (mode === 'agent') {
        if (!isAgentUser()) {
            setJsonResponse(response, 403, forbiddenResponse())
            return
        }
    } else if (!validateApiKey(request)) {
        setJsonResponse(response, 401, {
            error: { code: 'unauthorized', message: 'Valid X-API-Key header is required' },
        })
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

    const body = parseRestJsonBody<UploadAttachmentBody>(request)
    const fileName = typeof body.file_name === 'string' ? body.file_name.trim() : ''
    const contentBase64 = typeof body.content_base64 === 'string' ? body.content_base64.trim() : ''
    const contentType =
        typeof body.content_type === 'string' && body.content_type.trim()
            ? body.content_type.trim()
            : 'application/octet-stream'

        if (!fileName || !contentBase64) {
            const envelope = request.body
            const debugKeys =
                envelope && envelope.data && typeof envelope.data === 'object'
                    ? Object.keys(envelope.data as Record<string, unknown>).join(',')
                    : 'no-data-object'
            setJsonResponse(
                response,
                400,
                badRequestResponse(
                    `file_name and content_base64 are required (parsed keys: ${debugKeys || Object.keys(body).join(',') || 'none'})`
                )
            )
            return
        }

    const attachment = uploadTicketAttachment({
        ticketSysId: ticket.getUniqueValue(),
        fileName,
        contentType,
        contentBase64,
        source: mode === 'agent' ? 'agent' : 'api',
    })

    setJsonResponse(response, 201, { attachment })
}

export function uploadTicketAttachmentHandler(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        handleUpload(request, response, 'api')
    } catch (err) {
        logApiError('uploadTicketAttachment', err)
        setJsonResponse(response, 500, {
            error: { code: 'internal_error', message: String(err) || 'Failed to upload attachment' },
        })
    }
}

export function uploadTicketAttachmentForAgent(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        handleUpload(request, response, 'agent')
    } catch (err) {
        logApiError('uploadTicketAttachmentForAgent', err)
        setJsonResponse(response, 500, {
            error: { code: 'internal_error', message: String(err) || 'Failed to upload attachment' },
        })
    }
}
