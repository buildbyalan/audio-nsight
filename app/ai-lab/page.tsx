'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { UploadModal } from '@/components/upload-modal'
import { TranscriptionList } from '@/components/transcription-list'
import storage from '@/lib/storage'
import { assemblyAIService } from '@/lib/assemblyai'

type Process = {
  id: string
  file_name: string
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  transcript?: {
    text: string
    confidence: number
  }
}

export default function AILabsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [processes, setProcesses] = useState<Process[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Initialize storage first
        await storage.init()

        // Load username
        const storedUsername = await storage.getItem<string>('username')
        if (!storedUsername) {
          router.push('/login')
          return
        }
        setUsername(storedUsername)

        // Load processes
        const userProcesses = await storage.getItem<Process[]>(`${storedUsername}_processes`) || []
        setProcesses(userProcesses)
      } catch (error) {
        console.error('Error loading user data:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load transcription data',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, toast])

  const handleFileUploadComplete = () => {
    setIsUploadModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8A3C]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-zinc-50">AI Labs</h1>
              <p className="text-zinc-400 mt-1">
                Process and analyze your audio files with AI
              </p>
            </div>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Audio
            </Button>
          </div>

          {/* Transcription List */}
          <TranscriptionList transcriptions={processes} />
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onComplete={handleFileUploadComplete}
      />
    </div>
  )
}
