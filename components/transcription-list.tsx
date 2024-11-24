'use client'

import { useState } from 'react'
import { FileText, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Transcription {
  id: string
  file_name: string
  status: 'processing' | 'completed' | 'failed'
  transcript?: {
    text: string
    confidence: number
    words: Array<{
      text: string
      start: number
      end: number
      confidence: number
    }>
  }
  created_at: string
}

interface TranscriptionListProps {
  transcriptions: Transcription[]
}

export function TranscriptionList({ transcriptions }: TranscriptionListProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const getStatusIcon = (status: Transcription['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (transcriptions.length === 0) {
    return (
      <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
        <CardContent className="py-10">
          <div className="text-center text-[#919191]">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>No transcriptions yet</p>
            <p className="text-sm mt-2">Upload an audio file to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transcriptions.map((transcription) => (
        <Collapsible
          key={transcription.id}
          open={openItems.has(transcription.id)}
          onOpenChange={() => toggleItem(transcription.id)}
        >
          <Card className="bg-[#0A0A0A] border-[#1F1F1F]">
            <CardHeader className="p-4">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(transcription.status)}
                    <div>
                      <CardTitle className="text-lg">
                        {transcription.file_name}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(transcription.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transform transition-transform ${
                      openItems.has(transcription.id) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-4 pt-0">
                {transcription.status === 'completed' && transcription.transcript ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-[#919191] mb-2">
                        Transcription
                      </h4>
                      <p className="text-sm whitespace-pre-wrap">
                        {transcription.transcript.text}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#919191] mb-2">
                        Confidence Score
                      </h4>
                      <p className="text-sm">
                        {(transcription.transcript.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : transcription.status === 'processing' ? (
                  <div className="flex items-center space-x-2 text-[#919191]">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Processing transcription...</span>
                  </div>
                ) : (
                  <div className="text-red-500">
                    Transcription failed. Please try again.
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}
