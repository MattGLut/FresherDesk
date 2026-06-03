declare global {
    interface Window {
        g_ck: string
    }
}

export interface AttachmentRecord {
    sys_id: unknown
    file_name: unknown
    size_bytes: unknown
    content_type: unknown
    sys_created_on: unknown
}

export class AttachmentService {
    private headers(): Record<string, string> {
        return {
            Accept: 'application/json',
            'X-UserToken': window.g_ck,
        }
    }

    async list(tableName: string, tableSysId: string): Promise<AttachmentRecord[]> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set('sysparm_fields', 'sys_id,file_name,size_bytes,content_type,sys_created_on')
        searchParams.set('sysparm_query', `table_name=${tableName}^table_sys_id=${tableSysId}^ORDERBYsys_created_on`)

        const response = await fetch(`/api/now/table/sys_attachment?${searchParams.toString()}`, {
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

    async upload(tableName: string, tableSysId: string, file: File): Promise<unknown> {
        const formData = new FormData()
        formData.append('table_name', tableName)
        formData.append('table_sys_id', tableSysId)
        formData.append('uploadFile', file)

        const response = await fetch('/api/now/attachment/upload', {
            method: 'POST',
            headers: {
                'X-UserToken': window.g_ck,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        return response.json()
    }

    getDownloadUrl(sysId: string): string {
        return `/api/now/attachment/${sysId}/file`
    }
}
