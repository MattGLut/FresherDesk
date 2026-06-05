import { gs } from '@servicenow/glide'

const PROPERTY_PREFIX = 'x_2058901_fresher.azure.'

export interface AzureBlobConfig {
    enabled: boolean
    storageAccount: string
    container: string
    accountKey: string
    sasTtlMinutes: number
}

export function loadAzureBlobConfig(): AzureBlobConfig {
    const sasTtlRaw = parseInt(gs.getProperty(`${PROPERTY_PREFIX}sas_ttl_minutes`, '15'), 10)

    return {
        enabled: gs.getProperty(`${PROPERTY_PREFIX}enabled`, 'true') !== 'false',
        storageAccount: (gs.getProperty(`${PROPERTY_PREFIX}storage_account`, '') || '').trim(),
        container: (gs.getProperty(`${PROPERTY_PREFIX}container`, 'ticket-attachments') || 'ticket-attachments').trim(),
        accountKey: (gs.getProperty(`${PROPERTY_PREFIX}account_key`, '') || '').trim(),
        sasTtlMinutes: Number.isNaN(sasTtlRaw) || sasTtlRaw < 1 ? 15 : sasTtlRaw,
    }
}

export function isAzureBlobConfigured(config: AzureBlobConfig = loadAzureBlobConfig()): boolean {
    return config.enabled && !!config.storageAccount && !!config.container && !!config.accountKey
}

export function getBlobEndpoint(config: AzureBlobConfig, blobPath: string): string {
    const encodedPath = blobPath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')
    return `https://${config.storageAccount}.blob.core.windows.net/${config.container}/${encodedPath}`
}
