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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to create templates",
      });
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

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create New Template</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter template name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your template"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                      <Input
                        id="subcategory"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Enter subcategory"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Fields</h2>
                  <Button onClick={addField} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                          <div>
                            <Label>Field Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              placeholder="Enter field name"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: FieldType) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <Label>Description (Optional)</Label>
                            <Input
                              value={field.description || ''}
                              onChange={(e) => updateField(field.id, { description: e.target.value })}
                              placeholder="Enter field description"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.required || false}
                              onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            />
                            <Label>Required Field</Label>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(field.id)}
                          className="ml-4"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  
                  {fields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No fields added yet. Click "Add Field" to start building your template.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Template Actions</h3>
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90"
                    disabled={isLoading}
                    onClick={handleSave}
                  >
                    {isLoading ? 'Creating...' : 'Create Template'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/templates')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
