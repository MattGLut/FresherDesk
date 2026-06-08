import { AGENT_ROLE } from '../constants/roles'

declare global {
    interface Window {
        g_ck: string
    }
}

export interface AgentRecord {
    sys_id: unknown
    name: unknown
    email: unknown
    user_name: unknown
}

export class AgentService {
    private headers(): Record<string, string> {
        return {
            Accept: 'application/json',
            'X-UserToken': window.g_ck,
        }
    }

    async list(): Promise<AgentRecord[]> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set('sysparm_fields', 'sys_id,name,email,user_name')
        searchParams.set('sysparm_query', `active=true^roles=${AGENT_ROLE}^ORDERBYname`)

        const response = await fetch(`/api/now/table/sys_user?${searchParams.toString()}`, {
            method: 'GET',
            headers: this.headers(),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        const { result } = await response.json()
        return result || []
    }
}
