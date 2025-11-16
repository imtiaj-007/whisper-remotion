// Server-side settings
interface TServerSettings {
    AWS_REGION: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_BUCKET_NAME: string
    MODEL_PATH: string
}

// Client-side settings
interface TClientSettings {
    API_BASE_URL: string
}

// Server settings - only accessible on server
export const serverSettings: TServerSettings = {
    AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'whisper-remotion',
    MODEL_PATH: process.env.MODEL_PATH || '/app/models/ggml-base.bin',
}

// Client settings - safe for browser
export const clientSettings: TClientSettings = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
}

// Validate server settings only on server side
if (typeof window === 'undefined') {
    const requiredVariables: (keyof TServerSettings)[] = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
    ]
    requiredVariables.forEach(key => {
        if (!serverSettings[key]) {
            console.error(`Missing required environment variable: ${key}`)
        }
    })
}

// Legacy export for backward compatibility (server-side only)
export const settings = {
    ...serverSettings,
    ...clientSettings,
} as TServerSettings & TClientSettings
