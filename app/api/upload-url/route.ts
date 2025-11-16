import { createUploadUrl } from '@/lib/awsS3'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse<UploadUrlResponse | { error: string }>> {
    try {
        const fileKey = `uploads/videos/${randomUUID()}.mp4`

        const uploadUrl = await createUploadUrl(fileKey)

        return NextResponse.json({ uploadUrl, fileKey })
    } catch (error) {
        console.error('Failed to create upload URL:', error)
        return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
    }
}
