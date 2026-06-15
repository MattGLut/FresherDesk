import { GlideRecord } from '@servicenow/glide'
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
import { mapStatusToState, mapPriorityToValue, getTicketTableName } from '../tickets/ticketQueries.ts'
import { findTicketByIdOrNumber } from '../tickets/ticketLookup.ts'
import { setUpdateSource, clearUpdateSource } from '../tickets/ticketComments.ts'
import { applyResolvedStateFields } from '../tickets/ticketState.ts'

interface CreateChildTicketBody {
    subject?: unknown
    description?: unknown
    status?: unknown
    priority?: unknown
    category?: unknown
}

function parseRequestBody(request: RESTAPIRequest): CreateChildTicketBody {
    const body = request.body as { data?: unknown; dataString?: string } | undefined
    if (!body) {
        return {}
    }

    if (typeof body.data === 'object' && body.data !== null) {
        return body.data as CreateChildTicketBody
    }

    if (typeof body.dataString === 'string' && body.dataString) {
        try {
            return JSON.parse(body.dataString) as CreateChildTicketBody
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

const VALID_CATEGORIES = new Set(['general', 'billing', 'technical', 'account'])

function parseCategory(value: unknown): string | null {
    const category = asOptionalString(value) ?? 'general'
    const normalized = category.toLowerCase()
    return VALID_CATEGORIES.has(normalized) ? normalized : null
}

export function createChildTicket(request: RESTAPIRequest, response: RESTAPIResponse): void {
    try {
        if (!validateApiKey(request)) {
            setJsonResponse(response, 401, unauthorizedResponse())
            return
        }

        const parentId = request.pathParams.id
        if (!parentId) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        const parent = findTicketByIdOrNumber(parentId)
        if (!parent) {
            setJsonResponse(response, 404, notFoundResponse('Ticket'))
            return
        }

        const body = parseRequestBody(request)
        const subject = asOptionalString(body.subject)
        if (!subject) {
            setJsonResponse(response, 400, badRequestResponse('subject is required'))
            return
        }

        if (subject.length > 160) {
            setJsonResponse(response, 400, badRequestResponse('subject must be 160 characters or fewer'))
            return
        }

        const parentSysId = parent.getUniqueValue()
        const child = new GlideRecord(getTicketTableName())
        child.initialize()
        child.setValue('short_description', subject)
        child.setValue('description', asOptionalString(body.description) ?? '')
        child.setValue('parent', parentSysId)
        child.setValue('source', 'api')
        child.setValue('requester_email', parent.getValue('requester_email') || '')
        child.setValue('opened_by', parent.getValue('opened_by') || '')
        const category = parseCategory(body.category)
        if (!category) {
            setJsonResponse(
                response,
                400,
                badRequestResponse('category must be one of: general, billing, technical, account')
            )
            return
        }
        child.setValue('category', category)

        const status = asOptionalString(body.status)
        if (status) {
            const stateValue = mapStatusToState(status)
            if (!stateValue) {
                setJsonResponse(
                    response,
                    400,
                    badRequestResponse('status must be one of: open, pending, resolved, closed')
                )
                return
            }
            child.setValue('state', stateValue)
        } else {
            child.setValue('state', '1')
        }

        const priority = asOptionalString(body.priority)
        if (priority) {
            const priorityValue = mapPriorityToValue(priority)
            if (!priorityValue) {
                setJsonResponse(
                    response,
                    400,
                    badRequestResponse('priority must be one of: critical, high, medium, low')
                )
                return
            }
            child.setValue('priority', priorityValue)
        }

        setUpdateSource('api')
        applyResolvedStateFields(child, child.getValue('state') || '1')
        const childSysId = child.insert()
        clearUpdateSource()

        if (!childSysId) {
            setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to create child ticket' } })
            return
        }

        const created = findTicketByIdOrNumber(childSysId)
        if (!created) {
            setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to retrieve created ticket' } })
            return
        }

        setJsonResponse(response, 201, { ticket: serializeTicket(created, true) })
    } catch (err) {
        clearUpdateSource()
        logApiError('createChildTicket', err)
        setJsonResponse(response, 500, { error: { code: 'internal_error', message: 'Failed to create child ticket' } })
    }
}
