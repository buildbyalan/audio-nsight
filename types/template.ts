export type FieldType = 'text' | 'number' | 'date' | 'quote' | 'keyFinding' | 'name' | 'custom';

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  description?: string;
  required?: boolean;
  customPrompt?: string; // Prompt for custom field type
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    customRule?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  fields: TemplateField[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}
