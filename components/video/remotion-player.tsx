'use client'

import { Player, PlayerRef } from '@remotion/player'
import { ComponentType, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { CaptionStyleConfig } from '@/types/caption-styles'
import type { Caption } from '@remotion/captions'
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import type { VideoCompProps } from './video-component'

interface RemotionPlayerProps {
    comp: ComponentType<VideoCompProps>
    durationInFrames: number
    width?: number
    height?: number
    fps?: number
    inputProps: {
        videoUrl: string
        captions: Caption[]
        captionStyle?: CaptionStyleConfig
    }
    className?: string
}

export function RemotionPlayer({
    comp,
    durationInFrames,
    width = 1280,
    height = 720,
    fps = 30,
    inputProps,
    className,
}: RemotionPlayerProps) {
    const playerRef = useRef<PlayerRef>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [frame, setFrame] = useState(0)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Sync frame with player
    useEffect(() => {
        if (!playerRef.current) return

        const interval = setInterval(() => {
            const currentFrame = playerRef.current?.getCurrentFrame() ?? 0
            setFrame(currentFrame)
            setIsPlaying(playerRef.current?.isPlaying() ?? false)
        }, 100)

        return () => clearInterval(interval)
    }, [])

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // Toggle play
    const togglePlay = () => {
        if (!playerRef.current) return
        setIsPlaying(p => {
            if (p) {
                playerRef.current!.pause()
            } else {
                playerRef.current!.play()
            }
            return !p
        })
    }

    // Seek
    const onSeek = (value: number[]) => {
        const newFrame = value[0]
        playerRef.current?.seekTo(newFrame)
        setFrame(newFrame)
    }

    // Volume
    const updateVolume = (value: number[]) => {
        const v = value[0]
        setVolume(v)
        playerRef.current?.setVolume(v)
    }

    const toggleMute = () => {
        setMuted(m => {
            if (m) playerRef.current?.unmute()
            else playerRef.current?.mute()
            return !m
        })
    }

    // Speed
    const changeSpeed = (value: string) => {
        const speed = Number(value)
        setPlaybackRate(speed)
        // Note: Remotion Player doesn't support playback rate directly
        // This is stored in state for potential future use
    }

    // Fullscreen
    const toggleFullscreen = () => {
        const el = document.getElementById('remotion-player-container')

        if (!document.fullscreenElement) {
            el?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault()
                togglePlay()
            }
            if (e.code === 'ArrowRight') {
                playerRef.current?.seekTo(frame + fps * 2)
            }
            if (e.code === 'ArrowLeft') {
                playerRef.current?.seekTo(frame - fps * 2)
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [frame, fps])

    return (
        <div
            id='remotion-player-container'
            className={`relative rounded-lg overflow-hidden bg-black ${className}`}
            style={{
                width: '100%',
                maxWidth: width,
                aspectRatio: `${width}/${height}`,
                margin: '0 auto',
            }}>
            {/* Player */}
            <Player
                ref={playerRef}
                component={comp}
                durationInFrames={durationInFrames}
                compositionWidth={width}
                compositionHeight={height}
                fps={fps}
                inputProps={inputProps}
                loop={false}
                controls={false}
                clickToPlay={false}
                acknowledgeRemotionLicense
                style={{ width: '100%', height: '100%' }}
            />

            {/* Overlay UI */}
            <div className='absolute bottom-0 left-0 right-0 bg-black/60 p-4 flex flex-col gap-3'>
                {/* Timeline */}
                <Slider
                    min={0}
                    max={durationInFrames}
                    step={1}
                    value={[frame]}
                    onValueChange={onSeek}
                    className='cursor-pointer'
                />

                {/* Bottom Controls */}
                <div className='flex items-center justify-between text-white'>
                    {/* Left Section */}
                    <div className='flex items-center gap-3'>
                        <Button
                            variant='ghost'
                            className='text-white hover:bg-white/10'
                            onClick={togglePlay}
                            size='icon'>
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                        </Button>

                        <Button
                            variant='ghost'
                            className='text-white hover:bg-white/10'
                            onClick={toggleMute}
                            size='icon'>
                            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </Button>

                        <div className='w-24'>
                            <Slider
                                min={0}
                                max={1}
                                step={0.05}
                                value={[volume]}
                                onValueChange={updateVolume}
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className='flex items-center gap-3'>
                        <Select
                            value={String(playbackRate)}
                            onValueChange={changeSpeed}>
                            <SelectTrigger className='w-20 h-8 bg-white/10 border-none text-white'>
                                <SelectValue placeholder='Speed' />
                            </SelectTrigger>
                            <SelectContent className='bg-neutral-900 text-white'>
                                <SelectItem value='0.5'>0.5x</SelectItem>
                                <SelectItem value='1'>1x</SelectItem>
                                <SelectItem value='1.5'>1.5x</SelectItem>
                                <SelectItem value='2'>2x</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant='ghost'
                            className='text-white hover:bg-white/10'
                            onClick={toggleFullscreen}
                            size='icon'>
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
