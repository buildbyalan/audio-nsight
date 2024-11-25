'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Sparkles,
  FileAudio,
  MessageSquare,
  Users,
  Table,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProcessStore } from '@/lib/stores/process-store'
import { Process } from '@/types/process'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTemplateStore } from '@/lib/stores/template-store'
import { Template } from '@/types/template'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { Header } from "@/components/layout/header"
import { generatePrompt } from '@/lib/prompt-generator'
import { assemblyAIService } from '@/lib/assemblyai'
import { ExportService } from '@/lib/export-service'

export default function TranscriptionPage({ params }: { params: { id: string } }) {
  const paramsId = useParams()
  const router = useRouter()
  const [process, setProcess] = useState<Process | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('transcript')
  const processStore = useProcessStore()
  const { toast } = useToast()
  const { getProcessById, initializeProcesses, updateStructuredData } = useProcessStore()
  const { templates, initializeTemplates, getTemplateById } = useTemplateStore()
  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    const init = async () => {
      // Initialize both stores
      await Promise.all([initializeProcesses(), initializeTemplates()])
    
      const id = paramsId.id as string
      const currentProcess = getProcessById(id)
      setProcess(currentProcess)

      // Find template if process has templateId
      if (currentProcess?.templateId) {
        const template = getTemplateById(currentProcess.templateId)
        setTemplate(template || null)

        const isEmptyObject = (obj: any) => {
          return Object.keys(obj).length === 0 && obj.constructor === Object
        }

        // If we have a template and no structured data yet, trigger analysis
        if (template && isEmptyObject(currentProcess.result?.structuredData) && currentProcess.status === 'completed') {
          try {
            const prompt = generatePrompt(template)
            const structuredData = await assemblyAIService.customPrompt(currentProcess.result.transcript.id, prompt)
            await updateStructuredData(currentProcess.id, structuredData)
            // Update local state
            setProcess(prev => prev ? {
              ...prev,
              result: {
                ...prev.result,
                structuredData
              }
            } : null)
          } catch (error) {
            console.error('Error analyzing transcript:', error)
          }
        }
      }
  
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
  }, [paramsId.id, getProcessById, initializeProcesses, initializeTemplates, getTemplateById])

  const handleDelete = async () => {
    if (!process) return
    
    try {
      await processStore.deleteProcess(process.id)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting process:', error)
      toast({
        title: "Error",
        description: "Failed to delete the process. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportJson = () => {
    if (!process?.result?.structuredData) return
    const filename = `${process.title.toLowerCase().replace(/\s+/g, '-')}-structured-data.json`
    ExportService.downloadAsJson(process.result.structuredData, filename)
  }

  const handleExportCsv = () => {
    if (!process?.result?.structuredData) return
    const filename = `${process.title.toLowerCase().replace(/\s+/g, '-')}-structured-data.csv`
    ExportService.downloadAsCsv(process.result.structuredData, filename)
  }

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
        return <CheckCircle2 className="h-4 w-4" />
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
                    className="gap-2 text-zinc-400"
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
                    <Button 
                      variant="outline" 
                      className="gap-2 bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                      onClick={handleExportJson}
                    >
                      <Download className="h-4 w-4" />
                      Export JSON
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2 bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                      onClick={handleExportCsv}
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2 bg-zinc-800/50 border-zinc-700/50 text-red-400 hover:text-red-300 hover:border-red-700"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
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
                        <div className="space-y-6">
                          {process.result?.transcript?.utterances?.map((utterance, index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex gap-4 p-4 rounded-lg",
                                utterance.speaker === "A" 
                                  ? "bg-blue-500/5 border border-blue-500/10" 
                                  : "bg-red-500/5 border border-red-500/10"
                              )}
                            >
                              <div className="flex-shrink-0">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                  utterance.speaker === "A" 
                                    ? "bg-blue-500/10 text-blue-500" 
                                    : "bg-red-500/10 text-red-500"
                                )}>
                                  {utterance.speaker}
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-zinc-400">
                                    Speaker {utterance.speaker}
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-zinc-500">
                                    <Timer className="h-3 w-3" />
                                    <span>
                                      {Math.floor(utterance.start / 60)}:{String(Math.floor(utterance.start % 60)).padStart(2, '0')} - {Math.floor(utterance.end / 60)}:{String(Math.floor(utterance.end % 60)).padStart(2, '0')}
                                    </span>
                                    <span>•</span>
                                    <span>{Math.round((utterance.end - utterance.start) * 10) / 10}s</span>
                                  </div>
                                </div>
                                <p className="text-zinc-300 leading-relaxed">
                                  {utterance.text}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                                  <div className="flex items-center space-x-1">
                                    <span>Confidence:</span>
                                    <span className={cn(
                                      utterance.confidence > 0.8 ? "text-green-500" :
                                      utterance.confidence > 0.6 ? "text-yellow-500" :
                                      "text-red-500"
                                    )}>
                                      {Math.round(utterance.confidence * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="structured" className="space-y-4">
                    <Card className="bg-zinc-800/50 border-zinc-700/50">
                      <CardHeader>
                        <CardTitle className="text-zinc-100">Structured Data</CardTitle>
                        <CardDescription className="text-zinc-400">
                          {template ? (
                            <>
                              Extracted information based on the {template.name} template.
                              <div className="mt-1 text-sm text-zinc-500">{template.description}</div>
                            </>
                          ) : (
                            'No template associated with this transcription'
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {template ? (
                          process?.result?.structuredData ? (
                            <div className="space-y-6">
                              {template.fields.map((field) => (
                                <div key={field.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-zinc-200">
                                      {field.name}
                                      {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </h4>
                                    <span className="text-xs text-zinc-500">{field.type}</span>
                                  </div>
                                  {renderFieldValue(field, process.result.structuredData?.[field.name])}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-8">
                              <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8A3C] mx-auto"></div>
                                <p className="text-zinc-400">Analyzing transcript with AI...</p>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center p-8">
                            <p className="text-zinc-500">No template data available</p>
                          </div>
                        )}
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
                        <p className="text-zinc-400">Coming soon.. </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </main>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Delete Transcription</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete this transcription? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-800/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function renderFieldValue(field: { type: string; name: string }, value: any) {
  if (!value) {
    return <p className="text-zinc-500 italic">No data available</p>
  }

  switch (field.type) {
    case 'keyFinding':
      if (Array.isArray(value)) {
        return (
          <ul className="space-y-2">
            {value.map((item, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-[#FF8A3C] mt-1">•</span>
                <span className="text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>
        )
      }
      return <p className="text-zinc-300">{value}</p>

    case 'quote':
      if (Array.isArray(value)) {
        return (
          <div className="space-y-4">
            {value.map((quote, index) => (
              <div key={index} className="pl-4 border-l-2 border-[#FF8A3C]">
                <p className="text-zinc-300 italic">{quote}</p>
              </div>
            ))}
          </div>
        )
      }
      return <p className="text-zinc-300 italic">"{value}"</p>

    case 'name':
      return (
        <div className="flex items-center space-x-2">
          <span className="text-zinc-300 font-medium">{value}</span>
          {field.name.toLowerCase().includes('speaker') && (
            <Badge variant="secondary" className="bg-[#FF8A3C]/10 text-[#FF8A3C] border-[#FF8A3C]/20">
              Speaker
            </Badge>
          )}
        </div>
      )

    case 'date':
      try {
        const date = new Date(value)
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-[#FF8A3C]" />
            <span className="text-zinc-300">
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )
      } catch {
        return <p className="text-zinc-300">{value}</p>
      }

    case 'text':
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-zinc-300 whitespace-pre-wrap">{value}</p>
        </div>
      )

    default:
      return <p className="text-zinc-300">{value}</p>
  }
}
