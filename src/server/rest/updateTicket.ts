import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int'
import {
    validateApiKey,
    unauthorizedResponse,
    notFoundResponse,
    badRequestResponse,
    setJsonResponse,
    logApiError,
} from '../auth/validateApiKey.ts'
import { serializeTicket } from '../tickets/ticketSerializer.ts'
import { mapStatusToState } from '../tickets/ticketQueries.ts'
import { findTicketByIdOrNumber } from '../tickets/ticketLookup.ts'
import {
    createApiUpdateInternalNote,
    setUpdateSource,
    clearUpdateSource,
    type ApiFieldChange,
} from '../tickets/ticketComments.ts'

interface UpdateTicketBody {
    status?: unknown
    subject?: unknown
    title?: unknown
    description?: unknown
}

function parseRequestBody(request: RESTAPIRequest): UpdateTicketBody {
    const body = request.body as { data?: unknown; dataString?: string } | undefined
    if (!body) {
        return {}
    }

    if (typeof body.data === 'object' && body.data !== null) {
        return body.data as UpdateTicketBody
    }

    if (typeof body.dataString === 'string' && body.dataString) {
        try {
            return JSON.parse(body.dataString) as UpdateTicketBody
        } catch {
            return {}
        }
    }

    return {}
}

function asOptionalString(value: unknown): string | undefined {
    if (value == null) {
        return undefined
    }

    const normalized = String(value).trim()
    return normalized.length > 0 ? normalized : undefined
}

function statusLabel(stateValue: string): string {
    switch (stateValue) {
        case '1':
            return 'open'
        case '2':
            return 'pending'
        case '6':
            return 'resolved'
        case '7':
            return 'closed'
        default:
            return stateValue
    }
}

export function updateTicket(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        if (!validateApiKey(request)) {
            setJsonResponse(response, 401, unauthorizedResponse())
            return
        }

        const id = request.pathParams.id
        if (!id) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        const gr = findTicketByIdOrNumber(id)
        if (!gr) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        const body = parseRequestBody(request)
        const changes: ApiFieldChange[] = []
        const updates: Record<string, string> = {}
        let providedFieldCount = 0

        const subject = asOptionalString(body.subject) ?? asOptionalString(body.title)
        if (body.subject !== undefined || body.title !== undefined) {
            providedFieldCount += 1
            if (subject !== undefined) {
                if (subject.length > 160) {
                    setJsonResponse(response, 400, badRequestResponse('subject must be 160 characters or fewer'))
                    return
                }
                const current = gr.getValue('short_description') || ''
                if (subject !== current) {
                    changes.push({ field: 'subject', from: current, to: subject })
                    updates.short_description = subject
                }
            }
        }

        if (body.description !== undefined) {
            providedFieldCount += 1
            const description = asOptionalString(body.description) ?? ''
            const current = gr.getValue('description') || ''
            if (description !== current) {
                changes.push({ field: 'description', from: current, to: description })
                updates.description = description
            }
        }

        if (body.status !== undefined) {
            providedFieldCount += 1
            const status = asOptionalString(body.status)
            if (!status) {
                setJsonResponse(
                    response,
                    400,
                    badRequestResponse('status must be one of: open, pending, resolved, closed')
                )
                return
            }

            const stateValue = mapStatusToState(status)
            if (!stateValue) {
                setJsonResponse(
                    response,
                    400,
                    badRequestResponse('status must be one of: open, pending, resolved, closed')
                )
                return
            }

            const current = gr.getValue('state') || ''
            if (stateValue !== current) {
                changes.push({ field: 'status', from: statusLabel(current), to: status.toLowerCase() })
                updates.state = stateValue
            }
        }

        if (providedFieldCount === 0) {
            setJsonResponse(response, 400, badRequestResponse('Provide at least one updatable field: status, subject, description'))
            return
        }

        if (Object.keys(updates).length === 0) {
            setJsonResponse(response, 200, { ticket: serializeTicket(gr) })
            return
        }

        const ticketSysId = gr.getUniqueValue()
        setUpdateSource('api')

        for (const [field, value] of Object.entries(updates)) {
            gr.setValue(field, value)
        }

        gr.update()
        createApiUpdateInternalNote(ticketSysId, changes)
        clearUpdateSource()

        const refreshed = findTicketByIdOrNumber(ticketSysId)
        if (!refreshed) {
            setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to retrieve updated ticket' } })
            return
        }

        setJsonResponse(response, 200, { ticket: serializeTicket(refreshed) })
    } catch (err) {
        clearUpdateSource()
        logApiError('updateTicket', err)
        setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to update ticket' } })
    }
}
