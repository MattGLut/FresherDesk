/** ServiceNow Rhino global for Java interop (Azure Blob crypto/upload). */
declare const Packages: {
    java: {
        util: {
            Base64: {
                getDecoder(): { decode(value: string): unknown }
                getEncoder(): { encodeToString(value: unknown): string }
            }
            Locale: { US: unknown }
            TimeZone: { getTimeZone(id: string): unknown }
            Date: new () => unknown
        }
        lang: {
            String: new (value: string | unknown, charset?: string) => { getBytes(charset: string): unknown }
            Byte: { TYPE: unknown }
            reflect: {
                Array: {
                    newInstance(type: unknown, length: number): unknown
                }
            }
        }
        text: {
            SimpleDateFormat: new (
                pattern: string,
                locale: unknown
            ) => {
                setTimeZone(timeZone: unknown): void
                format(date: unknown): unknown
            }
        }
    }
    javax: {
        crypto: {
            Mac: {
                getInstance(algorithm: string): {
                    init(key: unknown): void
                    doFinal(data: unknown): unknown
                }
            }
            spec: {
                SecretKeySpec: new (key: unknown, algorithm: string) => unknown
            }
        }
    }
}
