import { GlideRecord, GlideSysAttachment, gs } from '@servicenow/glide'
import { isAzureBlobConfigured, loadAzureBlobConfig } from '../azure/azureBlobConfig.ts'
import { uploadBlobFromAttachment } from '../azure/azureBlobUpload.ts'
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

function getMetadataForSysAttachment(sysAttachmentId: string): GlideRecord<'x_2058901_fresher_ticket_attachment'> | null {
    const gr = new GlideRecord(ATTACHMENT_TABLE)
    gr.addQuery('sys_attachment', sysAttachmentId)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr : null
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

function resolveContentLength(sysAttachment: GlideRecord<'sys_attachment'>, attachmentApi: GlideSysAttachment): number {
    const sizeBytes = parseInt(sysAttachment.getValue('size_bytes') || '0', 10)
    if (sizeBytes > 0) {
        return sizeBytes
    }

    return decodeBase64(attachmentApi.getContentBase64(sysAttachment)).length
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
    if (!ticketSysId || !sysAttachmentId) {
        return
    }

    const config = loadAzureBlobConfig()
    const attachmentApi = new GlideSysAttachment()
    const fileName = sysAttachment.getValue('file_name') || 'attachment'
    const contentType = sysAttachment.getValue('content_type') || 'application/octet-stream'
    const contentLength = resolveContentLength(sysAttachment, attachmentApi)
    const source = resolveAttachmentSource(ticketSysId)

    const existingMetadata = getMetadataForSysAttachment(sysAttachmentId)
    if (existingMetadata) {
        return
    }

    const blobPath = buildBlobPath(ticketSysId, sysAttachmentId, fileName)

    uploadBlobFromAttachment(config, blobPath, contentType, sysAttachmentId, contentLength)

    const gr = new GlideRecord(ATTACHMENT_TABLE)
    gr.initialize()
    gr.setValue('ticket', ticketSysId)
    gr.setValue('sys_attachment', sysAttachmentId)
    gr.setValue('file_name', fileName)
    gr.setValue('content_type', contentType)
    gr.setValue('blob_container', config.container)
    gr.setValue('blob_path', blobPath)
    gr.setValue('source', source)
    gr.setValue('size_bytes', contentLength)

    if (!gr.insert()) {
        throw new Error('Failed to create Azure attachment metadata record')
    }
}

export function ensureAttachmentsSyncedForTicket(ticketSysId: string): void {
    if (!isAzureBlobConfigured()) {
        return
    }

    const gr = new GlideRecord('sys_attachment')
    gr.addQuery('table_name', TICKET_TABLE)
    gr.addQuery('table_sys_id', ticketSysId)
    gr.query()

    while (gr.next()) {
        if (!getMetadataForSysAttachment(gr.getUniqueValue())) {
            syncSysAttachmentToAzureSafe(gr)
        }
    }
}

export function syncSysAttachmentToAzureSafe(sysAttachment: GlideRecord<'sys_attachment'>): void {
    try {
        syncSysAttachmentToAzure(sysAttachment)
    } catch (err) {
        gs.error(`FresherDesk: failed to sync sys_attachment ${sysAttachment.getUniqueValue()} to Azure: ${String(err)}`)
    }
}
