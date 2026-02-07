'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileText, Folder, Save, X } from "lucide-react"

interface MemoryFile {
  name: string
  path: string
  relativePath: string
  size: number
  modified: string
  isDirectory: boolean
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/memory/list')
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFile = async (relativePath: string) => {
    try {
      const response = await fetch(`/api/memory/read?path=${encodeURIComponent(relativePath)}`)
      const data = await response.json()
      setFileContent(data.content)
      setOriginalContent(data.content)
      setSelectedFile(relativePath)
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  }

  const saveFile = async () => {
    if (!selectedFile) return
    
    setSaving(true)
    try {
      await fetch('/api/memory/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile,
          content: fileContent
        })
      })
      setOriginalContent(fileContent)
      alert('File saved successfully!')
    } catch (error) {
      console.error('Failed to save file:', error)
      alert('Failed to save file')
    } finally {
      setSaving(false)
    }
  }

  const hasUnsavedChanges = fileContent !== originalContent

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] p-8 gap-4">
      {/* File List Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle>Memory Files</CardTitle>
          <CardDescription>
            {files.filter(f => !f.isDirectory).length} files
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                files.map((file) => (
                  <button
                    key={file.relativePath}
                    onClick={() => !file.isDirectory && loadFile(file.relativePath)}
                    disabled={file.isDirectory}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      selectedFile === file.relativePath
                        ? 'bg-primary text-primary-foreground'
                        : file.isDirectory
                        ? 'text-muted-foreground cursor-default'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {file.isDirectory ? (
                      <Folder className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      {!file.isDirectory && (
                        <p className="text-xs opacity-70">
                          {formatSize(file.size)} • {formatDate(file.modified)}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedFile || 'Select a file'}
              </CardTitle>
              <CardDescription>
                {selectedFile ? 'Edit markdown content' : 'Choose a file from the sidebar'}
              </CardDescription>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Unsaved changes
                  </Badge>
                )}
                <Button
                  onClick={() => {
                    setSelectedFile(null)
                    setFileContent('')
                    setOriginalContent('')
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
                <Button
                  onClick={saveFile}
                  disabled={!hasUnsavedChanges || saving}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {selectedFile ? (
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="w-full h-full p-6 bg-transparent font-mono text-sm resize-none focus:outline-none"
              placeholder="File content..."
              spellCheck={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No file selected</p>
                <p className="text-sm mt-2">Choose a file from the sidebar to view and edit</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
