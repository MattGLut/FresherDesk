import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { x_2058901_fresher_agent, x_2058901_fresher_admin } from '../roles/agent-role.now'

Acl({
    $id: Now.ID['ticket-acl-read'],
    type: 'record',
    table: 'x_2058901_fresher_ticket',
    operation: 'read',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['ticket-acl-create'],
    type: 'record',
    table: 'x_2058901_fresher_ticket',
    operation: 'create',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['ticket-acl-write'],
    type: 'record',
    table: 'x_2058901_fresher_ticket',
    operation: 'write',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['ticket-acl-delete'],
    type: 'record',
    table: 'x_2058901_fresher_ticket',
    operation: 'delete',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['comment-acl-read'],
    type: 'record',
    table: 'x_2058901_fresher_ticket_comment',
    operation: 'read',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['comment-acl-create'],
    type: 'record',
    table: 'x_2058901_fresher_ticket_comment',
    operation: 'create',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['comment-acl-write'],
    type: 'record',
    table: 'x_2058901_fresher_ticket_comment',
    operation: 'write',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['comment-acl-delete'],
    type: 'record',
    table: 'x_2058901_fresher_ticket_comment',
    operation: 'delete',
    decisionType: 'allow',
    roles: [x_2058901_fresher_agent],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['api-key-acl-read'],
    type: 'record',
    table: 'x_2058901_fresher_api_key',
    operation: 'read',
    decisionType: 'allow',
    roles: [x_2058901_fresher_admin],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['api-key-acl-create'],
    type: 'record',
    table: 'x_2058901_fresher_api_key',
    operation: 'create',
    decisionType: 'allow',
    roles: [x_2058901_fresher_admin],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['api-key-acl-write'],
    type: 'record',
    table: 'x_2058901_fresher_api_key',
    operation: 'write',
    decisionType: 'allow',
    roles: [x_2058901_fresher_admin],
    adminOverrides: true,
})

Acl({
    $id: Now.ID['api-key-acl-delete'],
    type: 'record',
    table: 'x_2058901_fresher_api_key',
    operation: 'delete',
    decisionType: 'allow',
    roles: [x_2058901_fresher_admin],
    adminOverrides: true,
})
