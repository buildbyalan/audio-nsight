import { Template } from "@/types/template"

type FieldType = 'name' | 'text' | 'keyFinding' | 'quote' | 'date'

// Helper function to get the extraction instruction based on field type
function getFieldInstruction(type: FieldType): string {
  switch (type) {
    case 'name':
      return 'Extract the full name'
    case 'text':
      return 'Extract the relevant text'
    case 'keyFinding':
      return 'Identify and list the key findings or main points'
    case 'quote':
      return 'Extract relevant direct quotes from the conversation'
    case 'date':
      return 'Extract the date mentioned'
    default:
      return 'Extract the information'
  }
}

// Helper function to format field output based on type
function getOutputFormat(type: FieldType): string {
  switch (type) {
    case 'keyFinding':
      return 'Return as an array of strings, each representing a key finding'
    case 'quote':
      return 'Return as an array of strings, each being a direct quote with speaker attribution'
    case 'date':
      return 'Return in ISO date format (YYYY-MM-DD)'
    default:
      return 'Return as a string'
  }
}

export function generatePrompt(template: Template): string {
  const { name, description, fields } = template

  // Start with strict JSON output instruction
  let prompt = `IMPORTANT: Your response must be ONLY a valid JSON object with no additional text, explanation, or formatting.

You are analyzing a ${name.toLowerCase()}. ${description}

Extract the following information from the conversation and format it as specified for each field:\n\n`

  // Add instructions for each field
  fields.forEach((field) => {
    const instruction = getFieldInstruction(field.type as FieldType)
    const format = getOutputFormat(field.type as FieldType)
    const requiredText = field.required ? ' (Required)' : ' (Optional)'

    prompt += `${field.name}${requiredText}:\n`
    prompt += `- ${instruction}\n`
    prompt += `- ${format}\n\n`
  })

  // Add the output format instructions with emphasis on clean JSON
  prompt += `RESPONSE FORMAT:
{
  ${fields.map(field => `"${field.name}": <extracted_value>`).join(',\n  ')}
}

RULES:
1. Return ONLY the JSON object, no other text
2. Required fields must be filled with "NOT_FOUND" if not in conversation
3. Optional fields should be null if not found
4. Ensure the response is valid JSON that can be parsed`

  // If there's a custom prompt in the template, append it
  if ('customPrompt' in template && template.customPrompt) {
    prompt += `\n\nAdditional Instructions:\n${template.customPrompt}`
  }

  return prompt
}
