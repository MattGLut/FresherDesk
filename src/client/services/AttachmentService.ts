declare global {
    interface Window {
        g_ck: string
    }
}

const ATTACHMENT_TABLE = 'x_2058901_fresher_ticket_attachment'
const API_BASE = '/api/x_2058901_fresher/v1/tickets/tickets'

export interface AttachmentRecord {
    sys_id: unknown
    file_name: unknown
    size_bytes: unknown
    content_type: unknown
    sys_created_on: unknown
}

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : ''
            const commaIndex = result.indexOf(',')
            resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
        }
        reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

export class AttachmentService {
    private headers(): Record<string, string> {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-UserToken': window.g_ck,
        }
    }

    async list(ticketSysId: string): Promise<AttachmentRecord[]> {
        const searchParams = new URLSearchParams()
        searchParams.set('sysparm_display_value', 'all')
        searchParams.set('sysparm_fields', 'sys_id,file_name,size_bytes,content_type,sys_created_on')
        searchParams.set('sysparm_query', `ticket=${ticketSysId}^ORDERBYsys_created_on`)

        const response = await fetch(`/api/now/table/${ATTACHMENT_TABLE}?${searchParams.toString()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-UserToken': window.g_ck,
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || `HTTP error ${response.status}`)
        }

        const { result } = await response.json()
        return result || []
    }

    async upload(ticketSysId: string, file: File): Promise<unknown> {
        const contentBase64 = await readFileAsBase64(file)
        const response = await fetch(`${API_BASE}/${ticketSysId}/attachments`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify({
                file_name: file.name,
                content_type: file.type || 'application/octet-stream',
                content_base64: contentBase64,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || errorData.result?.error?.message || `HTTP error ${response.status}`)
        }

        return response.json()
    }

    async getDownloadUrl(ticketSysId: string, attachmentSysId: string): Promise<string> {
        const response = await fetch(`${API_BASE}/${ticketSysId}/attachments/${attachmentSysId}/download`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-UserToken': window.g_ck,
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || errorData.result?.error?.message || `HTTP error ${response.status}`)
        }

        const payload = await response.json()
        const result = payload.result || payload
        return result.download_url
    }
}
