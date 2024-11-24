// Assemblyai implementation
// Documentation: https://www.assemblyai.com/docs/
'use client'

import { AssemblyAI } from 'assemblyai'
import type { TranscribeParams, Transcript } from 'assemblyai'

// Core types
type TranscriptionStatus = 'processing' | 'queued' | 'completed' | 'error'

type BaseOptions = {
  webhookUrl?: string
  webhookAuthHeader?: {
    name: string
    value: string
  }
}

type TranscriptionOptions = BaseOptions & {
  speakerLabels?: boolean
  languageDetection?: boolean
  languageCode?: string
}

type AIFeatureOptions = BaseOptions & {
  summarization?: {
    model?: 'informative' | 'conversational' | 'catchy'
    type?: 'bullets' | 'bullets_verbose' | 'gist' | 'headline' | 'paragraph'
  }
  sentiment?: boolean
  entityDetection?: boolean
  topicDetection?: boolean
  keyPhrases?: boolean
}

type LemurQuestion = {
  question: string
  context?: string
  answerFormat?: string
  answerOptions?: string[]
}

// AssemblyAI Service class
class AssemblyAIService {
  private client: AssemblyAI
  
  constructor() {
    this.client = new AssemblyAI({
      apiKey: this.getApiKey(),
    })
  }

  private getApiKey(): string {
    try {
      if (sessionStorage && sessionStorage.getItem('assemblyAiToken')) {
        return sessionStorage.getItem('assemblyAiToken') as string
      }
      throw new Error('AssemblyAI key not found')
    } catch (error) {
      throw error
    }
  }

  // Core transcription methods
  async transcribe(file: File, options: TranscriptionOptions & AIFeatureOptions = {}) {
    const params: TranscribeParams = {
      audio: file,
      ...this.getTranscriptionParams(options),
      ...this.getAIFeatureParams(options),
      ...this.getWebhookParams(options)
    }

    const transcript = await this.client.transcripts.transcribe(params)

    if (transcript.status === 'error') {
      console.error(`Transcription failed: ${transcript.error}`)
      throw new Error(transcript.error)
    }
    
    return transcript
  }

  private getTranscriptionParams(options: TranscriptionOptions) {
    return {
      speaker_labels: options.speakerLabels ?? true,
      language_detection: options.languageDetection,
      language_code: options.languageCode,
    }
  }

  private getAIFeatureParams(options: AIFeatureOptions) {
    return {
      summarization: !!options.summarization,
      summary_model: options.summarization?.model,
      summary_type: options.summarization?.type,
      sentiment_analysis: options.sentiment,
      entity_detection: options.entityDetection,
      iab_categories: options.topicDetection,
      auto_highlights: options.keyPhrases,
    }
  }

  private getWebhookParams(options: BaseOptions) {
    if (!options.webhookUrl) return {}
    
    return {
      webhook_url: options.webhookUrl,
      ...(options.webhookAuthHeader && {
        webhook_auth_header_name: options.webhookAuthHeader.name,
        webhook_auth_header_value: options.webhookAuthHeader.value
      })
    }
  }

  // Utterance methods
  async getUtterances(transcript: Transcript) {
    if (!transcript.utterances) return []
    return transcript.utterances
  }

  // LeMUR methods
  async getSummary(transcriptId: string, context?: string, format?: string) {
    const { response } = await this.client.lemur.summary({
      transcript_ids: [transcriptId],
      final_model: 'anthropic/claude-3-5-sonnet',
      context,
      answer_format: format
    })
    return response
  }

  async askQuestions(transcriptId: string, questions: LemurQuestion[]) {
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      context: q.context,
      answer_format: q.answerFormat,
      answer_options: q.answerOptions
    }))

    const { response } = await this.client.lemur.questionAnswer({
      transcript_ids: [transcriptId],
      final_model: 'anthropic/claude-3-5-sonnet',
      questions: formattedQuestions
    })

    return response
  }

  // Export methods
  async getSubtitles(transcriptId: string, format: 'srt' | 'vtt', charsPerCaption?: number) {
    return await this.client.transcripts.subtitles(transcriptId, format, charsPerCaption)
  }

  async getSentences(transcriptId: string) {
    const { sentences } = await this.client.transcripts.sentences(transcriptId)
    return sentences
  }

  async getParagraphs(transcriptId: string) {
    const { paragraphs } = await this.client.transcripts.paragraphs(transcriptId)
    return paragraphs
  }

  // Search methods
  async searchWords(transcriptId: string, words: string[]) {
    const { matches } = await this.client.transcripts.wordSearch(transcriptId, words)
    return matches
  }

  // Management methods
  async deleteTranscript(transcriptId: string) {
    return await this.client.transcripts.delete(transcriptId)
  }
}

// Export a singleton instance
export const assemblyAIService = new AssemblyAIService()

// Export types for consumers
export type {
  TranscriptionStatus,
  TranscriptionOptions,
  AIFeatureOptions,
  LemurQuestion,
}