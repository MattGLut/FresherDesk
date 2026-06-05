import { GlideRecord, GlideSysAttachment, gs } from '@servicenow/glide'
import {
    assertAzureBlobConfigured,
    isAzureBlobConfigured,
    loadAzureBlobConfig,
} from '../azure/azureBlobConfig.ts'
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

function buildBlobPath(ticketSysId: string, attachmentSysId: string, fileName: string): string {
    return `${ticketSysId}/${attachmentSysId}/${sanitizeFileName(fileName)}`
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

    if (includeDownloadUrl && isAzureBlobConfigured()) {
        const config = loadAzureBlobConfig()
        const blobPath = gr.getValue('blob_path') || ''
        if (blobPath) {
            const sas = generateReadSasUrl(config, blobPath)
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

export function getAttachmentDownloadUrl(
    ticketSysId: string,
    attachmentSysId: string
): { download_url: string; download_url_expires_at: string } | null {
    const gr = new GlideRecord(ATTACHMENT_TABLE)
    if (!gr.get(attachmentSysId)) {
        return null
    }

    if (gr.getValue('ticket') !== ticketSysId) {
        return null
    }

    const config = loadAzureBlobConfig()
    assertAzureBlobConfigured(config)

    const blobPath = gr.getValue('blob_path') || ''
    if (!blobPath) {
        return null
    }

    const sas = generateReadSasUrl(config, blobPath)
    return {
        download_url: sas.downloadUrl,
        download_url_expires_at: sas.expiresAt,
    }
}

export interface UploadTicketAttachmentInput {
    ticketSysId: string
    fileName: string
    contentType: string
    contentBase64: string
    source: AttachmentSource
}

export function uploadTicketAttachment(input: UploadTicketAttachmentInput): TicketAttachmentDto {
    const config = loadAzureBlobConfig()
    assertAzureBlobConfigured(config)

    const ticket = new GlideRecord(TICKET_TABLE)
    if (!ticket.get(input.ticketSysId)) {
        throw new Error('Ticket not found')
    }

    const fileName = (input.fileName || 'attachment').trim()
    const contentType = (input.contentType || 'application/octet-stream').trim()
    const bytes = decodeBase64(input.contentBase64)

    const gr = new GlideRecord(ATTACHMENT_TABLE)
    gr.initialize()
    gr.setValue('ticket', input.ticketSysId)
    gr.setValue('file_name', fileName)
    gr.setValue('content_type', contentType)
    gr.setValue('blob_container', config.container)
    gr.setValue('source', input.source)
    gr.setValue('size_bytes', bytes.length)

    const attachmentSysId = gr.insert()
    if (!attachmentSysId) {
        throw new Error('Failed to create attachment metadata record')
    }

    const blobPath = buildBlobPath(input.ticketSysId, attachmentSysId, fileName)
    gr.setValue('blob_path', blobPath)
    gr.update()

    try {
        uploadBlob(config, blobPath, contentType, bytes)
    } catch (err) {
        gr.deleteRecord()
        throw err
    }

    if (!gr.get(attachmentSysId)) {
        throw new Error('Failed to reload attachment metadata record')
    }

    return serializeAttachmentRow(gr, true)
}

export function migrateSysAttachmentsToBlob(ticketSysId: string, source: AttachmentSource): void {
    if (!isAzureBlobConfigured()) {
        gs.warn('FresherDesk: Azure Blob not configured; skipping sys_attachment migration')
        return
    }

    const attachmentApi = new GlideSysAttachment()
    const sysAttachments = new GlideRecord('sys_attachment')
    sysAttachments.addQuery('table_name', TICKET_TABLE)
    sysAttachments.addQuery('table_sys_id', ticketSysId)
    sysAttachments.query()

    while (sysAttachments.next()) {
        const fileName = sysAttachments.getValue('file_name') || 'attachment'
        const contentType = sysAttachments.getValue('content_type') || 'application/octet-stream'
        const contentBase64 = attachmentApi.getContentBase64(sysAttachments)
        const attachmentSysId = sysAttachments.getUniqueValue()

        try {
            uploadTicketAttachment({
                ticketSysId,
                fileName,
                contentType,
                contentBase64,
                source,
            })
            attachmentApi.deleteAttachment(attachmentSysId)
        } catch (err) {
            gs.error(`FresherDesk: failed to migrate attachment ${attachmentSysId}: ${String(err)}`)
        }
    }
}
