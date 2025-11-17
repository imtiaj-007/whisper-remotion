import { serverSettings } from '@/config/settings'
import { exec } from 'child_process'
import fs from 'fs'

export function runWhisper(audioPath: string, outputPath: string): Promise<WhisperResult> {
    const modelPath = serverSettings.MODEL_PATH

    return new Promise<WhisperResult>((resolve, reject) => {
        try {
            const cmd = [
                'whisper-cli',
                `-m ${modelPath}`,
                `-f ${audioPath}`,
                `-of ${outputPath.replace('.json', '')}`,
                '-l hi',
                '-sow',
                '-ml 100',
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
