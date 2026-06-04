declare global {
    interface Window {
        g_ck: string
    }
}

const ADMIN_ROLE = 'x_2058901_fresher.admin'

export class UserService {
    private headers(): Record<string, string> {
        return {
            Accept: 'application/json',
            'X-UserToken': window.g_ck,
        }
    }

    async hasRole(roleName: string): Promise<boolean> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_limit', '1')
        searchParams.set('sysparm_query', `user=javascript:gs.getUserID()^role.name=${roleName}`)

        const response = await fetch(`/api/now/table/sys_user_has_role?${searchParams.toString()}`, {
            method: 'GET',
            headers: this.headers(),
        })

        if (!response.ok) {
            return false
        }

        const { result } = await response.json()
        return Array.isArray(result) && result.length > 0
    }

    async isAdmin(): Promise<boolean> {
        return this.hasRole(ADMIN_ROLE)
    }
}
