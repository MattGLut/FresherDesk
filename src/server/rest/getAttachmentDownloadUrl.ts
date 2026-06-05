import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    isAgentUser,
    forbiddenResponse,
    notFoundResponse,
    serviceUnavailableResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { isAzureBlobConfigured } from '../azure/azureBlobConfig.ts'
import { findTicketByIdOrNumber } from '../tickets/ticketLookup.ts'
import { getAttachmentDownloadUrl } from '../tickets/ticketAttachments.ts'

function handleDownload(request: RESTAPIRequest, response: RESTAPIResponse, mode: 'agent' | 'api'): void {
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

    const ticketId = request.pathParams.id
    const attachmentId = request.pathParams.attachmentId
    if (!ticketId || !attachmentId) {
        setJsonResponse(response, 400, notFoundResponse('Attachment'))
        return
    }

    const ticket = findTicketByIdOrNumber(ticketId)
    if (!ticket) {
        setJsonResponse(response, 404, notFoundResponse('Ticket'))
        return
    }

    const download = getAttachmentDownloadUrl(ticket.getUniqueValue(), attachmentId)
    if (!download) {
        setJsonResponse(response, 404, notFoundResponse('Attachment'))
        return
    }

    setJsonResponse(response, 200, download)
}

export function getAttachmentDownloadUrlHandler(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        handleDownload(request, response, 'api')
    } catch (err) {
        logApiError('getAttachmentDownloadUrl', err)
        setJsonResponse(response, 500, {
            error: { code: 'internal_error', message: 'Failed to generate download URL' },
        })
    }
}

export function getAttachmentDownloadUrlForAgent(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        handleDownload(request, response, 'agent')
    } catch (err) {
        logApiError('getAttachmentDownloadUrlForAgent', err)
        setJsonResponse(response, 500, {
            error: { code: 'internal_error', message: 'Failed to generate download URL' },
        })
    }
}
