'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, AlertCircle, FileAudio } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => Promise<void>
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }))

    setUploadingFiles((prev) => [...prev, ...newFiles])

    // Process each file
    for (const fileData of newFiles) {
      try {
        // Simulate progress updates
        const updateProgress = setInterval(() => {
          setUploadingFiles((files) =>
            files.map((f) =>
              f.file === fileData.file && f.status === 'uploading'
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          )
        }, 500)

        await onUpload([fileData.file])

        clearInterval(updateProgress)
        setUploadingFiles((files) =>
          files.map((f) =>
            f.file === fileData.file
              ? { ...f, progress: 100, status: 'success' }
              : f
          )
        )
      } catch (error) {
        setUploadingFiles((files) =>
          files.map((f) =>
            f.file === fileData.file
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        )
      }
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.aac'],
    },
    multiple: true,
  })

  const clearCompleted = () => {
    setUploadingFiles((files) =>
      files.filter((f) => f.status === 'uploading')
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#0A0A0A] border-[#1F1F1F] text-white">
        <DialogHeader>
          <DialogTitle>Upload Audio Files</DialogTitle>
          <DialogDescription className="text-[#919191]">
            Upload your audio files for transcription. Supported formats: MP3, WAV,
            M4A, FLAC, AAC
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File constraints info */}
          <Alert className="bg-[#1F1F1F] border-[#FF8A3C] text-[#FF8A3C]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Maximum file size: 100MB per file
              <br />
              Maximum duration: 4 hours per file
            </AlertDescription>
          </Alert>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? 'border-[#FF8A3C] bg-[#FF8A3C]/10'
                  : 'border-[#1F1F1F] hover:border-[#FF8A3C]/50'
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-[#919191] mb-4" />
            <p className="text-[#919191]">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop files here, or click to select files'}
            </p>
          </div>

          {/* Upload progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Uploading Files</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                  className="text-[#919191] hover:text-white"
                >
                  Clear Completed
                </Button>
              </div>
              <div className="space-y-2">
                {uploadingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-[#1F1F1F] rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileAudio className="h-4 w-4 text-[#FF8A3C]" />
                        <span className="text-sm truncate">{file.file.name}</span>
                      </div>
                      {file.status === 'error' && (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1" />
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-500">{file.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
