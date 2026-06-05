/* global Packages */

const BASE64_DECODER = Packages.java.util.Base64.getDecoder()
const BASE64_ENCODER = Packages.java.util.Base64.getEncoder()

export function decodeBase64(value: string): number[] {
    const javaBytes = BASE64_DECODER.decode(String(value)) as { length: number; [index: number]: number }
    const length = javaBytes.length
    const bytes: number[] = []
    for (let i = 0; i < length; i += 1) {
        bytes.push(Number(javaBytes[i]))
    }
    return bytes
}

export function encodeBase64(bytes: number[]): string {
    const javaBytes = Packages.java.lang.reflect.Array.newInstance(Packages.java.lang.Byte.TYPE, bytes.length)
    for (let i = 0; i < bytes.length; i += 1) {
        javaBytes[i] = bytes[i]
    }
    return String(BASE64_ENCODER.encodeToString(javaBytes))
}

export function hmacSha256Base64(keyBytes: number[], message: string): string {
    const Mac = Packages.javax.crypto.Mac
    const SecretKeySpec = Packages.javax.crypto.spec.SecretKeySpec
    const mac = Mac.getInstance('HmacSHA256')
    const keyArray = Packages.java.lang.reflect.Array.newInstance(Packages.java.lang.Byte.TYPE, keyBytes.length)
    for (let i = 0; i < keyBytes.length; i += 1) {
        keyArray[i] = keyBytes[i]
    }
    const keySpec = new SecretKeySpec(keyArray, 'HmacSHA256')
    mac.init(keySpec)
    const messageBytes = new Packages.java.lang.String(String(message)).getBytes('UTF-8')
    const signature = mac.doFinal(messageBytes)
    return String(BASE64_ENCODER.encodeToString(signature))
}

export function bytesToIso8859String(bytes: number[]): string {
    const javaBytes = Packages.java.lang.reflect.Array.newInstance(Packages.java.lang.Byte.TYPE, bytes.length)
    for (let i = 0; i < bytes.length; i += 1) {
        javaBytes[i] = bytes[i]
    }
    return String(new Packages.java.lang.String(javaBytes, 'ISO-8859-1'))
}
