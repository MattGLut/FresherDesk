import { AzureBlobConfig, getBlobEndpoint } from './azureBlobConfig.ts'
import { decodeBase64, hmacSha256Base64 } from './azureBlobCrypto.ts'

const SAS_VERSION = '2020-12-06'

function formatUtcIso(date: Date): string {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function formatDisplayExpiry(date: Date): string {
    const pad = (value: number) => (value < 10 ? `0${value}` : String(value))
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

function encodeURIComponentRFC3986(value: string): string {
    return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
}

export interface ReadSasResult {
    downloadUrl: string
    expiresAt: string
}

export function generateReadSasUrl(config: AzureBlobConfig, blobPath: string): ReadSasResult {
    const now = new Date()
    const expires = new Date(now.getTime() + config.sasTtlMinutes * 60 * 1000)

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
        '',
    ].join('\n')

    const signature = encodeURIComponentRFC3986(hmacSha256Base64(decodeBase64(config.accountKey), stringToSign))
    const query = [
        'sp=r',
        `st=${encodeURIComponentRFC3986(signedStart)}`,
        `se=${encodeURIComponentRFC3986(signedExpiry)}`,
        'spr=https',
        `sv=${SAS_VERSION}`,
        'sr=b',
        `sig=${signature}`,
    ].join('&')

    return {
        downloadUrl: `${getBlobEndpoint(config, blobPath)}?${query}`,
        expiresAt: formatDisplayExpiry(expires),
    }
}
