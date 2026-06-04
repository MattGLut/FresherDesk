import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { listTickets } from '../../server/rest/listTickets'
import { getTicket } from '../../server/rest/getTicket'
import { updateTicket } from '../../server/rest/updateTicket'

RestApi({
    $id: Now.ID['tickets-rest-api'],
    name: 'FresherDesk Tickets API',
    serviceId: 'tickets',
    consumes: 'application/json',
    produces: 'application/json',
    enforceAcl: [],
    versions: [
        {
            $id: Now.ID['tickets-api-v1'],
            version: 1,
            isDefault: true,
            shortDescription: 'FresherDesk ticket API v1',
        },
    ],
    routes: [
        {
            $id: Now.ID['tickets-list-route'],
            path: '/tickets',
            method: 'GET',
            script: listTickets,
            authorization: false,
            authentication: false,
            internalRole: false,
            version: 1,
            shortDescription: 'List tickets with optional filters',
        },
        {
            $id: Now.ID['tickets-get-route'],
            path: '/tickets/{id}',
            method: 'GET',
            script: getTicket,
            authorization: false,
            authentication: false,
            internalRole: false,
            version: 1,
            shortDescription: 'Get a single ticket by sys_id or number',
        },
        {
            $id: Now.ID['tickets-update-route'],
            path: '/tickets/{id}',
            method: 'PATCH',
            script: updateTicket,
            authorization: false,
            authentication: false,
            internalRole: false,
            version: 1,
            shortDescription: 'Update ticket status, subject, or description',
        },
    ],
})
