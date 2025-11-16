import type { CaptionStyleConfig } from '@/types/caption-styles'
import type { Caption } from '@remotion/captions'
import { loadFont } from '@remotion/google-fonts/NotoSansDevanagari'
import { fitTextOnNLines, measureText } from '@remotion/layout-utils'
import type { TextAlign } from '@remotion/rounded-text-box'
import { createRoundedTextBox } from '@remotion/rounded-text-box'
import React, { useMemo } from 'react'
import { AbsoluteFill } from 'remotion'

const { waitUntilDone, fontFamily } = loadFont('normal', {
    weights: ['600', '700'],
    subsets: ['latin'],
})

interface CaptionRendererProps {
    caption: Caption
    style: CaptionStyleConfig
    currentTimeMs: number
    videoWidth: number
    videoHeight: number
}

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({
    caption,
    style,
    currentTimeMs,
    videoWidth,
}) => {
    // Calculate karaoke progress (0 to 1)
    const karaokeProgress = useMemo(() => {
        if (style.preset !== 'karaoke' || !caption.timestampMs) {
            return null
        }
        const captionDuration = caption.endMs - caption.startMs
        const elapsed = currentTimeMs - caption.startMs
        return Math.max(0, Math.min(1, elapsed / captionDuration))
    }, [currentTimeMs, caption, style.preset])

    // Determine actual box width based on preset
    const actualBoxWidth = useMemo(() => {
        if (style.boxWidth) {
            return Math.min(style.boxWidth, videoWidth)
        }
        return videoWidth * 0.9
    }, [style.boxWidth, videoWidth])

    // Fit text to max lines
    const { fontSize, lines } = fitTextOnNLines({
        maxLines: style.maxLines,
        maxBoxWidth: actualBoxWidth - style.horizontalPadding * 2,
        fontFamily,
        text: caption.text.trim(),
        fontWeight: style.fontWeight,
        maxFontSize: style.maxFontSize,
    })

    // Measure each line of text
    const textMeasurements = useMemo(
        () =>
            lines.map(t =>
                measureText({
                    text: t,
                    fontFamily,
                    fontSize,
                    additionalStyles: {
                        lineHeight: 1.2,
                    },
                    fontVariantNumeric: 'normal',
                    fontWeight: style.fontWeight,
                    letterSpacing: 'normal',
                    textTransform: 'none',
                    validateFontIsLoaded: true,
                })
            ),
        [lines, fontSize, style.fontWeight]
    )

    // Create rounded text box
    const { d, boundingBox } = useMemo(
        () =>
            createRoundedTextBox({
                textMeasurements,
                textAlign: style.alignment as TextAlign,
                horizontalPadding: style.horizontalPadding,
                borderRadius: style.borderRadius,
            }),
        [textMeasurements, style.alignment, style.horizontalPadding, style.borderRadius]
    )

    // Simple container positioning
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent:
            style.position === 'top' ? 'start' : style.position === 'bottom' ? 'end' : 'center',
        alignItems: style.alignment,
        padding: '32px',
    }

    const lineStyle: React.CSSProperties = {
        fontSize,
        fontWeight: style.fontWeight,
        fontFamily,
        lineHeight: 1,
        textAlign: style.alignment,
        paddingLeft: style.horizontalPadding,
        paddingRight: style.horizontalPadding,
        paddingTop: style.verticalPadding / lines.length,
        paddingBottom: style.verticalPadding / lines.length,
        color: style.textColor,
        position: 'relative',
    }

    // For top-bar preset, use full width box
    const boxWidth = style.preset === 'top-bar' ? videoWidth : boundingBox.width

    return (
        <AbsoluteFill style={containerStyle}>
            <div
                style={{
                    width: boxWidth,
                    height: boundingBox.height,
                    position: 'relative',
                }}>
                {/* SVG Background */}
                <svg
                    viewBox={
                        style.preset === 'top-bar'
                            ? `0 0 ${videoWidth} ${boundingBox.height}`
                            : boundingBox.viewBox
                    }
                    style={{
                        position: 'absolute',
                        width: boxWidth,
                        height: boundingBox.height,
                        overflow: 'visible',
                    }}>
                    <path
                        fill={style.backgroundColor}
                        d={d}
                    />
                </svg>

                {/* Text Lines */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}>
                    {lines.map((line, i) => {
                        // For karaoke style, highlight words progressively
                        if (style.preset === 'karaoke' && karaokeProgress !== null) {
                            const words = line.split(' ')
                            const wordsPerLine = words.length
                            const highlightedWords = Math.floor(wordsPerLine * karaokeProgress)

                            return (
                                <div
                                    key={i}
                                    style={lineStyle}>
                                    {words.map((word, wordIndex) => {
                                        const isHighlighted = wordIndex < highlightedWords
                                        return (
                                            <span
                                                key={wordIndex}
                                                style={{
                                                    color: isHighlighted
                                                        ? style.karaokeHighlightColor || '#ff6b6b'
                                                        : style.textColor,
                                                    transition: 'color 0.1s ease',
                                                }}>
                                                {word}
                                                {wordIndex < words.length - 1 ? ' ' : ''}
                                            </span>
                                        )
                                    })}
                                </div>
                            )
                        }

                        // Standard rendering
                        return (
                            <div
                                key={i}
                                style={lineStyle}>
                                {line}
                            </div>
                        )
                    })}
                </div>
            </div>
        </AbsoluteFill>
    )
}

// Export font loading function for use in parent component
export { waitUntilDone as waitForCaptionFonts }
