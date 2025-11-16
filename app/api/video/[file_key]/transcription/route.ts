import { uploadToS3 } from '@/lib/awsS3'
import { runWhisper } from '@/utils/whisper'
import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ file_key: string }> }
): Promise<NextResponse<TranscriptionResponse | { error: string }>> {
    try {
        const { audioPath }: TranscriptionRequest = await request.json()

        if (!audioPath) {
            return NextResponse.json({ error: 'audioPath is required' }, { status: 400 })
        }

        const uniqueKey = randomUUID()
        const transcriptKey = `transcripts/${uniqueKey}.json`
        const tmpTranscriptPath = `/tmp/transcript-${uniqueKey}.json`

        const transcript = await runWhisper(audioPath, tmpTranscriptPath)
        const transcriptContent = JSON.stringify(transcript, null, 2)

        await uploadToS3(transcriptKey, transcriptContent)

        return NextResponse.json({ transcript, transcriptKey })
    } catch (error) {
        console.error('Failed to transcribe audio:', error)
        return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
    }
}
