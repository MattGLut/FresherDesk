import '@servicenow/sdk/global'
import {
    Table,
    EmailColumn,
    ChoiceColumn,
    OverrideColumn,
    StringColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'

export const x_2058901_fresher_ticket = Table({
    name: 'x_2058901_fresher_ticket',
    label: 'FresherDesk Ticket',
    extends: 'task',
    display: 'short_description',
    allowWebServiceAccess: true,
    autoNumber: {
        prefix: 'TKT',
        number: 1000,
        numberOfDigits: 7,
    },
    schema: {
        requester_email: EmailColumn({
            label: 'Requester Email',
        }),
        source: ChoiceColumn({
            label: 'Source',
            choices: {
                email: 'Email',
                form: 'Form',
                api: 'API',
            },
            default: 'form',
        }),
        category: ChoiceColumn({
            label: 'Category',
            choices: {
                general: 'General',
                billing: 'Billing',
                technical: 'Technical',
                account: 'Account',
            },
            default: 'general',
        }),
        state: ChoiceColumn({
            label: 'Status',
            choices: {
                '1': 'Open',
                '2': 'Pending',
                '6': 'Resolved',
                '7': 'Closed',
            },
            default: '1',
        }),
        priority: OverrideColumn({
            baseTable: 'task',
            default: '3',
        }),
        tags: StringColumn({
            label: 'Tags',
            maxLength: 4000,
            default: '[]',
        }),
        parent: ReferenceColumn({
            label: 'Parent Ticket',
            referenceTable: 'x_2058901_fresher_ticket',
        }),
    },
})
