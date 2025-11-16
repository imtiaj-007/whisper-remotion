interface TAppVariables {
    AWS_REGION: string
    AWS_ACCESS_KEY_ID: string
    AWS_SECRET_ACCESS_KEY: string
    AWS_BUCKET_NAME: string
    MODEL_PATH: string

    API_BASE_URL: string
}

export const settings: TAppVariables = {
    AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'whisper-remotion',
    MODEL_PATH: process.env.MODEL_PATH || '/app/models/ggml-base.bin',

    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
}

const requiredVariables: string[] = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']

// Validate that all required environment variables are present (skip during build time)
if (typeof window !== 'undefined') {
    requiredVariables.forEach(key => {
        if (!settings[key as keyof TAppVariables]) {
            console.error(`Missing required environment variable: ${key}`)
            process.exit(1)
        }
    })
}
