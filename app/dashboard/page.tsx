'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Clock, 
  Plus, 
  Upload, 
  Wand2,
  BarChart3,
  Settings,
  FileAudio,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Zap,
  Timer,
  CheckCircle2,
  XCircle,
  Clock4
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { TranscriptionList } from '@/components/transcription-list'
import { UploadModal } from '@/components/upload-modal'
import { Header } from '@/components/layout/header'
import { Progress } from '@/components/ui/progress'
import { cn } from "@/lib/utils"
import storage from '@/lib/storage'
import { useProcessStore } from '@/lib/stores/process-store'

export default function DashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [username, setUsername] = useState<string>('')
  const { processes, isLoading, initializeProcesses } = useProcessStore()
  
  useEffect(() => {
    const init = async () => {
      try {
        await storage.init()
        const storedUsername = await storage.getItem<string>('username')
        if (storedUsername) {
          setUsername(storedUsername)
          await initializeProcesses()
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error)
        toast({
          title: 'Error',
          description: 'Failed to load processes',
          variant: 'destructive',
        })
      }
    }

    init()
  }, [router, toast, initializeProcesses])

  const handleFileUploadComplete = () => {
    setIsUploadModalOpen(false)
  }

  // Quick action buttons data
  const quickActions = [
    {
      icon: Plus,
      label: 'Create Template',
      onClick: () => router.push('/templates/new'),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Create a new template for your transcriptions',
    },
    {
      icon: Upload,
      label: 'Process Audio',
      onClick: () => setIsUploadModalOpen(true),
      color: 'text-[#FF8A3C]',
      bgColor: 'bg-[#FF8A3C]/10',
      description: 'Upload and process new audio files',
    },
    {
      icon: Wand2,
      label: 'AI Lab',
      onClick: () => router.push('/ai-lab'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Experiment with advanced AI features',
      badge: 'Beta',
    },
  ]

  const processArray = Object.values(processes)
  const completedCount = processArray.filter(p => p.status === 'completed').length
  const processingCount = processArray.filter(p => p.status === 'processing').length
  const failedCount = processArray.filter(p => p.status === 'error').length

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-900/80" />
          <div className="relative">
            <div className="container max-w-screen-2xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-50 truncate">
                    Welcome back, {username || 'User'}
                  </h1>
                  <p className="text-zinc-400 mt-1">
                    Here's what's happening with your transcriptions
                  </p>
                </div>
                <div className="flex gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      onClick={action.onClick}
                      className={cn(
                        "relative group px-4 py-2 h-auto",
                        "bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/50",
                        "text-zinc-200 hover:text-zinc-50"
                      )}
                      variant="ghost"
                    >
                      <div className="flex items-center gap-2">
                        <action.icon className={cn("h-4 w-4", action.color)} />
                        <span>{action.label}</span>
                        {action.badge && (
                          <span className={cn(
                            "px-1.5 py-0.5 text-xs font-medium rounded-full",
                            "bg-zinc-700/50",
                            "text-zinc-300"
                          )}>
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Stats Section */}
              <div className="mt-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-6 bg-zinc-800/50 border-zinc-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">Completed</p>
                        <p className="text-2xl font-bold text-zinc-100">{completedCount}</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-zinc-800/50 border-zinc-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">Processing</p>
                        <p className="text-2xl font-bold text-zinc-100">{processingCount}</p>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded-full">
                        <Clock className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-zinc-800/50 border-zinc-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">Failed</p>
                        <p className="text-2xl font-bold text-zinc-100">{failedCount}</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-full">
                        <XCircle className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Transcriptions */}
                <div className="mt-8">
                  <Card className="bg-zinc-800/50 border-zinc-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-zinc-100">Recent Transcriptions</h2>
                      </div>

                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8A3C] mx-auto"></div>
                          <p className="text-zinc-400 mt-4">Loading transcriptions...</p>
                        </div>
                      ) : processArray.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-zinc-400">No transcriptions yet. Upload your first audio file!</p>
                        </div>
                      ) : (
                        <TranscriptionList transcriptions={processArray} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
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
