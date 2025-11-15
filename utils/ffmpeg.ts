import { exec } from 'child_process'

export function convertVideoToWav(videoPath: string, audioPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            const cmd = `ffmpeg -y -i ${videoPath} -vn -acodec pcm_s16le -ar 16000 -ac 1 ${audioPath}`
            exec(cmd, (err: Error | null) => {
                if (err) reject(err)
                else resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}
