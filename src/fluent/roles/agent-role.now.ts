import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

export const x_2058901_fresher_agent = Role({
    $id: Now.ID['fresher-agent-role'],
    name: 'x_2058901_fresher.agent',
    description: 'Agent access to FresherDesk tickets and comments',
})

export const x_2058901_fresher_admin = Role({
    $id: Now.ID['fresher-admin-role'],
    name: 'x_2058901_fresher.admin',
    description: 'Administrative access to FresherDesk including API keys',
    containsRoles: [x_2058901_fresher_agent],
})
