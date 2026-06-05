import { GlideRecord, GlideSysAttachment, gs } from '@servicenow/glide'
import { isAzureBlobConfigured, loadAzureBlobConfig } from '../azure/azureBlobConfig.ts'
import { uploadBlob } from '../azure/azureBlobUpload.ts'
import { generateReadSasUrl } from '../azure/azureBlobSas.ts'
import { decodeBase64 } from '../azure/azureBlobCrypto.ts'

const ATTACHMENT_TABLE = 'x_2058901_fresher_ticket_attachment'
const TICKET_TABLE = 'x_2058901_fresher_ticket'

export type AttachmentSource = 'agent' | 'email' | 'api'

export interface TicketAttachmentDto {
    id: string
    file_name: string
    size_bytes: number
    content_type: string
    created_at: string
    sys_attachment_id?: string
    download_url?: string
    download_url_expires_at?: string
}

function sanitizeFileName(fileName: string): string {
    const sanitized = (fileName || 'attachment')
        .replace(/[^\w.\-()+\s]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 200)
    return sanitized || 'attachment'
}

function buildBlobPath(ticketSysId: string, sysAttachmentId: string, fileName: string): string {
    return `${ticketSysId}/${sysAttachmentId}/${sanitizeFileName(fileName)}`
}

function resolveAttachmentSource(ticketSysId: string): AttachmentSource {
    const ticket = new GlideRecord(TICKET_TABLE)
    if (!ticket.get(ticketSysId)) {
        return 'agent'
    }

    const source = ticket.getValue('source') || ''
    if (source === 'email') {
        return 'email'
    }
    if (source === 'api') {
        return 'api'
    }
    return 'agent'
}

function metadataExistsForSysAttachment(sysAttachmentId: string): boolean {
    const gr = new GlideRecord(ATTACHMENT_TABLE)
    gr.addQuery('sys_attachment', sysAttachmentId)
    gr.setLimit(1)
    gr.query()
    return gr.hasNext()
}

function serializeAttachmentRow(
    gr: GlideRecord<'x_2058901_fresher_ticket_attachment'>,
    includeDownloadUrl: boolean
): TicketAttachmentDto {
    const dto: TicketAttachmentDto = {
        id: gr.getUniqueValue(),
        file_name: gr.getValue('file_name') || '',
        size_bytes: parseInt(gr.getValue('size_bytes') || '0', 10),
        content_type: gr.getValue('content_type') || 'application/octet-stream',
        created_at: gr.getDisplayValue('sys_created_on') || '',
    }

    const sysAttachmentId = gr.getValue('sys_attachment') || ''
    if (sysAttachmentId) {
        dto.sys_attachment_id = sysAttachmentId
    }

    if (includeDownloadUrl && isAzureBlobConfigured()) {
        const blobPath = gr.getValue('blob_path') || ''
        if (blobPath) {
            const sas = generateReadSasUrl(loadAzureBlobConfig(), blobPath)
            dto.download_url = sas.downloadUrl
            dto.download_url_expires_at = sas.expiresAt
        }
    }

    return dto
}

export function loadAttachmentsForTicket(ticketSysId: string, includeDownloadUrl = true): TicketAttachmentDto[] {
    const attachments: TicketAttachmentDto[] = []
    const gr = new GlideRecord(ATTACHMENT_TABLE)
    gr.addQuery('ticket', ticketSysId)
    gr.orderBy('sys_created_on')
    gr.query()

    while (gr.next()) {
        attachments.push(serializeAttachmentRow(gr, includeDownloadUrl))
    }

    return attachments
}

export function syncSysAttachmentToAzure(sysAttachment: GlideRecord<'sys_attachment'>): void {
    if (!isAzureBlobConfigured()) {
        return
    }

    if (sysAttachment.getValue('table_name') !== TICKET_TABLE) {
        return
    }

    const ticketSysId = sysAttachment.getValue('table_sys_id') || ''
    const sysAttachmentId = sysAttachment.getUniqueValue()
    if (!ticketSysId || !sysAttachmentId || metadataExistsForSysAttachment(sysAttachmentId)) {
        return
    }

    const config = loadAzureBlobConfig()
    const attachmentApi = new GlideSysAttachment()
    const fileName = sysAttachment.getValue('file_name') || 'attachment'
    const contentType = sysAttachment.getValue('content_type') || 'application/octet-stream'
    const contentBase64 = attachmentApi.getContentBase64(sysAttachment)
    const bytes = decodeBase64(contentBase64)
    const source = resolveAttachmentSource(ticketSysId)

    const gr = new GlideRecord(ATTACHMENT_TABLE)
    gr.initialize()
    gr.setValue('ticket', ticketSysId)
    gr.setValue('sys_attachment', sysAttachmentId)
    gr.setValue('file_name', fileName)
    gr.setValue('content_type', contentType)
    gr.setValue('blob_container', config.container)
    gr.setValue('source', source)
    gr.setValue('size_bytes', bytes.length)

    const blobPath = buildBlobPath(ticketSysId, sysAttachmentId, fileName)
    gr.setValue('blob_path', blobPath)

    const attachmentSysId = gr.insert()
    if (!attachmentSysId) {
        throw new Error('Failed to create Azure attachment metadata record')
    }

    try {
        uploadBlob(config, blobPath, contentType, bytes)
    } catch (err) {
        gr.deleteRecord()
        throw err
    }
}

export function syncSysAttachmentToAzureSafe(sysAttachment: GlideRecord<'sys_attachment'>): void {
    try {
        syncSysAttachmentToAzure(sysAttachment)
    } catch (err) {
        gs.error(`FresherDesk: failed to sync sys_attachment ${sysAttachment.getUniqueValue()} to Azure: ${String(err)}`)
    }
}
