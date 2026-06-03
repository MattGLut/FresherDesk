import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    unauthorizedResponse,
    notFoundResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { serializeTicket } from '../tickets/ticketSerializer.ts'
import { findTicketByIdOrNumber } from '../tickets/ticketLookup.ts'

export function getTicket(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        if (!validateApiKey(request)) {
            setJsonResponse(response, 401, unauthorizedResponse())
            return
        }

        const id = request.pathParams.id
        if (!id) {
            setJsonResponse(response, 400, notFoundResponse('Ticket'))
            return
        }

        const gr = findTicketByIdOrNumber(id)
        if (!gr) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        setJsonResponse(response, 200, { ticket: serializeTicket(gr) })
    } catch (err) {
        logApiError('getTicket', err)
        setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to retrieve ticket' } })
    }
}
