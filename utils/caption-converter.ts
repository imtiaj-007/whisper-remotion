import type { Caption } from '@remotion/captions'

/**
 * Converts WhisperResult transcription format to Remotion Caption format
 */
export function convertWhisperToRemotionCaptions(
    whisperTranscription: WhisperResult['transcription']
): Caption[] {
    if (!whisperTranscription || whisperTranscription.length === 0) {
        console.warn('convertWhisperToRemotionCaptions: No transcription provided')
        return []
    }

    const converted: Caption[] = []

    for (const item of whisperTranscription) {
        // Parse timestamp strings in format "00:00:00,000" to milliseconds
        const parseTimestamp = (timestamp: string): number => {
            const [timePart, msPart] = timestamp.split(',')
            const [hours, minutes, seconds] = timePart.split(':').map(Number)
            return (hours * 3600 + minutes * 60 + seconds) * 1000 + Number(msPart)
        }

        const startMs = parseTimestamp(item.timestamps.from)
        const endMs = parseTimestamp(item.timestamps.to)

        // Validate timestamps
        if (isNaN(startMs) || isNaN(endMs)) {
            console.warn('Invalid timestamp in caption:', item)
            continue
        }

        const timestampMs: number | null = item.offsets
            ? (item.offsets.from + item.offsets.to) / 2
            : (startMs + endMs) / 2

        converted.push({
            text: item.text || '',
            startMs,
            endMs,
            timestampMs,
            confidence: null,
        })
    }

    console.log('convertWhisperToRemotionCaptions: Converted', converted.length, 'captions')
    if (converted.length > 0) {
        console.log('First caption:', converted[0])
    }

    return converted
}
