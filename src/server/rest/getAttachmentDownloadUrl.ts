import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKeyOrAgent,
    forbiddenResponse,
    notFoundResponse,
    serviceUnavailableResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { isAzureBlobConfigured } from '../azure/azureBlobConfig.ts'
import { findTicketByIdOrNumber } from '../tickets/ticketLookup.ts'
import { getAttachmentDownloadUrl } from '../tickets/ticketAttachments.ts'

export function getAttachmentDownloadUrlHandler(request: RESTAPIRequest, response: RESTAPIResponse): void {
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
    } catch (err) {
        logApiError('getAttachmentDownloadUrl', err)
        setJsonResponse(response, 500, {
            error: { code: 'internal_error', message: 'Failed to generate download URL' },
        })
    }
}
