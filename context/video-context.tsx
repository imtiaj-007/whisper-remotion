'use client'

import type { CaptionStyleConfig } from '@/types/caption-styles'
import { CAPTION_STYLE_PRESETS } from '@/types/caption-styles'
import { createContext, ReactNode, useContext, useState } from 'react'
import { toast } from 'sonner'

export interface Video {
    id: string
    name: string
    file: File | null
    presignedUrl: string | null
    audioPath: string | null
    transcription: WhisperResult['transcription'] | null
    status: 'idle' | 'uploading' | 'uploaded' | 'processing' | 'transcribed' | 'error'
}

interface LoadingStates {
    uploading: boolean
    captioning: boolean
    importing: boolean
    downloading: boolean
}

interface VideoContextType {
    loaders: LoadingStates
    videos: Video[]
    currentVideo: Video | null
    captionStyle: CaptionStyleConfig
    addVideo: (file: File) => void
    generateCaption: () => void
    setCaptionStyle: (style: CaptionStyleConfig) => void
    setPresignedUrl: (videoId: string, url: string) => void
    setAudioPath: (videoId: string, path: string) => void
    setTranscription: (videoId: string, transcription: Video['transcription']) => void
    setStatus: (videoId: string, status: Video['status']) => void
    setCurrentVideo: (videoId: string) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function VideoProvider({ children }: { children: ReactNode }) {
    const [videos, setVideos] = useState<Video[]>([])
    const [loaders, setLoaders] = useState<LoadingStates>({
        uploading: false,
        captioning: false,
        importing: false,
        downloading: false,
    })
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
    const [captionStyle, setCaptionStyle] = useState<CaptionStyleConfig>(
        CAPTION_STYLE_PRESETS['bottom-centered']
    )

    const getAxiosClient = async () => {
        const { default: axiosClient } = await import('@/lib/axios')
        return axiosClient
    }

    const addVideo = async (file: File) => {
        try {
            setLoaders(prev => ({ ...prev, uploading: true }))
            const result = await getUploadUrl()
            if (!result) return

            const success = await uploadFiletoS3(result.uploadUrl, file)
            if (!success) return

            const newVideo: Video = {
                id: result.fileKey,
                name: file.name,
                file,
                presignedUrl: null,
                audioPath: null,
                transcription: null,
                status: 'uploaded',
            }
            setVideos(prev => [...prev, newVideo])
            setCurrentVideo(newVideo)
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to add video. Please try again.'
            )
        } finally {
            setLoaders(prev => ({ ...prev, uploading: false }))
        }
    }

    const setPresignedUrl = (videoId: string, url: string) => {
        setVideos(prev =>
            prev.map(video =>
                video.id === videoId ? { ...video, presignedUrl: url, status: 'uploading' } : video
            )
        )
        if (currentVideo?.id === videoId) {
            setCurrentVideo(prev =>
                prev ? { ...prev, presignedUrl: url, status: 'uploading' } : null
            )
        }
    }

    const setAudioPath = (videoId: string, path: string) => {
        setVideos(prev =>
            prev.map(video =>
                video.id === videoId ? { ...video, audioPath: path, status: 'processing' } : video
            )
        )
        if (currentVideo?.id === videoId) {
            setCurrentVideo(prev =>
                prev ? { ...prev, audioPath: path, status: 'processing' } : null
            )
        }
    }

    const setTranscription = (videoId: string, transcription: Video['transcription']) => {
        setVideos(prev =>
            prev.map(video =>
                video.id === videoId ? { ...video, transcription, status: 'transcribed' } : video
            )
        )
        if (currentVideo?.id === videoId) {
            setCurrentVideo(prev =>
                prev ? { ...prev, transcription, status: 'transcribed' } : null
            )
        }
    }

    const setStatus = (videoId: string, status: Video['status']) => {
        setVideos(prev => prev.map(video => (video.id === videoId ? { ...video, status } : video)))
        if (currentVideo?.id === videoId) {
            setCurrentVideo(prev => (prev ? { ...prev, status } : null))
        }
    }

    const setCurrentVideoById = (videoId?: string) => {
        if (!videoId) {
            setCurrentVideo(null)
        } else {
            const video = videos.find(v => v.id === videoId)
            setCurrentVideo(video || null)
        }
    }

    const getUploadUrl = async (): Promise<UploadUrlResponse | null> => {
        try {
            const axiosClient = await getAxiosClient()
            const res = await axiosClient.get('/upload-url')
            return res.data
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to get upload url')
            return null
        }
    }

    const uploadFiletoS3 = async (presignedUrl: string, file: File): Promise<boolean> => {
        try {
            const axiosClient = await getAxiosClient()
            await axiosClient.put(presignedUrl, file)
            return true
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to upload the file to S3')
            return false
        }
    }

    const generateCaption = async (): Promise<void> => {
        try {
            setLoaders(prev => ({ ...prev, captioning: true }))
            if (!currentVideo || !currentVideo.id) return

            const axiosClient = await getAxiosClient()
            const encodedFilekey = encodeURIComponent(currentVideo?.id)
            const audioRes = await axiosClient.post(`/video/${encodedFilekey}/audio`)
            if (!audioRes.data) throw new Error('Failed to extract audio')

            const transcribedRes = await axiosClient.post(
                `video/${encodedFilekey}/transcription`,
                audioRes.data as AudioExtractionResponse
            )
            setVideos(prev =>
                prev.map(video => {
                    if (video.id === currentVideo.id) {
                        video.audioPath = (audioRes.data as AudioExtractionResponse)?.audioPath
                        video.transcription = (
                            transcribedRes.data as TranscriptionResponse
                        )?.transcript?.transcription
                        video.status = 'transcribed'
                        setCurrentVideo(video)
                    }
                    return video
                })
            )
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to get upload url')
        } finally {
            setLoaders(prev => ({ ...prev, captioning: false }))
        }
    }

    const value: VideoContextType = {
        loaders,
        videos,
        currentVideo,
        captionStyle,
        addVideo,
        generateCaption,
        setCaptionStyle,
        setPresignedUrl,
        setAudioPath,
        setTranscription,
        setStatus,
        setCurrentVideo: setCurrentVideoById,
    }

    return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
}

export function useVideo() {
    const context = useContext(VideoContext)
    if (context === undefined) {
        throw new Error('useVideo must be used within a VideoProvider')
    }
    return context
}
