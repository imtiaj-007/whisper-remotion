'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader } from '@/components/ui/spinner'
import { useVideo } from '@/context/video-context'
import axiosClient from '@/lib/axios'
import type { CaptionStyleConfig } from '@/types/caption-styles'
import { CAPTION_STYLE_PRESETS } from '@/types/caption-styles'
import { convertWhisperToRemotionCaptions } from '@/utils/caption-converter'
import { AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { RemotionPlayer } from './remotion-player'
import { VideoComp } from './video-component'

export default function UnifiedVideoPlayer() {
    const { currentVideo, captionStyle } = useVideo()
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [durationInFrames, setDurationInFrames] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fps = 30

    // Fetch signed URL when video is available
    useEffect(() => {
        const fetchVideoUrl = async () => {
            if (!currentVideo?.id) {
                setVideoUrl(null)
                return
            }

            // If we already have a presigned URL, use it
            if (currentVideo.presignedUrl) {
                setVideoUrl(currentVideo.presignedUrl)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const encodedFilekey = encodeURIComponent(currentVideo.id)
                const response = await axiosClient.get(`/video/${encodedFilekey}/signed-url`)
                const url = response.data.url
                setVideoUrl(url)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load video')
            } finally {
                setLoading(false)
            }
        }

        fetchVideoUrl()
    }, [currentVideo?.id, currentVideo?.presignedUrl])

    // Calculate video duration
    useEffect(() => {
        if (!videoUrl) {
            setDurationInFrames(0)
            return
        }

        const video = document.createElement('video')
        video.preload = 'metadata'
        video.crossOrigin = 'anonymous'
        video.src = videoUrl

        const handleLoadedMetadata = () => {
            const duration = video.duration
            if (duration && isFinite(duration) && duration > 0) {
                setDurationInFrames(Math.floor(duration * fps))
            } else {
                console.warn('Invalid video duration:', duration)
                setError('Failed to get valid video duration')
            }
        }

        const handleError = (e: Event) => {
            console.error('Video metadata loading error:', e, video.error)
            setError(
                video.error
                    ? `Failed to load video: ${video.error.message || 'Unknown error'}`
                    : 'Failed to load video metadata. Please check the video URL.'
            )
        }

        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('error', handleError)

        // Try to load
        video.load()

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('error', handleError)
            video.src = ''
        }
    }, [videoUrl, fps])

    // Convert WhisperResult captions to Remotion Caption format
    const remotionCaptions = useMemo(() => {
        if (!currentVideo?.transcription) {
            return []
        }
        return convertWhisperToRemotionCaptions(currentVideo.transcription)
    }, [currentVideo?.transcription])

    // Get caption style (default to bottom-centered)
    const selectedStyle: CaptionStyleConfig = useMemo(() => {
        return captionStyle || CAPTION_STYLE_PRESETS['bottom-centered']
    }, [captionStyle])

    if (!currentVideo) {
        return null
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <Loader />
                <span className='ml-2'>Loading video...</span>
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!videoUrl || durationInFrames === 0) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <Loader />
                <span className='ml-2'>Preparing video...</span>
            </div>
        )
    }

    return (
        <div className='w-full h-full flex items-center justify-center'>
            <RemotionPlayer
                comp={VideoComp}
                durationInFrames={durationInFrames}
                width={1280}
                height={720}
                fps={fps}
                inputProps={{
                    videoUrl,
                    captions: remotionCaptions,
                    captionStyle: selectedStyle,
                }}
                className='w-full max-w-full'
            />
        </div>
    )
}
