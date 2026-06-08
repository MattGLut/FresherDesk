import { ADMIN_ROLE } from '../constants/roles'

declare global {
    interface Window {
        g_ck: string
    }
}

export interface CurrentUser {
    sysId: string
    name: string
}

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

    async getCurrentUser(): Promise<CurrentUser | null> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set('sysparm_fields', 'sys_id,name')
        searchParams.set('sysparm_limit', '1')
        searchParams.set('sysparm_query', 'sys_id=javascript:gs.getUserID()')

        const response = await fetch(`/api/now/table/sys_user?${searchParams.toString()}`, {
            method: 'GET',
            headers: this.headers(),
        })

        if (!response.ok) {
            return null
        }

        const { result } = await response.json()
        if (!Array.isArray(result) || result.length === 0) {
            return null
        }

        const record = result[0]
        const sysId = record?.sys_id
        if (sysId == null || sysId === '') {
            return null
        }

        const nameField = record?.name
        const name =
            typeof nameField === 'object' && nameField !== null && 'display_value' in nameField
                ? String(nameField.display_value || nameField.value || 'You')
                : String(nameField || 'You')

        return {
            sysId: typeof sysId === 'object' && sysId !== null && 'value' in sysId ? String(sysId.value) : String(sysId),
            name: name || 'You',
        }
    }

    async getCurrentUserSysId(): Promise<string | null> {
        const user = await this.getCurrentUser()
        return user?.sysId ?? null
    }
}
