'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Folder, Save, X, Search, Filter, Tag as TagIcon } from "lucide-react"

interface MemoryFile {
  name: string
  path: string
  relativePath: string
  size: number
  modified: string
  isDirectory: boolean
  tags?: string[]
}

interface TagConfig {
  label: string
  color: string
  description: string
}

const TAG_COLORS: Record<string, string> = {
  core: 'bg-red-500/20 text-red-300 border-red-500/30',
  memory: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  client: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  skill: 'bg-green-500/20 text-green-300 border-green-500/30',
  project: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  research: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  template: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  config: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  archive: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tags, setTags] = useState<Record<string, TagConfig>>({})
  const [fileTags, setFileTags] = useState<Record<string, string[]>>({})

  useEffect(() => {
    loadTagsConfig()
    loadFiles()
  }, [])

  const loadTagsConfig = async () => {
    try {
      const response = await fetch('/memory-tags.json')
      const data = await response.json()
      setTags(data.tags)
      setFileTags(data.fileTags)
    } catch (error) {
      console.error('Failed to load tags config:', error)
    }
  }

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
    console.log('Loading file:', relativePath)
    try {
      const response = await fetch(`/api/memory/read?path=${encodeURIComponent(relativePath)}`)
      const data = await response.json()
      console.log('Loaded content:', data.content?.substring(0, 100))
      setFileContent(data.content || '')
      setOriginalContent(data.content || '')
      setSelectedFile(relativePath)
    } catch (error) {
      console.error('Failed to load file:', error)
      alert('Error loading file: ' + error)
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

  const getFileTags = (relativePath: string): string[] => {
    return fileTags[relativePath] || []
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredFiles = files.filter(file => {
    // Filtro por búsqueda
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filtro por tags
    if (selectedTags.length > 0) {
      const tags = getFileTags(file.relativePath)
      if (!selectedTags.some(t => tags.includes(t))) {
        return false
      }
    }
    
    return true
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] p-8 gap-4">
      {/* File List Sidebar */}
      <Card className="w-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Memory Files</CardTitle>
          <CardDescription>
            {filteredFiles.filter(f => !f.isDirectory).length} files
            {selectedTags.length > 0 && ` • Filtered`}
          </CardDescription>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-1 mt-3">
            {Object.entries(tags).map(([key, tag]) => (
              <button
                key={key}
                onClick={() => toggleTag(key)}
                className={`px-2 py-1 rounded text-xs border transition-opacity ${
                  selectedTags.includes(key) 
                    ? TAG_COLORS[key]
                    : 'border-transparent bg-muted text-muted-foreground opacity-50 hover:opacity-100'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="space-y-1 p-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                filteredFiles.map((file) => {
                  const fileTags = getFileTags(file.relativePath)
                  return (
                    <button
                      key={file.relativePath}
                      onClick={() => !file.isDirectory && loadFile(file.relativePath)}
                      disabled={file.isDirectory}
                      className={`w-full flex flex-col gap-1 p-2 rounded-lg text-left transition-colors ${
                        selectedFile === file.relativePath
                          ? 'bg-primary text-primary-foreground'
                          : file.isDirectory
                          ? 'text-muted-foreground cursor-default'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {file.isDirectory ? (
                          <Folder className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium truncate flex-1 min-w-0">{file.name}</p>
                      </div>
                      
                      {!file.isDirectory && (
                        <>
                          <p className="text-xs opacity-70 pl-6 truncate">
                            {formatSize(file.size)} • {formatDate(file.modified)}
                          </p>
                          
                          {fileTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-6 min-w-0">
                              {fileTags.map(tag => (
                                <span
                                  key={tag}
                                  className={`px-1.5 py-0.5 rounded text-[10px] border flex-shrink-0 ${TAG_COLORS[tag]}`}
                                >
                                  {tags[tag]?.label || tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">
                {selectedFile || 'Select a file'}
              </CardTitle>
              <CardDescription>
                {selectedFile ? 'Edit markdown content' : 'Choose a file from the sidebar'}
              </CardDescription>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 ml-4">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="gap-1 flex-shrink-0">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Unsaved
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
        <CardContent className="flex-1 p-0 overflow-hidden">
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
