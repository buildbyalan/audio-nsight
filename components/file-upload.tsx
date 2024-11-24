'use client'

import { useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onUpload: (file: File) => void
  isUploading: boolean
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />
      <Button
        onClick={handleClick}
        disabled={isUploading}
        className="bg-[#FF8A3C] text-black hover:bg-[#FF8A3C]/90"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Audio
          </>
        )}
      </Button>
    </div>
  )
}
