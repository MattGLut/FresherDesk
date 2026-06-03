import { GlideRecord } from '@servicenow/glide'
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    unauthorizedResponse,
    notFoundResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { serializeTicket } from '../tickets/ticketSerializer.ts'
import { isTicketNumber, getTicketTableName } from '../tickets/ticketQueries.ts'

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

        const gr = new GlideRecord(getTicketTableName())
        let found = false

        if (isTicketNumber(id)) {
            gr.addQuery('number', id.toUpperCase())
            gr.query()
            found = gr.next()
        } else {
            found = gr.get(id)
        }

        if (!found) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        setJsonResponse(response, 200, { ticket: serializeTicket(gr) })
    } catch (err) {
        logApiError('getTicket', err)
        setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to retrieve ticket' } })
    }
}
