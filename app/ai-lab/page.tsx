'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import dynamic from 'next/dynamic'
import { TranscriptionList } from '@/components/transcription-list'
import storage from '@/lib/storage'
import { useProcessStore } from '@/lib/stores/process-store'
import { Process } from '@/types/process'

const UploadModal = dynamic(
  () => import('@/components/upload-modal').then(mod => mod.UploadModal),
  { ssr: false }
)

export default function AILabsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [processes, setProcesses] = useState<Process[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getProcessesByUser, initializeProcesses } = useProcessStore()

  // Function to refresh processes
  const refreshProcesses = useCallback(async () => {
    const storedUsername = await storage.getItem<string>('username')
    if (storedUsername) {
      const userProcesses = getProcessesByUser(storedUsername)
      setProcesses(userProcesses)
    }
  }, [getProcessesByUser])

  useEffect(() => {
    const init = async () => {
      try {
        await storage.init()
        const storedUsername = await storage.getItem<string>('username')
        if (storedUsername) {
          setUsername(storedUsername)
          await initializeProcesses()
          await refreshProcesses()
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error initializing:', error)
        toast({
          title: 'Error',
          description: 'Failed to load processes',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [router, toast, getProcessesByUser, initializeProcesses, refreshProcesses])

  const handleFileUploadComplete = async () => {
    setIsUploadModalOpen(false)
    await refreshProcesses() // Refresh the processes list after upload
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
