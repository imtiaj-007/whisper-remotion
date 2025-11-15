import { settings } from '@/config/settings'
import { exec } from 'child_process'
import fs from 'fs'

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

export function runWhisper(audioPath: string, outputPath: string): Promise<WhisperResult> {
    const modelPath = settings.MODEL_PATH

    return new Promise<WhisperResult>((resolve, reject) => {
        try {
            const cmd = [
                'whisper-cli',
                `-m ${modelPath}`,
                `-f ${audioPath}`,
                `-of ${outputPath.replace('.json', '')}`,
                '-oj',
                '-ng',
                '-nfa',
            ].join(' ')

            exec(cmd, err => {
                try {
                    if (err) return reject(err)

                    const result = fs.readFileSync(outputPath, 'utf8')
                    const parsedResult = JSON.parse(result)
                    resolve(parsedResult)
                } catch (error) {
                    reject(error)
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}
