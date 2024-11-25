import { Template } from './template'
import type { Transcript } from 'assemblyai'

export type ProcessStatus = 'processing' | 'completed' | 'error'

export interface ProcessMetadata {
  name: string
  size: number
  type: string
  duration?: number
}

export interface ProcessResult {
  transcript?: Transcript
  structuredData?: Record<string, any>
  error?: string
}

export interface Process {
  id: string
  title: string
  templateId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  status: ProcessStatus
  metadata: ProcessMetadata
  result?: ProcessResult
}

export interface ProcessStore {
  username: string
  processes: Record<string, Process>
  isLoading: boolean
  error: string | null
  // Actions
  initializeProcesses: () => Promise<void>
  refreshProcesses: () => Promise<void>
  addProcess: (process: Process) => Promise<void>
  updateProcess: (id: string, data: Partial<Process>) => Promise<void>
  deleteProcess: (id: string) => Promise<void>
  getProcessById: (id: string) => Process | undefined
  getProcessesByUser: (userId: string) => Process[]
  getProcessesByTemplate: (templateId: string) => Process[]
  getProcessesByStatus: (status: ProcessStatus) => Process[]
  updateStructuredData: (id: string, data: Record<string, any>) => Promise<void>
}
