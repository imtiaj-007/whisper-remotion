'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useVideo } from '@/context/video-context'
import type { CaptionStylePreset } from '@/types/caption-styles'
import { CAPTION_STYLE_PRESETS } from '@/types/caption-styles'
import { Type } from 'lucide-react'

const STYLE_LABELS: Record<CaptionStylePreset, string> = {
    'bottom-centered': 'Bottom Centered (Standard)',
    'top-bar': 'Top Bar (News Style)',
    karaoke: 'Karaoke Style',
}

export function CaptionStyleSelector() {
    const { captionStyle, setCaptionStyle } = useVideo()

    const handleStyleChange = (preset: CaptionStylePreset) => {
        setCaptionStyle(CAPTION_STYLE_PRESETS[preset])
    }

    return (
        <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
                <Type className='size-4' />
                Caption Style
            </Label>
            <div className='flex gap-2 flex-wrap'>
                {Object.entries(STYLE_LABELS).map(([preset, label]) => (
                    <Button
                        key={preset}
                        variant={captionStyle.preset === preset ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handleStyleChange(preset as CaptionStylePreset)}
                        className='text-xs'>
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    )
}
