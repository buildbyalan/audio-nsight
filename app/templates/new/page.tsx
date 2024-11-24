'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Template, TemplateField, FieldType } from "@/types/template";
import { PlusCircle, X } from "lucide-react";
import { defaultTemplates } from "@/data/default-templates";
import storage from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'quote', label: 'Quote' },
  { value: 'keyFinding', label: 'Key Finding' },
  { value: 'name', label: 'Name' },
  { value: 'custom', label: 'Custom' },
];

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const categories = Object.keys(defaultTemplates);

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await storage.getItem<string>('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };
    loadUsername();
  }, []);

  const addField = () => {
    const newField: TemplateField = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSave = async () => {
    if (!username) {
      router.push('/login');
      return;
    }

    if (!name || !category || fields.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Validate custom field prompts
    const invalidCustomFields = fields.filter(
      field => field.type === 'custom' && !field.customPrompt
    );

    if (invalidCustomFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide prompts for all custom fields",
      });
      return;
    }

    setIsLoading(true);

    try {
      const template: Template = {
        id: Date.now().toString(),
        name,
        description,
        category,
        subcategory: subcategory || undefined,
        fields,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Load existing templates and add the new one
      const existingTemplates = await storage.getItem<Template[]>(`${username}_templates`) || [];
      const updatedTemplates = [...existingTemplates, template];
      
      // Save to storage
      await storage.setItem(`${username}_templates`, updatedTemplates);
      
      toast({
        title: "Success",
        description: "Template created successfully",
      });

      // Navigate back to templates page
      router.push('/templates');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create template",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF8A3C]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-zinc-50">Create New Template</h1>
              <p className="text-zinc-400 mt-1">Design a template for your transcriptions</p>
            </div>
            <Button 
              variant="outline" 
              className="border-zinc-700 bg-zinc-200 hover:bg-zinc-800 text-zinc-900 hover:text-zinc-50"
              onClick={() => router.push('/templates')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <h2 className="text-xl font-semibold mb-6 text-zinc-50">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-zinc-200">Template Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter template name"
                      className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-zinc-200">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your template"
                      className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-zinc-200">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700">
                          {categories.map((cat) => (
                            <SelectItem 
                              key={cat} 
                              value={cat} 
                              className="text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50 focus:bg-zinc-800 focus:text-zinc-50"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subcategory" className="text-zinc-200">Subcategory (Optional)</Label>
                      <Input
                        id="subcategory"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Enter subcategory"
                        className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-zinc-50">Fields</h2>
                  <Button 
                    onClick={addField} 
                    variant="outline" 
                    className="border-zinc-700 bg-zinc-200 hover:bg-zinc-800 text-zinc-900 hover:text-zinc-50"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field) => (
                    <Card key={field.id} className="p-4 bg-zinc-900 border-zinc-700">
                      <div className="flex items-start justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                          <div>
                            <Label className="text-zinc-200">Field Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              placeholder="Enter field name"
                              className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-zinc-200">Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: FieldType) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-700">
                                {fieldTypes.map((type) => (
                                  <SelectItem 
                                    key={type.value} 
                                    value={type.value}
                                    className="text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50 focus:bg-zinc-800 focus:text-zinc-50"
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label className="text-zinc-200">Description (Optional)</Label>
                            <Input
                              value={field.description || ''}
                              onChange={(e) => updateField(field.id, { description: e.target.value })}
                              placeholder="Enter field description"
                              className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#FF8A3C] focus:border-[#FF8A3C]"
                            />
                          </div>
                          
                          {field.type === 'custom' && (
                            <div className="md:col-span-2">
                              <Label className="text-zinc-200">
                                Custom Field Prompt
                                <span className="text-[#FF8A3C] ml-1">*</span>
                              </Label>
                              <Textarea
                                value={field.customPrompt || ''}
                                onChange={(e) => updateField(field.id, { customPrompt: e.target.value })}
                                placeholder="Describe what kind of data you want to extract. For example: 'Extract the main action items discussed in the meeting' or 'Identify the key decisions made during the conversation'"
                                className="mt-1 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#FF8A3C] focus:border-[#FF8A3C] min-h-[100px]"
                              />
                              <p className="mt-2 text-sm text-zinc-400">
                                Write a clear prompt that describes the specific information you want to extract. 
                                The more specific your prompt, the better the results will be.
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.required || false}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              className="data-[state=checked]:bg-[#FF8A3C]"
                            />
                            <Label className="text-zinc-200">Required Field</Label>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(field.id)}
                          className="ml-4 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-4">
              <Card className="p-6 bg-zinc-800/50 border-zinc-700 sticky top-8">
                <h3 className="text-lg font-medium mb-4 text-zinc-50">Template Actions</h3>
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90 font-medium"
                    disabled={isLoading}
                    onClick={handleSave}
                  >
                    {isLoading ? 'Creating...' : 'Create Template'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-zinc-700 bg-zinc-200 hover:bg-zinc-800 text-zinc-900 hover:text-zinc-50"
                    onClick={() => router.push('/templates')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Validation Status */}
                {(!name || !category || fields.length === 0) && (
                  <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-700">
                    <h4 className="text-sm font-medium text-zinc-200 mb-2">Required Fields</h4>
                    <ul className="text-sm space-y-1">
                      {!name && (
                        <li className="text-zinc-400">• Template name is required</li>
                      )}
                      {!category && (
                        <li className="text-zinc-400">• Category is required</li>
                      )}
                      {fields.length === 0 && (
                        <li className="text-zinc-400">• At least one field is required</li>
                      )}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
