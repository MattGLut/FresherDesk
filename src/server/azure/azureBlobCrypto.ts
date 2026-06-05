const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export function decodeBase64(value: string): number[] {
    const normalized = String(value || '').replace(/\s/g, '')
    if (!normalized) {
        return []
    }

    const bytes: number[] = []
    let buffer = 0
    let bits = 0

    for (let i = 0; i < normalized.length; i += 1) {
        const char = normalized.charAt(i)
        if (char === '=') {
            break
        }

        const index = BASE64_CHARS.indexOf(char)
        if (index < 0) {
            continue
        }

        buffer = (buffer << 6) | index
        bits += 6

        if (bits >= 8) {
            bits -= 8
            bytes.push((buffer >> bits) & 0xff)
            buffer &= (1 << bits) - 1
        }
    }

    return bytes
}

export function encodeBase64(bytes: number[]): string {
    if (!bytes.length) {
        return ''
    }

    let output = ''
    let i = 0

    while (i < bytes.length) {
        const byte1 = bytes[i++] ?? 0
        const byte2 = i < bytes.length ? bytes[i++] : NaN
        const byte3 = i < bytes.length ? bytes[i++] : NaN

        const triplet = (byte1 << 16) | ((isNaN(byte2) ? 0 : byte2) << 8) | (isNaN(byte3) ? 0 : byte3)

        output += BASE64_CHARS.charAt((triplet >> 18) & 0x3f)
        output += BASE64_CHARS.charAt((triplet >> 12) & 0x3f)
        output += isNaN(byte2) ? '=' : BASE64_CHARS.charAt((triplet >> 6) & 0x3f)
        output += isNaN(byte3) ? '=' : BASE64_CHARS.charAt(triplet & 0x3f)
    }

    return output
}

function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount))
}

function sha256Bytes(messageBytes: number[]): number[] {
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ]

    const bitLength = messageBytes.length * 8
    const padded: number[] = messageBytes.slice()
    padded.push(0x80)
    while ((padded.length % 64) !== 56) {
        padded.push(0)
    }

    for (let i = 7; i >= 0; i -= 1) {
        padded.push((bitLength / Math.pow(2, i * 8)) & 0xff)
    }

    let h0 = 0x6a09e667
    let h1 = 0xbb67ae85
    let h2 = 0x3c6ef372
    let h3 = 0xa54ff53a
    let h4 = 0x510e527f
    let h5 = 0x9b05688c
    let h6 = 0x1f83d9ab
    let h7 = 0x5be0cd19

    for (let chunkStart = 0; chunkStart < padded.length; chunkStart += 64) {
        const words: number[] = []
        for (let i = 0; i < 16; i += 1) {
            const offset = chunkStart + i * 4
            words[i] =
                ((padded[offset] << 24) |
                    (padded[offset + 1] << 16) |
                    (padded[offset + 2] << 8) |
                    padded[offset + 3]) >>>
                0
        }

        for (let i = 16; i < 64; i += 1) {
            const s0 = rightRotate(words[i - 15], 7) ^ rightRotate(words[i - 15], 18) ^ (words[i - 15] >>> 3)
            const s1 = rightRotate(words[i - 2], 17) ^ rightRotate(words[i - 2], 19) ^ (words[i - 2] >>> 10)
            words[i] = (words[i - 16] + s0 + words[i - 7] + s1) >>> 0
        }

        let a = h0
        let b = h1
        let c = h2
        let d = h3
        let e = h4
        let f = h5
        let g = h6
        let h = h7

        for (let i = 0; i < 64; i += 1) {
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
            const ch = (e & f) ^ (~e & g)
            const temp1 = (h + S1 + ch + K[i] + words[i]) >>> 0
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
            const maj = (a & b) ^ (a & c) ^ (b & c)
            const temp2 = (S0 + maj) >>> 0

            h = g
            g = f
            f = e
            e = (d + temp1) >>> 0
            d = c
            c = b
            b = a
            a = (temp1 + temp2) >>> 0
        }

        h0 = (h0 + a) >>> 0
        h1 = (h1 + b) >>> 0
        h2 = (h2 + c) >>> 0
        h3 = (h3 + d) >>> 0
        h4 = (h4 + e) >>> 0
        h5 = (h5 + f) >>> 0
        h6 = (h6 + g) >>> 0
        h7 = (h7 + h) >>> 0
    }

    const hash: number[] = []
    for (const word of [h0, h1, h2, h3, h4, h5, h6, h7]) {
        hash.push((word >>> 24) & 0xff, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff)
    }

    return hash
}

function stringToUtf8Bytes(value: string): number[] {
    const bytes: number[] = []
    for (let i = 0; i < value.length; i += 1) {
        let codePoint = value.charCodeAt(i)
        if (codePoint >= 0xd800 && codePoint <= 0xdbff && i + 1 < value.length) {
            const next = value.charCodeAt(i + 1)
            if (next >= 0xdc00 && next <= 0xdfff) {
                codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (next - 0xdc00)
                i += 1
            }
        }

        if (codePoint < 0x80) {
            bytes.push(codePoint)
        } else if (codePoint < 0x800) {
            bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
        } else if (codePoint < 0x10000) {
            bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f))
        } else {
            bytes.push(
                0xf0 | (codePoint >> 18),
                0x80 | ((codePoint >> 12) & 0x3f),
                0x80 | ((codePoint >> 6) & 0x3f),
                0x80 | (codePoint & 0x3f)
            )
        }
    }
    return bytes
}

function hmacSha256Bytes(keyBytes: number[], message: string): number[] {
    const blockSize = 64
    let key = keyBytes.slice()

    if (key.length > blockSize) {
        key = sha256Bytes(key)
    }
    while (key.length < blockSize) {
        key.push(0)
    }

    const outerPad: number[] = []
    const innerPad: number[] = []
    for (let i = 0; i < blockSize; i += 1) {
        outerPad.push(key[i] ^ 0x5c)
        innerPad.push(key[i] ^ 0x36)
    }

    const innerMessage = innerPad.concat(stringToUtf8Bytes(message))
    const innerHash = sha256Bytes(innerMessage)
    return sha256Bytes(outerPad.concat(innerHash))
}

export function hmacSha256Base64(keyBytes: number[], message: string): string {
    return encodeBase64(hmacSha256Bytes(keyBytes, message))
}
