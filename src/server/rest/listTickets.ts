import { GlideRecord } from '@servicenow/glide'
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    unauthorizedResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { serializeTicket } from '../tickets/ticketSerializer.ts'
import {
    buildTicketQuery,
    getTicketTableName,
    parseLimit,
    parseOffset,
} from '../tickets/ticketQueries.ts'

export function listTickets(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        if (!validateApiKey(request)) {
            setJsonResponse(response, 401, unauthorizedResponse())
            return
        }

        const queryParams = request.queryParams
        const limit = parseLimit(queryParams.limit, 50, 200)
        const offset = parseOffset(queryParams.offset)

        const encodedQuery = buildTicketQuery({
            status: queryParams.status,
            priority: queryParams.priority,
            assignee: queryParams.assignee,
            updatedSince: queryParams.updated_since,
        })

        const gr = new GlideRecord(getTicketTableName())
        gr.addEncodedQuery(encodedQuery)
        gr.chooseWindow(offset, offset + limit, false)
        gr.query()

        const tickets = []
        while (gr.next()) {
            tickets.push(serializeTicket(gr, false))
        }

        const countGr = new GlideRecord(getTicketTableName())
        countGr.addEncodedQuery(encodedQuery)
        countGr.query()
        const total = countGr.getRowCount()

        setJsonResponse(response, 200, {
            tickets,
            meta: {
                total,
                limit,
                offset,
            },
        })
    } catch (err) {
        logApiError('listTickets', err)
        setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to list tickets' } })
    }
}
