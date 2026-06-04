import { GlideAggregate, GlideRecord } from '@servicenow/glide'
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    unauthorizedResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { serializeTicket } from '../tickets/ticketSerializer.ts'
import {
    buildTicketFilterQuery,
    getTicketTableName,
    parseLimit,
    parseOffset,
    queryParamAsString,
} from '../tickets/ticketQueries.ts'

function countMatchingTickets(filterQuery: string): number {
    const aggregate = new GlideAggregate(getTicketTableName())
    aggregate.addEncodedQuery(filterQuery)
    aggregate.addAggregate('COUNT')
    aggregate.query()

    if (!aggregate.next()) {
        return 0
    }

    return parseInt(aggregate.getAggregate('COUNT') || '0', 10) || 0
}

export function listTickets(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        if (!validateApiKey(request)) {
            setJsonResponse(response, 401, unauthorizedResponse())
            return
        }

        const queryParams = request.queryParams
        const limit = parseLimit(queryParamAsString(queryParams.limit), 50, 200)
        const offset = parseOffset(queryParamAsString(queryParams.offset))

        const filterQuery = buildTicketFilterQuery({
            status: queryParams.status,
            priority: queryParams.priority,
            assignee: queryParams.assignee,
            tag: queryParams.tag,
            updatedSince: queryParams.updated_since,
        })

        const gr = new GlideRecord(getTicketTableName())
        gr.addEncodedQuery(filterQuery)
        gr.orderByDesc('sys_updated_on')
        const lastRow = offset + limit - 1
        gr.chooseWindow(offset, lastRow < offset ? offset : lastRow, false)
        gr.query()

        const tickets = []
        while (gr.next()) {
            tickets.push(serializeTicket(gr, false))
        }

        const total = countMatchingTickets(filterQuery)

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
