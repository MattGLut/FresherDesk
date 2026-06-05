import '@servicenow/sdk/global'
import {
    Table,
    ReferenceColumn,
    StringColumn,
    IntegerColumn,
    ChoiceColumn,
} from '@servicenow/sdk/core'

export const x_2058901_fresher_ticket_attachment = Table({
    name: 'x_2058901_fresher_ticket_attachment',
    label: 'FresherDesk Ticket Attachment',
    display: 'file_name',
    allowWebServiceAccess: true,
    schema: {
        ticket: ReferenceColumn({
            label: 'Ticket',
            referenceTable: 'x_2058901_fresher_ticket',
            mandatory: true,
        }),
        file_name: StringColumn({
            label: 'File Name',
            mandatory: true,
            maxLength: 255,
        }),
        content_type: StringColumn({
            label: 'Content Type',
            maxLength: 255,
            default: 'application/octet-stream',
        }),
        size_bytes: IntegerColumn({
            label: 'Size Bytes',
            default: 0,
        }),
        blob_container: StringColumn({
            label: 'Blob Container',
            maxLength: 255,
            mandatory: true,
        }),
        blob_path: StringColumn({
            label: 'Blob Path',
            maxLength: 1024,
            mandatory: true,
        }),
        source: ChoiceColumn({
            label: 'Source',
            choices: {
                agent: 'Agent',
                email: 'Email',
                api: 'API',
            },
            default: 'agent',
        }),
    },
})
