'use client'

import { VideoProvider } from '@/context/video-context'
import VideosList from './videos-list'

export default function VideoCanvas() {
    return (
        <VideoProvider>
            <VideosList />
        </VideoProvider>
    )
}
