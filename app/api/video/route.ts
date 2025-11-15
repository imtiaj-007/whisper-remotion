import { listVideos } from '@/lib/awsS3'
import { _Object } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

interface VideoResponse {
    videos: _Object[]
}

export async function GET(): Promise<NextResponse<VideoResponse | { error: string }>> {
    try {
        const videos = await listVideos()
        return NextResponse.json({ videos })
    } catch (error) {
        console.error('Failed to list videos:', error)
        return NextResponse.json({ error: 'Failed to list videos' }, { status: 500 })
    }
}
