import { create } from 'zustand'
import { Template } from '@/types/template'
import { defaultTemplates } from '@/data/default-templates'
import storage from '@/lib/storage'

interface TemplateState {
  templates: Record<string, Template[]>
  isLoading: boolean
  error: string | null
  // Actions
  initializeTemplates: () => Promise<void>
  addTemplate: (template: Template) => Promise<void>
  updateTemplate: (template: Template) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>
  getTemplateById: (templateId: string) => Template | undefined
  getTemplatesByCategory: (category: string) => Template[]
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: {},
  isLoading: true,
  error: null,

  initializeTemplates: async () => {
    try {
      await storage.init()
      
      // Get user templates from storage
      const userTemplates = await storage.getItem<Record<string, Template[]>>('templates') || {}
      
      // Merge default templates with user templates
      const mergedTemplates = { ...defaultTemplates }
      
      // Merge user templates into categories
      Object.entries(userTemplates).forEach(([category, templates]) => {
        if (mergedTemplates[category]) {
          // Filter out any default templates that might have been saved
          const nonDefaultTemplates = templates.filter(t => !t.isDefault)
          mergedTemplates[category] = [...mergedTemplates[category], ...nonDefaultTemplates]
        } else {
          mergedTemplates[category] = templates
        }
      })

      set({ templates: mergedTemplates, isLoading: false, error: null })
    } catch (error) {
      set({ error: 'Failed to initialize templates', isLoading: false })
      console.error('Error initializing templates:', error)
    }
  },

  addTemplate: async (template: Template) => {
    try {
      const { templates } = get()
      const category = template.category
      
      const updatedTemplates = { ...templates }
      if (!updatedTemplates[category]) {
        updatedTemplates[category] = []
      }
      
      updatedTemplates[category] = [...updatedTemplates[category], template]
      
      // Save to storage (only save non-default templates)
      const templatesForStorage: Record<string, Template[]> = {}
      Object.entries(updatedTemplates).forEach(([cat, temps]) => {
        templatesForStorage[cat] = temps.filter(t => !t.isDefault)
      })
      await storage.setItem('templates', templatesForStorage)
      
      set({ templates: updatedTemplates })
    } catch (error) {
      set({ error: 'Failed to add template' })
      console.error('Error adding template:', error)
    }
  },

  updateTemplate: async (template: Template) => {
    try {
      const { templates } = get()
      const category = template.category
      
      const updatedTemplates = { ...templates }
      if (updatedTemplates[category]) {
        const index = updatedTemplates[category].findIndex(t => t.id === template.id)
        if (index !== -1) {
          updatedTemplates[category][index] = template
          
          // Save to storage (only save non-default templates)
          const templatesForStorage: Record<string, Template[]> = {}
          Object.entries(updatedTemplates).forEach(([cat, temps]) => {
            templatesForStorage[cat] = temps.filter(t => !t.isDefault)
          })
          await storage.setItem('templates', templatesForStorage)
          
          set({ templates: updatedTemplates })
        }
      }
    } catch (error) {
      set({ error: 'Failed to update template' })
      console.error('Error updating template:', error)
    }
  },

  deleteTemplate: async (templateId: string) => {
    try {
      const { templates } = get()
      const updatedTemplates = { ...templates }
      
      // Find and remove the template
      Object.entries(updatedTemplates).forEach(([category, categoryTemplates]) => {
        const index = categoryTemplates.findIndex(t => t.id === templateId)
        if (index !== -1) {
          // Don't allow deleting default templates
          if (categoryTemplates[index].isDefault) {
            throw new Error('Cannot delete default template')
          }
          updatedTemplates[category] = categoryTemplates.filter(t => t.id !== templateId)
        }
      })
      
      // Save to storage (only save non-default templates)
      const templatesForStorage: Record<string, Template[]> = {}
      Object.entries(updatedTemplates).forEach(([cat, temps]) => {
        templatesForStorage[cat] = temps.filter(t => !t.isDefault)
      })
      await storage.setItem('templates', templatesForStorage)
      
      set({ templates: updatedTemplates })
    } catch (error) {
      set({ error: 'Failed to delete template' })
      console.error('Error deleting template:', error)
    }
  },

  getTemplateById: (templateId: string) => {
    const { templates } = get()
    for (const categoryTemplates of Object.values(templates)) {
      const template = categoryTemplates.find(t => t.id === templateId)
      if (template) return template
    }
    return undefined
  },

  getTemplatesByCategory: (category: string) => {
    const { templates } = get()
    return templates[category] || []
  }
}))
