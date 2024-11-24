import { create } from 'zustand'
import storage from '@/lib/storage'
import { Process, ProcessStore } from '@/types/process'

export const useProcessStore = create<ProcessStore>((set, get) => ({
  username: '',
  processes: {},
  isLoading: true,
  error: null,

  initializeProcesses: async () => {
    try {
      await storage.init()

      const username = await storage.getItem('username')
      if (!username) {
        throw new Error('No username found in storage')
      }
      
      const processes = await storage.getItem<Record<string, Process>>(`${username}_processes`) || {}
      set({ processes, isLoading: false, error: null })
    } catch (error) {
      set({ error: 'Failed to initialize processes', isLoading: false })
      console.error('Error initializing processes:', error)
    }
  },

  refreshProcesses: async () => {
    try {
      await storage.init()
      const username = await storage.getItem('username')
      if (!username) {
        throw new Error('No username found in storage')
      }
      
      const processes = await storage.getItem<Record<string, Process>>(`${username}_processes`) || {}
      set({ processes, error: null })
    } catch (error) {
      set({ error: 'Failed to refresh processes' })
      console.error('Error refreshing processes:', error)
      throw error
    }
  },

  addProcess: async (process: Process) => {
    try {
      const username = await storage.getItem('username')
      if (!username) {
        throw new Error('No username found in storage')
      }

      // Get existing processes from storage
      const existingProcesses = await storage.getItem<Record<string, Process>>(`${username}_processes`) || {}
      
      const updatedProcesses = {
        ...existingProcesses,
        [process.id]: process
      }

      await storage.setItem(`${username}_processes`, updatedProcesses)
      set({ processes: updatedProcesses })
    } catch (error) {
      set({ error: 'Failed to add process' })
      console.error('Error adding process:', error)
      throw error
    }
  },

  updateProcess: async (id: string, data: Partial<Process>) => {
    try {
      const { processes } = get()
      const existingProcess = processes[id]
      
      if (!existingProcess) {
        throw new Error('Process not found')
      }

      const updatedProcess = {
        ...existingProcess,
        ...data,
        updatedAt: new Date().toISOString()
      }

      const updatedProcesses = {
        ...processes,
        [id]: updatedProcess
      }

      const username = await storage.getItem('username')
      if (!username) {
        throw new Error('No username found in storage')
      }

      await storage.setItem(`${username}_processes`, updatedProcesses)
      set({ processes: updatedProcesses })
    } catch (error) {
      set({ error: 'Failed to update process' })
      console.error('Error updating process:', error)
      throw error
    }
  },

  deleteProcess: async (id: string) => {
    try {
      const { processes } = get()
      const { [id]: removed, ...updatedProcesses } = processes

      const username = await storage.getItem('username')
      if (!username) {
        throw new Error('No username found in storage')
      }

      await storage.setItem(`${username}_processes`, updatedProcesses)
      set({ processes: updatedProcesses })
    } catch (error) {
      set({ error: 'Failed to delete process' })
      console.error('Error deleting process:', error)
      throw error
    }
  },

  getProcessById: (id: string) => {
    const { processes } = get()
    return processes[id]
  },

  getProcessesByUser: (userId: string) => {
    const { processes } = get()
    return Object.values(processes)
      .filter(p => p.createdBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getProcessesByTemplate: (templateId: string) => {
    const { processes } = get()
    return Object.values(processes)
      .filter(p => p.templateId === templateId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getProcessesByStatus: (status: ProcessStatus) => {
    const { processes } = get()
    return Object.values(processes)
      .filter(p => p.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  // Structured data methods
  updateStructuredData: async (id: string, data: Record<string, any>) => {
    const { processes } = get()
    const existingProcess = processes[id]
    
    if (!existingProcess) {
      throw new Error('Process not found')
    }

    return await get().updateProcess(id, {
      result: {
        ...existingProcess.result,
        structuredData: data
      }
    })
  }
}))
