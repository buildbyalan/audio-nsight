'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { defaultTemplates } from "@/data/default-templates";
import { PlusCircle, Folder, ChevronRight, FileText, Pencil, Copy, Trash2, FolderEdit } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Template } from "@/types/template";
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
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteTemplate = () => {
    // Implement delete functionality
    setShowDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <Header />
      <div className="container max-w-screen-2xl">
        <div className="flex h-[calc(100vh-3.5rem)]">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-border/40 overflow-y-auto">
            <div className="p-4 sticky top-0 bg-[#030303]/95 backdrop-blur supports-[backdrop-filter]:bg-[#030303]/60 border-b border-border/40">
              <Link href="/templates/new">
                <Button className="w-full bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </Link>
            </div>
            <div className="p-2">
              {Object.entries(defaultTemplates).map(([category, templates]) => (
                <div key={category} className="mb-2">
                  <div className="flex items-center px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    <Folder className="mr-2 h-4 w-4" />
                    <span>{category}</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                          selectedTemplate?.id === template.id
                            ? "bg-[#FF8A3C]/10 text-[#FF8A3C]"
                            : "hover:bg-accent"
                        }`}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="truncate">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTemplate ? (
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">{selectedTemplate.name}</h1>
                  <p className="text-muted-foreground">{selectedTemplate.description}</p>
                </div>

                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Template Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="mt-1">{selectedTemplate.category}</p>
                    </div>
                    {selectedTemplate.subcategory && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                        <p className="mt-1">{selectedTemplate.subcategory}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fields</label>
                      <div className="mt-2 space-y-2">
                        {selectedTemplate.fields.map((field) => (
                          <div key={field.id} className="flex items-center">
                            <span className="text-sm">{field.name}</span>
                            {field.required && (
                              <span className="text-[#FF8A3C] ml-1 text-sm">*</span>
                            )}
                            <span className="text-muted-foreground text-sm ml-2">
                              ({field.type})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="flex-1">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FolderEdit className="mr-2 h-4 w-4" />
                    Change Category
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a template to view details
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
