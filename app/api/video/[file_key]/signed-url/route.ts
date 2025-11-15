import { getSignedVideoUrl } from '@/lib/awsS3'
import { NextResponse } from 'next/server'

interface SignedUrlResponse {
    url: string
}

export async function GET(
    _: Request,
    { params }: { params: Promise<{ file_key: string }> }
): Promise<NextResponse<SignedUrlResponse | { error: string }>> {
    try {
        const { file_key } = await params

        const key = decodeURIComponent(file_key)
        const url = await getSignedVideoUrl(key)
        return NextResponse.json({ url })
    } catch (error) {
        console.error('Failed to get signed video URL:', error)
        return NextResponse.json({ error: 'Failed to get signed video URL' }, { status: 500 })
    }
}
