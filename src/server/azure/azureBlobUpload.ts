/* global Packages */

import { RESTMessageV2 } from '@servicenow/glide/sn_ws'
import { AzureBlobConfig, getBlobEndpoint } from './azureBlobConfig.ts'
import { bytesToIso8859String, decodeBase64, hmacSha256Base64 } from './azureBlobCrypto.ts'

const API_VERSION = '2020-12-06'

function formatRfc1123Date(): string {
    const sdf = new Packages.java.text.SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Packages.java.util.Locale.US)
    sdf.setTimeZone(Packages.java.util.TimeZone.getTimeZone('GMT'))
    return String(sdf.format(new Packages.java.util.Date()))
}

function buildSharedKeyAuthorization(
    config: AzureBlobConfig,
    method: string,
    blobPath: string,
    contentLength: number,
    contentType: string,
    dateHeader: string
): string {
    const canonicalizedResource = `/${config.storageAccount}/${config.container}/${blobPath}`
    const stringToSign = [
        method,
        '',
        '',
        String(contentLength),
        '',
        contentType || 'application/octet-stream',
        dateHeader,
        '',
        '',
        '',
        '',
        '',
        '',
        canonicalizedResource,
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
    request.setRequestHeader('Date', rfcDate)
    request.setRequestHeader('x-ms-version', API_VERSION)
    request.setRequestHeader('x-ms-blob-type', 'BlockBlob')
    request.setRequestHeader(
        'Authorization',
        buildSharedKeyAuthorization(config, 'PUT', blobPath, bytes.length, resolvedContentType, rfcDate)
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
