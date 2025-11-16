'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { useVideo, type Video } from '@/context/video-context'
import { ArrowUpRightIcon, Captions, FolderCode, Play } from 'lucide-react'
import { useState } from 'react'
import { CaptionStyleSelector } from './caption-style-selector'
import ProcessVideo from './process-video'
import UnifiedVideoPlayer from './unified-video-player'

const VideoCard: React.FC<{
    video: Video
    onPlay: () => void
    onGenerateCaptions: () => void
    isGenerating: boolean
}> = ({ video, onPlay, onGenerateCaptions, isGenerating }) => {
    return (
        <Card className='transition-all hover:shadow-lg'>
            <CardHeader>
                <CardTitle className='truncate text-lg'>{video.name}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
                <div className='flex items-center justify-between text-sm text-muted-foreground'>
                    <span>{video.file?.type || 'video/mp4'}</span>
                    <span>{((video.file?.size || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
                <div className='flex items-center gap-2'>
                    <Badge variant={video.status === 'transcribed' ? 'default' : 'secondary'}>
                        {video.status}
                    </Badge>
                    {video.transcription && video.transcription.length > 0 && (
                        <Badge variant='outline'>
                            <Captions className='size-3 mr-1' />
                            Captions
                        </Badge>
                    )}
                </div>
                <div className='flex gap-2 pt-2'>
                    <Button
                        onClick={onPlay}
                        className='flex-1'
                        size='sm'>
                        <Play className='size-4 mr-2' />
                        Play
                    </Button>
                    {video.status === 'uploaded' && (
                        <Button
                            onClick={onGenerateCaptions}
                            variant='outline'
                            size='sm'
                            disabled={isGenerating}
                            className='flex-1'>
                            <Captions className='size-4 mr-2' />
                            {isGenerating ? 'Generating...' : 'Generate Captions'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function VideosList() {
    const { videos, currentVideo, setCurrentVideo, generateCaption, loaders } = useVideo()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPlayerOpen, setIsPlayerOpen] = useState(false)

    const handlePlay = (video: Video) => {
        setCurrentVideo(video.id)
        setIsPlayerOpen(true)
    }

    const handleGenerateCaptions = async (video: Video) => {
        setCurrentVideo(video.id)
        await generateCaption()
    }

    return (
        <div className='w-full max-w-7xl mx-auto h-full space-y-6 p-6'>
            {/* Videos List Section */}
            <>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-xl font-semibold'>Your Videos</h3>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Play className='size-4 mr-2' />
                        Upload Video
                    </Button>
                </div>

                {videos?.length ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {videos.map(video => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onPlay={() => handlePlay(video)}
                                onGenerateCaptions={() => handleGenerateCaptions(video)}
                                isGenerating={loaders.captioning && currentVideo?.id === video.id}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <FolderCode />
                            </EmptyMedia>
                            <EmptyTitle>No Videos Yet</EmptyTitle>
                            <EmptyDescription>
                                You haven&apos;t created any projects yet. Get started by creating
                                your first project.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className='flex gap-2'>
                                <Button onClick={() => setIsModalOpen(true)}>Create Video</Button>
                                <Button
                                    variant='outline'
                                    onClick={() => setIsModalOpen(true)}>
                                    Import Video
                                </Button>
                            </div>
                        </EmptyContent>
                        <Button
                            variant='link'
                            asChild
                            className='text-muted-foreground'
                            size='sm'>
                            <a href='#'>
                                Learn More <ArrowUpRightIcon />
                            </a>
                        </Button>
                    </Empty>
                )}
            </>

            {/* Fullscreen Video Player Dialog */}
            <Dialog
                open={isPlayerOpen}
                onOpenChange={setIsPlayerOpen}>
                <DialogContent
                    className='max-w-full md:max-w-lg lg:max-w-5xl'
                    showCloseButton={true}>
                    <DialogHeader className='p-6 pb-4 shrink-0 space-y-4'>
                        <DialogTitle>{currentVideo?.name || 'Video Player'}</DialogTitle>
                        {currentVideo?.transcription && currentVideo.transcription.length > 0 && (
                            <CaptionStyleSelector />
                        )}
                    </DialogHeader>
                    <div className='flex-1 overflow-hidden px-6 pb-6 min-h-0'>
                        <UnifiedVideoPlayer />
                    </div>
                </DialogContent>
            </Dialog>

            <ProcessVideo
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    )
}
