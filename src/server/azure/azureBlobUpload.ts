import { RESTMessageV2 } from '@servicenow/glide/sn_ws'
import { AzureBlobConfig, getBlobEndpoint } from './azureBlobConfig.ts'
import { bytesToIso8859String, decodeBase64, hmacSha256Base64 } from './azureBlobCrypto.ts'

const API_VERSION = '2020-12-06'

function pad2(value: number): string {
    return value < 10 ? `0${value}` : String(value)
}

function formatRfc1123Date(): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const date = new Date()

    const dayName = days[date.getUTCDay()]
    const day = pad2(date.getUTCDate())
    const month = months[date.getUTCMonth()]
    const year = date.getUTCFullYear()
    const hours = pad2(date.getUTCHours())
    const minutes = pad2(date.getUTCMinutes())
    const seconds = pad2(date.getUTCSeconds())

    return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`
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
    const canonicalizedHeaders = buildCanonicalizedHeaders(rfcDate)
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
        canonicalizedHeaders + canonicalizedResource,
    ].join('\n')

    const signature = hmacSha256Base64(decodeBase64(config.accountKey), stringToSign)
    return `SharedKey ${config.storageAccount}:${signature}`
}

export function uploadBlob(
    config: AzureBlobConfig,
    blobPath: string,
    contentType: string,
    bytes: number[]
): void {
    const endpoint = getBlobEndpoint(config, blobPath)
    const request = new RESTMessageV2()
    request.setHttpMethod('PUT')
    request.setEndpoint(endpoint)

    const rfcDate = formatRfc1123Date()
    const resolvedContentType = contentType || 'application/octet-stream'

    request.setRequestHeader('Content-Type', resolvedContentType)
    request.setRequestHeader('Content-Length', String(bytes.length))
    request.setRequestHeader('x-ms-date', rfcDate)
    request.setRequestHeader('x-ms-version', API_VERSION)
    request.setRequestHeader('x-ms-blob-type', 'BlockBlob')
    request.setRequestHeader(
        'Authorization',
        buildSharedKeyAuthorization(config, blobPath, bytes.length, resolvedContentType, rfcDate)
    )

    request.setRequestBody(bytesToIso8859String(bytes))

    const response = request.execute()
    const status = response.getStatusCode()
    if (status < 200 || status >= 300) {
        throw new Error(`Azure Blob upload failed with status ${status}: ${response.getBody()}`)
    }
}

export function uploadBlobFromBase64(
    config: AzureBlobConfig,
    blobPath: string,
    contentType: string,
    contentBase64: string
): number {
    const bytes = decodeBase64(contentBase64)
    uploadBlob(config, blobPath, contentType, bytes)
    return bytes.length
}
