'use client'

import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload, 
  ChevronRight,
  Timer,
  Calendar
} from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { formatDistanceToNow, format } from 'date-fns'
import { Process } from '@/types/process'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TranscriptionListProps {
  transcriptions: Process[]
}

export function TranscriptionList({ transcriptions }: TranscriptionListProps) {
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

  if (!transcriptions || transcriptions.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="rounded-full bg-zinc-800/50 p-4 mb-4">
            <Upload className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">No transcriptions yet</h3>
          <p className="text-zinc-500 text-center max-w-sm">
            Upload an audio file to get started with AI-powered transcription
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transcriptions.map((item) => (
        <Link 
          key={item.id} 
          href={`/transcription/${item.id}`}
        >
          <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm hover:bg-zinc-900/70 hover:border-zinc-700/50 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-zinc-800/50 p-2">
                    <FileText className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-2 text-zinc-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {item.metadata?.duration && (
                        <>
                          <span className="text-zinc-700">•</span>
                          <div className="flex items-center space-x-2 text-zinc-500">
                            <Timer className="h-3.5 w-3.5" />
                            <span className="text-sm">
                              {Math.round(item.metadata.duration / 60)} min
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize border", getStatusColor(item.status))}
                  >
                    <span className="flex items-center space-x-1.5">
                      {getStatusIcon(item.status)}
                      <span>{item.status}</span>
                    </span>
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
