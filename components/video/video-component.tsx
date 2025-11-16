import type { CaptionStyleConfig } from '@/types/caption-styles'
import { CAPTION_STYLE_PRESETS } from '@/types/caption-styles'
import type { Caption } from '@remotion/captions'
import { useEffect, useState } from 'react'
import { AbsoluteFill, Html5Video, useCurrentFrame, useVideoConfig } from 'remotion'
import { CaptionRenderer, waitForCaptionFonts } from './caption-renderer'

export type VideoCompProps = {
    videoUrl: string
    captions: Caption[]
    compWidth?: number
    compHeight?: number
    captionStyle?: CaptionStyleConfig
}

export const VideoComp: React.FC<VideoCompProps> = ({
    videoUrl,
    captions,
    compWidth,
    compHeight,
    captionStyle = CAPTION_STYLE_PRESETS['bottom-centered'],
}) => {
    const frame = useCurrentFrame()
    const { fps, width, height } = useVideoConfig()
    const [fontsLoaded, setFontsLoaded] = useState(false)

    // Load fonts
    useEffect(() => {
        waitForCaptionFonts()
            .then(() => {
                setFontsLoaded(true)
            })
            .catch(err => {
                console.error('Failed to load caption fonts:', err)
                setFontsLoaded(true) // Continue anyway
            })
    }, [])

    // Calculate current time in milliseconds
    const currentTimeMs = (frame / fps) * 1000

    // Find the active caption using Remotion's Caption format
    const activeCaption =
        captions && captions.length > 0
            ? captions.find(c => {
                  return currentTimeMs >= c.startMs && currentTimeMs <= c.endMs
              })
            : null

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#000000',
            }}>
            {/* Video */}
            <Html5Video
                src={videoUrl}
                style={{
                    width: width ?? compWidth ?? 1280,
                    height: height ?? compHeight ?? 720,
                }}
            />

            {/* Caption Overlay */}
            {fontsLoaded && activeCaption && (
                <CaptionRenderer
                    caption={activeCaption}
                    style={captionStyle}
                    currentTimeMs={currentTimeMs}
                    videoWidth={width ?? compWidth ?? 1280}
                    videoHeight={height ?? compHeight ?? 720}
                />
            )}
        </AbsoluteFill>
    )
}
