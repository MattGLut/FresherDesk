import '@servicenow/sdk/global'
import { Table, ReferenceColumn, MultiLineTextColumn, ChoiceColumn } from '@servicenow/sdk/core'

export const x_2058901_fresher_ticket_comment = Table({
    name: 'x_2058901_fresher_ticket_comment',
    label: 'FresherDesk Ticket Comment',
    display: 'body',
    allowWebServiceAccess: true,
    schema: {
        ticket: ReferenceColumn({
            label: 'Ticket',
            referenceTable: 'x_2058901_fresher_ticket',
            mandatory: true,
        }),
        body: MultiLineTextColumn({
            label: 'Body',
            mandatory: true,
            maxLength: 8000,
        }),
        author: ReferenceColumn({
            label: 'Author',
            referenceTable: 'sys_user',
        }),
        comment_type: ChoiceColumn({
            label: 'Comment Type',
            choices: {
                public_reply: 'Public Reply',
                internal_note: 'Internal Note',
            },
            default: 'public_reply',
        }),
        source: ChoiceColumn({
            label: 'Source',
            choices: {
                agent: 'Agent',
                email: 'Email',
                system: 'System',
            },
            default: 'agent',
        }),
    },
})
