import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, DateTimeColumn } from '@servicenow/sdk/core'

export const x_2058901_fresher_api_key = Table({
    name: 'x_2058901_fresher_api_key',
    label: 'FresherDesk API Key',
    display: 'name',
    allowWebServiceAccess: true,
    schema: {
        name: StringColumn({
            label: 'Name',
            mandatory: true,
            maxLength: 100,
        }),
        key_hash: StringColumn({
            label: 'Key Hash',
            mandatory: true,
            maxLength: 64,
            readOnly: true,
        }),
        active: BooleanColumn({
            label: 'Active',
            default: true,
        }),
        last_used: DateTimeColumn({
            label: 'Last Used',
            readOnly: true,
        }),
    },
})
