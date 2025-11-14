import { settings } from '@/config/settings'
import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'

export const BUCKET = settings.AWS_BUCKET_NAME

export const s3Instance = new S3Client({
    region: settings.AWS_REGION,
    credentials: {
        accessKeyId: settings.AWS_ACCESS_KEY_ID,
        secretAccessKey: settings.AWS_SECRET_ACCESS_KEY,
    },
})

export async function createUploadUrl(key: string) {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: 'video/mp4',
    })

    const url = await getSignedUrl(s3Instance, command, { expiresIn: 3600 })
    return url
}

export async function getSignedVideoUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    })

    return await getSignedUrl(s3Instance, command, { expiresIn: 3600 })
}

export async function listVideos() {
    const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: 'videos/',
    })

    const res = await s3Instance.send(command)
    return res.Contents || []
}

export async function downloadToTmp(key: string, localPath: string) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    })
    const data = await s3Instance.send(command)

    return new Promise<void>((resolve, reject) => {
        const write = fs.createWriteStream(localPath)
        if (data.Body && typeof (data.Body as NodeJS.ReadableStream).pipe === 'function') {
            ;(data.Body as NodeJS.ReadableStream).pipe(write)
        } else {
            reject(new Error('Response body is not a readable stream'))
            return
        }
        write.on('finish', () => resolve())
        write.on('error', reject)
    })
}
