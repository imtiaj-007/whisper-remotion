interface WhisperResult {
    systeminfo: string
    model: {
        type: string
        multilingual: boolean
        vocab: number
        audio: {
            ctx: number
            state: number
            head: number
            layer: number
        }
        text: {
            ctx: number
            state: number
            head: number
            layer: number
        }
        mels: number
        ftype: number
    }
    params: {
        model: string
        language: string
        translate: boolean
    }
    result: {
        language: string
    }
    transcription: Array<{
        timestamps: {
            from: string
            to: string
        }
        offsets: {
            from: number
            to: number
        }
        text: string
    }>
}

interface UploadUrlResponse {
    uploadUrl: string
    fileKey: string
}

interface AudioExtractionResponse {
    audioPath: string
}

interface TranscriptionResponse {
    transcript: WhisperResult
    transcriptKey: string
}

interface TranscriptionRequest {
    audioPath: string
}
