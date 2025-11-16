export type CaptionStylePreset = 'bottom-centered' | 'top-bar' | 'karaoke'

export interface CaptionStyleConfig {
    preset: CaptionStylePreset
    position: 'bottom' | 'top' | 'center'
    alignment: 'left' | 'center' | 'right'
    backgroundColor: string
    textColor: string
    borderRadius: number
    horizontalPadding: number
    verticalPadding: number
    maxLines: number
    maxFontSize: number
    fontWeight: string
    boxWidth?: number
    karaokeHighlightColor?: string
}

export const CAPTION_STYLE_PRESETS: Record<CaptionStylePreset, CaptionStyleConfig> = {
    'bottom-centered': {
        preset: 'bottom-centered',
        position: 'bottom',
        alignment: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        textColor: '#ffffff',
        borderRadius: 20,
        horizontalPadding: 12,
        verticalPadding: 12,
        maxLines: 2,
        maxFontSize: 28,
        fontWeight: '700',
    },
    'top-bar': {
        preset: 'top-bar',
        position: 'top',
        alignment: 'left',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff',
        borderRadius: 0,
        horizontalPadding: 12,
        verticalPadding: 12,
        maxLines: 2,
        maxFontSize: 28,
        fontWeight: '600',
        boxWidth: 1280,
    },
    karaoke: {
        preset: 'karaoke',
        position: 'bottom',
        alignment: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        textColor: '#ffffff',
        borderRadius: 25,
        horizontalPadding: 12,
        verticalPadding: 12,
        maxLines: 2,
        maxFontSize: 28,
        fontWeight: '700',
        karaokeHighlightColor: '#ff6b6b',
    },
}
