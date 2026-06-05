import { RESTMessageV2 } from '@servicenow/glide/sn_ws'
import { AzureBlobConfig, getBlobEndpoint } from './azureBlobConfig.ts'
import { decodeBase64, hmacSha256Base64 } from './azureBlobCrypto.ts'

const API_VERSION = '2020-12-06'

function pad2(value: number): string {
    return value < 10 ? `0${value}` : String(value)
}

function formatRfc1123Date(): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const date = new Date()

    return `${days[date.getUTCDay()]}, ${pad2(date.getUTCDate())} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())} GMT`
}

function buildCanonicalizedHeaders(rfcDate: string): string {
    return [`x-ms-blob-type:BlockBlob`, `x-ms-date:${rfcDate}`, `x-ms-version:${API_VERSION}`].join('\n') + '\n'
}

function buildSharedKeyAuthorization(
    config: AzureBlobConfig,
    blobPath: string,
    contentLength: number,
    contentType: string,
    rfcDate: string
): string {
    const canonicalizedResource = `/${config.storageAccount}/${config.container}/${blobPath}`
    const stringToSign = [
        'PUT',
        '',
        '',
        String(contentLength),
        '',
        contentType || 'application/octet-stream',
        '',
        '',
        '',
        '',
        '',
        '',
        buildCanonicalizedHeaders(rfcDate) + canonicalizedResource,
    ].join('\n')

    return `SharedKey ${config.storageAccount}:${hmacSha256Base64(decodeBase64(config.accountKey), stringToSign)}`
}

export function uploadBlobFromAttachment(
    config: AzureBlobConfig,
    blobPath: string,
    contentType: string,
    sysAttachmentId: string,
    contentLength: number
): void {
    const request = new RESTMessageV2()
    request.setHttpMethod('PUT')
    request.setEndpoint(getBlobEndpoint(config, blobPath))

    const rfcDate = formatRfc1123Date()
    const resolvedContentType = contentType || 'application/octet-stream'

    request.setRequestHeader('Content-Type', resolvedContentType)
    request.setRequestHeader('Content-Length', String(contentLength))
    request.setRequestHeader('x-ms-date', rfcDate)
    request.setRequestHeader('x-ms-version', API_VERSION)
    request.setRequestHeader('x-ms-blob-type', 'BlockBlob')
    request.setRequestHeader(
        'Authorization',
        buildSharedKeyAuthorization(config, blobPath, contentLength, resolvedContentType, rfcDate)
    )
    request.setRequestBodyFromAttachment(sysAttachmentId)

    const response = request.execute()
    const status = response.getStatusCode()
    if (status < 200 || status >= 300) {
        throw new Error(`Azure Blob upload failed with status ${status}: ${response.getBody()}`)
    }
}
