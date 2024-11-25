'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, AlertCircle, FileAudio, ExternalLink } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import storage from '@/lib/storage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTemplateStore } from '@/lib/stores/template-store'
import { Template } from '@/types/template'
import { useToast } from '@/hooks/use-toast'
import { useProcessStore } from '@/lib/stores/process-store'
import { Process, ProcessStatus } from '@/types/process'
import { assemblyAIService } from '@/lib/assemblyai'
import { samples } from '@/data/audio-samples'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function UploadModal({ isOpen, onClose, onComplete }: UploadModalProps) {
  const { toast } = useToast()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [title, setTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [username, setUsername] = useState<string>('')

  const { templates, isLoading: isLoadingTemplates, error: templateError, initializeTemplates } = useTemplateStore()
  const { addProcess, updateProcess, getProcessesByUser } = useProcessStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        await storage.init()
        const storedUsername = await storage.getItem<string>('username')
        if (!storedUsername) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please log in to upload files",
          })
          onClose()
          return
        }

        await initializeTemplates()
        setUsername(storedUsername)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load templates",
        })
      }
    }
    loadData()
  }, [initializeTemplates, onClose])

  const createProcess = async (file: File): Promise<Process> => {
    const process: Process = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      templateId: selectedTemplate,
      createdBy: username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'processing',
      metadata: {
        name: file.name,
        size: file.size,
        type: file.type,
      }
    }

    await addProcess(process)
    return process
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedTemplate || !title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }))

    setUploadingFiles((prev) => [...prev, ...newFiles])

    // Process each file
    for (const fileData of newFiles) {
      try {
        // Create process first
        const process = await createProcess(fileData.file)

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

        // Start transcription
        const transcript = await assemblyAIService.transcribe(fileData.file)
        
        // Update process with results
        await updateProcess(process.id, {
          status: 'completed',
          result: {
            transcript,
            structuredData: {} // Will be populated based on template processing
          }
        })

        clearInterval(updateProgress)
        setUploadingFiles((files) =>
          files.map((f) =>
            f.file === fileData.file
              ? { ...f, progress: 100, status: 'success' }
              : f
          )
        )

        toast({
          title: "Success",
          description: "File uploaded and transcribed successfully",
        })
        onComplete()
      } catch (error) {
        // Update process with error
        if (error instanceof Error) {
          await updateProcess(process.id, {
            status: 'error',
            result: { error: error.message }
          })
        }

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

        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to process file",
        })
      }
    }
  }, [selectedTemplate, title, username, addProcess, updateProcess])

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

  const allTemplates = Object.values(templates).flat()

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

        {/* Title Field */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1F1F1F] border-zinc-800"
              placeholder="Enter a title for your transcription"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="bg-[#1F1F1F] border-zinc-800">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F1F1F] border-zinc-800">
                {isLoadingTemplates ? (
                  <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                ) : templateError ? (
                  <SelectItem value="error" disabled>Error loading templates</SelectItem>
                ) : (
                  allTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} className='text-white'>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

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

          {/* Sample audio files */}
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Try these sample audio files:</p>
            <div className="space-y-1 flex flex-wrap gap-x-4">
              {samples.map((sample) => (
                <a
                  key={sample.id}
                  href={sample.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
                >
                  <span>{sample.name}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

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
                        <span className="text-sm truncate max-w-md">{file.file.name}</span>
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
