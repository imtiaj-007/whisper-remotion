'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader } from '@/components/ui/spinner'
import { useVideo } from '@/context/video-context'
import { ArrowUpFromLine } from 'lucide-react'
import { ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'

interface ProcessVideoProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function ProcessVideo({ open, onOpenChange }: ProcessVideoProps) {
    const { loaders, addVideo } = useVideo()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (
        event: ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }
    ) => {
        const files = event.target.files
        const file = files?.[0]
        if (!file) return

        // Validate file type
        if (file.type !== 'video/mp4') {
            toast.error('Please select an MP4 video file')
            return
        }

        // Validate file size (50MB = 50 * 1024 * 1024 bytes)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be under 50MB')
            return
        }
        setSelectedFile(file)
    }

    const handleUpload = async () => {
        if (!selectedFile) return
        await addVideo(selectedFile)
        // Close dialog after successful upload
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        onOpenChange(false)
    }

    const handleReset = () => {
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md md:max-w-lg lg:max-w-2xl gap-6'>
                <DialogHeader>
                    <DialogTitle>Upload Video</DialogTitle>
                </DialogHeader>

                <div className='w-full min-h-100 flex flex-col gap-6 justify-center'>
                    {!selectedFile ? (
                        <>
                            <div
                                className='flex flex-col items-center gap-4 cursor-pointer border-2 border-dashed border-muted/60 rounded-lg p-8 hover:border-muted/80 transition-colors'
                                onClick={() => !loaders.uploading && fileInputRef.current?.click()}
                                onDrop={e => {
                                    e.preventDefault()
                                    if (!loaders.uploading && e.dataTransfer.files.length > 0) {
                                        handleFileSelect({
                                            target: { files: e.dataTransfer.files },
                                        })
                                    }
                                }}
                                onDragOver={e => e.preventDefault()}
                                onDragEnter={e => {
                                    e.preventDefault()
                                    e.currentTarget.classList.add(
                                        'border-primary/50',
                                        'bg-muted/20'
                                    )
                                }}
                                onDragLeave={e => {
                                    e.preventDefault()
                                    e.currentTarget.classList.remove(
                                        'border-primary/50',
                                        'bg-muted/20'
                                    )
                                }}>
                                <span className='h-40 w-40 bg-muted/80 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors'>
                                    <ArrowUpFromLine
                                        className='size-12'
                                        strokeWidth={3}
                                    />
                                </span>
                                <p>Click or drag & drop to upload video files</p>
                                <p className='text-sm'>MP4 format only, maximum 50MB</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='.mp4,video/mp4'
                                onChange={handleFileSelect}
                                disabled={loaders.uploading}
                                className='hidden'
                                id='video-upload'
                            />
                        </>
                    ) : (
                        <>
                            {/* Video Preview */}
                            <div className='aspect-video overflow-hidden rounded-md border'>
                                <video
                                    src={URL.createObjectURL(selectedFile)}
                                    controls
                                    className='h-full w-full object-cover'
                                />
                            </div>
                            <div className='w-full flex items-center justify-between text-sm'>
                                <span className='font-medium'>{selectedFile.name}</span>
                                <span className='text-muted-foreground text-xs font-bold'>
                                    {(selectedFile.size / (1024 * 1024)).toFixed(1)}MB
                                </span>
                            </div>

                            <div className='flex gap-2'>
                                <Button
                                    onClick={handleUpload}
                                    className='flex-1'
                                    disabled={loaders.uploading}>
                                    {ButtonText('Upload Video', 'Uploading...', loaders.uploading)}
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={handleReset}
                                    disabled={loaders.uploading}>
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ButtonText(text: string, loadingText: string, loading: boolean) {
    return (
        <span className='flex items-center gap-2'>
            {loading ? (
                <>
                    <Loader />
                    {loadingText}
                </>
            ) : (
                <>{text}</>
            )}
        </span>
    )
}
