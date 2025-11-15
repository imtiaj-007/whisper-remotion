import { settings } from '@/config/settings'
import { exec } from 'child_process'
import fs from 'fs'

export interface WhisperResult {
    text: string
    segments: Array<{
        start: number
        end: number
        text: string
    }>
    language: string
}

export function runWhisper(audioPath: string): Promise<WhisperResult> {
    const modelPath = settings.MODEL_PATH

    return new Promise<WhisperResult>((resolve, reject) => {
        try {
            const cmd = `whisper-cli -m ${modelPath} -f ${audioPath} -of /tmp/output --output-json --no-gpu`
            exec(cmd, err => {
                try {
                    if (err) return reject(err)

                    const result = fs.readFileSync('/tmp/output.json', 'utf8')
                    const parsedResult: WhisperResult = JSON.parse(result)
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
