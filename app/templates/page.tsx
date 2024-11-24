'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useTemplateStore } from "@/lib/stores/template-store";
import { PlusCircle, Folder, ChevronRight, FileText, Pencil, Copy, Trash2, FolderEdit } from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Template } from "@/types/template";
import storage from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TemplatesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { templates, isLoading, error, initializeTemplates, deleteTemplate, addTemplate } = useTemplateStore();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        await initializeTemplates();
        const storedUsername = await storage.getItem<string>('username');
        if (!storedUsername) {
          router.push('/login');
          return;
        }
        
        setUsername(storedUsername);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load templates",
        });
      }
    };
    loadUserData();
  }, [router, toast, initializeTemplates]);

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate || !username) return;

    try {
      await deleteTemplate(selectedTemplate.id);
      setSelectedTemplate(null);
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template",
      });
    }
    setShowDeleteDialog(false);
  };

  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate || !username) return;

    try {
      const newTemplate = {
        ...selectedTemplate,
        id: Math.random().toString(36).substr(2, 9),
        name: `${selectedTemplate.name} (Copy)`,
        isDefault: false,
        createdBy: username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addTemplate(newTemplate);
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate template",
      });
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

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50">
      <Header />
      <div className="container max-w-screen-2xl mx-auto">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-zinc-800 overflow-y-auto">
            <div className="p-4 sticky top-0 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80 z-10 border-b border-zinc-800">
              <Link href="/templates/new">
                <Button className="w-full bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90 font-medium">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            </div>
            <div className="p-2">
              {Object.entries(templates).map(([category, templates]) => (
                <div key={category} className="mb-4">
                  <div className="flex items-center px-3 py-2 text-sm font-medium text-zinc-400">
                    <Folder className="mr-2 h-4 w-4" />
                    <span className="font-medium">{category}</span>
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </div>
                  <div className="mt-1 ml-3">
                    {Array.isArray(templates) && templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedTemplate?.id === template.id
                            ? "bg-[#FF8A3C]/10 text-[#FF8A3C] font-medium"
                            : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-50"
                        }`}
                      >
                        <FileText className={`mr-2 h-4 w-4 ${selectedTemplate?.id === template.id ? 'text-[#FF8A3C]' : 'text-zinc-400'}`} />
                        <span className="truncate">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedTemplate ? (
              <div className="max-w-3xl mx-auto p-8">
                <div className="mb-8">
                  <div className="flex items-center space-x-2 text-zinc-400 text-sm mb-3">
                    <span>{selectedTemplate.category}</span>
                    {selectedTemplate.subcategory && (
                      <>
                        <ChevronRight className="h-4 w-4" />
                        <span>{selectedTemplate.subcategory}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-3 text-zinc-50">{selectedTemplate.name}</h1>
                  <p className="text-zinc-400 text-lg">{selectedTemplate.description}</p>
                </div>

                <Card className="p-8 mb-8 bg-zinc-800/50 border-zinc-700/50 rounded-xl shadow-lg">
                  <h2 className="text-xl font-semibold mb-6 text-zinc-50">Fields</h2>
                  <div className="grid gap-6">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.id} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-zinc-50 font-medium">{field.name}</span>
                            {field.required && (
                              <span className="text-[#FF8A3C] ml-1.5 text-sm">Required</span>
                            )}
                          </div>
                          <span className="text-zinc-400 text-sm px-2 py-1 rounded-md bg-zinc-800">
                            {field.type}
                          </span>
                        </div>
                        {field.description && (
                          <p className="text-zinc-400 text-sm mt-2">
                            {field.description}
                          </p>
                        )}
                        {field.type === 'custom' && field.customPrompt && (
                          <div className="mt-3 border-t border-zinc-700/50 pt-3">
                            <div className="flex items-center text-sm text-zinc-400 mb-1">
                              <span className="font-medium">Custom Field Prompt</span>
                            </div>
                            <p className="text-zinc-300 text-sm bg-zinc-800/50 p-3 rounded-md">
                              {field.customPrompt}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-zinc-200 text-zinc-900 hover:bg-zinc-800 hover:text-zinc-50 border-zinc-700" 
                    asChild
                  >
                    <Link href={`/templates/edit/${selectedTemplate.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-zinc-200 text-zinc-900 hover:bg-zinc-800 hover:text-zinc-50 border-zinc-700"
                    onClick={handleDuplicateTemplate}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-zinc-200 text-zinc-900 hover:bg-zinc-800 hover:text-zinc-50 border-zinc-700"
                  >
                    <FolderEdit className="mr-2 h-4 w-4" />
                    Move
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white ml-auto"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">Select a template to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-300">Delete Template?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This template will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-200 text-zinc-900 hover:bg-zinc-800 hover:text-zinc-50 border-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
