import { GlideRecord } from '@servicenow/glide'
import { getTicketTableName, isTicketNumber } from './ticketQueries.ts'

export function findTicketByIdOrNumber(id: string): GlideRecord<'x_2058901_fresher_ticket'> | null {
    if (!id) {
        return null
    }

    const gr = new GlideRecord(getTicketTableName())

    if (isTicketNumber(id)) {
        gr.addQuery('number', id.toUpperCase())
        gr.query()
        return gr.next() ? gr : null
    }

    return gr.get(id) ? gr : null
}
