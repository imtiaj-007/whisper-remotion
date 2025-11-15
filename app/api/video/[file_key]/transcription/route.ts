import { uploadToS3 } from '@/lib/awsS3'
import { runWhisper } from '@/utils/whisper'
import { randomUUID } from 'crypto'
import fs from 'fs'
import { NextResponse } from 'next/server'

interface TranscriptionResponse {
    transcript: unknown
    transcriptKey: string
}

interface TranscriptionRequest {
    audioPath: string
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ file_key: string }> }
): Promise<NextResponse<TranscriptionResponse | { error: string }>> {
    try {
        const { audioPath }: TranscriptionRequest = await request.json()

        if (!audioPath) {
            return NextResponse.json({ error: 'audioPath is required' }, { status: 400 })
        }

        const transcript = await runWhisper(audioPath)

        const transcriptKey = `transcripts/${randomUUID()}.json`
        const transcriptContent = JSON.stringify(transcript, null, 2)

        await uploadToS3(transcriptKey, transcriptContent)
        fs.writeFileSync(`/tmp/${transcriptKey}`, transcriptContent)

        return NextResponse.json({ transcript, transcriptKey })
    } catch (error) {
        console.error('Failed to transcribe audio:', error)
        return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
    }
}
