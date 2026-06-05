import { GlideDateTime } from '@servicenow/glide'
import { AzureBlobConfig, getBlobEndpoint } from './azureBlobConfig.ts'
import { decodeBase64, encodeBase64, hmacSha256Base64 } from './azureBlobCrypto.ts'

const SAS_VERSION = '2020-12-06'

function formatUtcIso(date: GlideDateTime): string {
    const value = date.getValue()
    if (!value) {
        return ''
    }
    return `${value.replace(' ', 'T')}Z`
}

function encodeURIComponentRFC3986(value: string): string {
    return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

export interface ReadSasResult {
    downloadUrl: string
    expiresAt: string
}

export function generateReadSasUrl(
    config: AzureBlobConfig,
    blobPath: string,
    referenceTime?: GlideDateTime
): ReadSasResult {
    const now = referenceTime || new GlideDateTime()
    const expires = new GlideDateTime()
    expires.setValue(now.getValue())
    expires.addSeconds(config.sasTtlMinutes * 60)

    const signedStart = formatUtcIso(now)
    const signedExpiry = formatUtcIso(expires)
    const canonicalizedResource = `/blob/${config.storageAccount}/${config.container}/${blobPath}`

    const stringToSign = [
        'r',
        signedStart,
        signedExpiry,
        canonicalizedResource,
        '',
        '',
        'https',
        SAS_VERSION,
        'b',
        '',
        '',
        '',
        '',
        '',
        '',
    ].join('\n')

    const keyBytes = decodeBase64(config.accountKey)
    const signature = encodeURIComponentRFC3986(hmacSha256Base64(keyBytes, stringToSign))

    const query = [
        `sp=r`,
        `st=${encodeURIComponentRFC3986(signedStart)}`,
        `se=${encodeURIComponentRFC3986(signedExpiry)}`,
        `spr=https`,
        `sv=${SAS_VERSION}`,
        `sr=b`,
        `sig=${signature}`,
    ].join('&')

    return {
        downloadUrl: `${getBlobEndpoint(config, blobPath)}?${query}`,
        expiresAt: expires.getDisplayValue() || signedExpiry.replace('T', ' ').replace('Z', ''),
    }
}

export function decodeAccountKey(config: AzureBlobConfig): number[] {
    return decodeBase64(config.accountKey)
}

export { encodeBase64 }
