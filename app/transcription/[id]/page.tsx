'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProcessStore } from '@/lib/stores/process-store'
import { Process } from '@/types/process'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Users,
  MessageSquare,
  Table,
  Timer,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Header } from "@/components/layout/header"

export default function TranscriptionPage({ params: { id } }: { params: { id: string } }) {
  const params = useParams()
  const router = useRouter()
  const [process, setProcess] = useState<Process | null>(null)
  const [activeTab, setActiveTab] = useState('transcript')
  const { getProcessById, initializeProcesses } = useProcessStore()

  useEffect(() => {
    const init = async () => {
     await initializeProcesses()
    
      const id = params.id as string
      const currentProcess = getProcessById(id)
      setProcess(currentProcess)
  
      // If process is still processing, poll for updates
      if (currentProcess?.status === 'processing') {
        const interval = setInterval(() => {
          const updatedProcess = getProcessById(id)
          setProcess(updatedProcess)
  
          if (updatedProcess?.status !== 'processing') {
            clearInterval(interval)
          }
        }, 5000) // Poll every 5 seconds
  
        return () => clearInterval(interval)
      }
    }
    init()
  }, [params.id, getProcessById, initializeProcesses])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50'
      case 'error':
        return 'bg-red-500/20 text-red-500 border-red-500/50'
      case 'queued':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
      default:
        return 'bg-zinc-500/20 text-zinc-500 border-zinc-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'queued':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (!process) {
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
      
      <main>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-900/80" />
          <div className="relative">
            <div className="container max-w-screen-2xl mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-zinc-400 hover:text-zinc-100"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>

              <div className="flex items-start justify-between mb-8">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-zinc-50">
                    {process.title || 'Untitled Recording'}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm mt-2">
                    {process.metadata?.duration && (
                      <>
                        <div className="flex items-center space-x-1 text-zinc-400">
                          <Timer className="h-4 w-4" />
                          <span>{Math.round(process.metadata.duration / 60)} min</span>
                        </div>
                        <span className="text-zinc-700">•</span>
                      </>
                    )}
                    <div className="flex items-center space-x-1 text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(process.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <span className="text-zinc-700">•</span>
                    <Badge
                      variant="outline"
                      className={cn("capitalize border", getStatusColor(process.status))}
                    >
                      <span className="flex items-center space-x-1.5">
                        {getStatusIcon(process.status)}
                        <span>{process.status}</span>
                      </span>
                    </Badge>
                  </div>
                </div>

                {process.status === 'completed' && (
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="gap-2 bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600">
                      <Download className="h-4 w-4" />
                      Export JSON
                    </Button>
                    <Button variant="outline" className="gap-2 bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600">
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                )}
              </div>

              {process.status === 'processing' && (
                <Card className="bg-zinc-800/50 border-zinc-700/50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-100">Processing your audio...</span>
                        <span className="text-zinc-400">~2 min remaining</span>
                      </div>
                      <Progress value={33} className="h-1" />
                      <p className="text-sm text-zinc-400">
                        We're using AI to transcribe your audio and extract structured data.
                        This usually takes a few minutes depending on the length of the audio.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {process.status === 'error' && (
                <Card className="bg-zinc-800/50 border-zinc-700/50 border-red-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3 text-red-400">
                      <XCircle className="h-5 w-5 mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Processing Error</h3>
                        <p className="text-sm text-red-400/80">
                          {process.result?.error || 'An error occurred while processing your audio file. Please try again.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {process.status === 'completed' && (
                <Tabs defaultValue="transcript" className="space-y-6">
                  <TabsList className="bg-zinc-800/50 border border-zinc-700/50">
                    <TabsTrigger value="transcript" className="gap-2 data-[state=active]:bg-zinc-700/50 data-[state=active]:text-zinc-100">
                      <MessageSquare className="h-4 w-4" />
                      Transcript
                    </TabsTrigger>
                    <TabsTrigger value="speakers" className="gap-2 data-[state=active]:bg-zinc-700/50 data-[state=active]:text-zinc-100">
                      <Users className="h-4 w-4" />
                      Speakers
                    </TabsTrigger>
                    <TabsTrigger value="structured" className="gap-2 data-[state=active]:bg-zinc-700/50 data-[state=active]:text-zinc-100">
                      <Table className="h-4 w-4" />
                      Structured Data
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="gap-2 data-[state=active]:bg-zinc-700/50 data-[state=active]:text-zinc-100">
                      Audio Analysis
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="transcript" className="space-y-4">
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardHeader>
                        <CardTitle className="text-zinc-100">Full Transcript</CardTitle>
                        <CardDescription className="text-zinc-400">
                          The complete transcript of your audio file with speaker labels and timestamps.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="prose prose-invert max-w-none text-zinc-400">
                          {process.result?.transcript?.words ? (
                            <div className="space-y-4">
                              {process.result.transcript.text.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                            </div>
                          ) : (
                            <p>{process.result?.transcript?.text}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {process.result?.transcript?.words && (
                      <Card className="bg-zinc-800/50 border-zinc-700/50">
                        <CardHeader>
                          <CardTitle className="text-zinc-100">Word-Level Analysis</CardTitle>
                          <CardDescription className="text-zinc-400">
                            Detailed breakdown of the transcription with confidence scores and speaker detection
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-96 overflow-y-auto rounded-lg bg-zinc-900/50 p-4">
                            {process.result.transcript.words.map((word, index) => (
                              <span
                                key={`${word.text}-${index}`}
                                className="inline-block mr-1 mb-1 text-zinc-400"
                                style={{
                                  opacity: Math.max(0.5, word.confidence),
                                  backgroundColor: word.speaker === 'A' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  padding: '0.125rem 0.25rem',
                                  borderRadius: '0.25rem',
                                }}
                                title={`Confidence: ${(word.confidence * 100).toFixed(1)}%${word.speaker ? ` • Speaker ${word.speaker}` : ''}`}
                              >
                                {word.text}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="speakers" className="space-y-4">
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardHeader>
                        <CardTitle className="text-zinc-100">Speaker Analysis</CardTitle>
                        <CardDescription className="text-zinc-400">
                          Breakdown of speech by different speakers in the conversation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Speaker analysis content */}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="structured" className="space-y-4">
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardHeader>
                        <CardTitle className="text-zinc-100">Structured Data</CardTitle>
                        <CardDescription className="text-zinc-400">
                          Key information extracted from the conversation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Structured data content */}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="audio" className="space-y-4">
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardHeader>
                        <CardTitle className="text-zinc-100">Audio Analysis</CardTitle>
                        <CardDescription className="text-zinc-400">
                          Detailed analysis of the audio characteristics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Audio analysis content */}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
