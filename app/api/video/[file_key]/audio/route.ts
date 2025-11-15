import { downloadToTmp } from '@/lib/awsS3'
import { convertVideoToWav } from '@/utils/ffmpeg'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

interface AudioExtractionResponse {
    audioPath: string
}

export async function POST(
    _: Request,
    { params }: { params: Promise<{ file_key: string }> }
): Promise<NextResponse<AudioExtractionResponse | { error: string }>> {
    try {
        const { file_key } = await params

        const key = decodeURIComponent(file_key)

        const uniqueKey = randomUUID()
        const videoPath = `/tmp/video-${uniqueKey}.mp4`
        const audioPath = `/tmp/audio-${uniqueKey}.wav`

        await downloadToTmp(key, videoPath)
        await convertVideoToWav(videoPath, audioPath)

        return NextResponse.json({ audioPath })
    } catch (error) {
        console.error('Failed to extract audio:', error)
        return NextResponse.json({ error: 'Failed to extract audio' }, { status: 500 })
    }
}
