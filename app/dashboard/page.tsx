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
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { TranscriptionList } from '@/components/transcription-list'
import { UploadModal } from '@/components/upload-modal'
import { Header } from '@/components/layout/header'
import { Progress } from '@/components/ui/progress'
import { cn } from "@/lib/utils";

interface Template {
  id: string
  name: string
  description: string
  createdAt: string
}

interface Process {
  id: string
  name: string
  status: 'completed' | 'processing' | 'failed'
  createdAt: string
  progress?: number
}

export default function DashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [processes, setProcesses] = useState<Process[]>([
    {
      id: '1',
      name: 'Interview with John Doe.mp3',
      status: 'completed',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      name: 'Team Meeting Recording.mp3',
      status: 'processing',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      progress: 65,
    },
    {
      id: '3',
      name: 'Product Demo.mp3',
      status: 'failed',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ])
  const [stats, setStats] = useState({
    totalProcessed: 1254,
    totalDuration: 3768, // in minutes
    successRate: 98.5,
  })

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload file')
        }

        toast({
          title: 'Success',
          description: 'File uploaded successfully. Transcription in progress...',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to upload file',
        })
        throw error
      }
    }
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
      onClick: () => {},
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Experiment with advanced AI features',
      badge: 'Beta',
    },
  ]

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
                  <h1 className="text-3xl font-bold text-zinc-50">Welcome back, Alan</h1>
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
              <div className="mt-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      name: 'Total Processed',
                      value: stats.totalProcessed.toLocaleString(),
                      description: 'Compared to last month',
                      icon: CheckCircle2,
                      color: 'text-emerald-500',
                    },
                    {
                      name: 'Total Duration',
                      value: `${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m`,
                      description: '65% of monthly quota used',
                      icon: Timer,
                      color: 'text-blue-500',
                    },
                    {
                      name: 'Success Rate',
                      value: `${stats.successRate}%`,
                      description: 'Based on last 100 transcriptions',
                      icon: Sparkles,
                      color: 'text-amber-500',
                    },
                  ].map((stat) => (
                    <Card 
                      key={stat.name} 
                      className="bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors border-zinc-700/50 p-4"
                    >
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="text-sm font-medium text-zinc-200">
                          {stat.name}
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                          <stat.icon className={cn("h-5 w-5", stat.color)} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-zinc-50">{stat.value}</div>
                      <p className="text-xs text-zinc-400">
                        {stat.description}
                      </p>
                    </Card>
                  ))}
                </div>

                <div className="mt-8">
                  <Card className="bg-zinc-800/50 border-zinc-700/50 p-4">
                    <div className="text-zinc-50">Recent Processes</div>
                    <div className="text-zinc-400 mb-4">
                      Your most recent audio processing tasks
                    </div>
                    <div className="space-y-4">
                      {processes.map((process) => (
                        <div
                          key={process.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/50"
                        >
                          <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <FileAudio className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-zinc-200 truncate">{process.name}</h3>
                            <p className="text-sm text-zinc-400">{process.status}</p>
                          </div>
                          <Progress value={process.progress} className="w-36 h-2 bg-zinc-700">
                            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${process.progress}%` }} />
                          </Progress>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UploadModal 
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleFileUpload}
        />
      </main>
    </div>
  )
}
