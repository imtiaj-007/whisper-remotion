import { serverSettings } from '@/config/settings'
import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'

export const BUCKET = serverSettings.AWS_BUCKET_NAME

export const s3Instance = new S3Client({
    region: serverSettings.AWS_REGION,
    credentials: {
        accessKeyId: serverSettings.AWS_ACCESS_KEY_ID,
        secretAccessKey: serverSettings.AWS_SECRET_ACCESS_KEY,
    },
})

export async function createUploadUrl(key: string) {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: 'video/mp4',
        })

        const url = await getSignedUrl(s3Instance, command, { expiresIn: 3600 })
        return url
    } catch (error) {
        throw new Error(
            `Failed to create upload URL: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export async function getSignedVideoUrl(key: string) {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })

        return await getSignedUrl(s3Instance, command, { expiresIn: 3600 })
    } catch (error) {
        throw new Error(
            `Failed to get signed video URL: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export async function listVideos() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: 'videos/',
        })

        const res = await s3Instance.send(command)
        return res.Contents || []
    } catch (error) {
        throw new Error(
            `Failed to list videos: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export async function uploadToS3(key: string, content: string) {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: content,
            ContentType: 'application/json',
        })

        await s3Instance.send(command)
    } catch (error) {
        throw new Error(
            `Failed to upload to S3: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}

export async function downloadToTmp(key: string, localPath: string) {
    try {
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
    } catch (error) {
        throw new Error(
            `Failed to download to tmp: ${error instanceof Error ? error.message : String(error)}`
        )
    }
}
