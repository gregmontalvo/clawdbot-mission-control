'use client'

import { useState, useEffect } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Folder, FolderOpen, ChevronRight, ChevronDown, Save, X, Search, List, FolderTree } from "lucide-react"

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

interface TreeNode {
  name: string
  path: string
  relativePath: string
  isDirectory: boolean
  children?: TreeNode[]
  file?: MemoryFile
  expanded?: boolean
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
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')
  const [treeData, setTreeData] = useState<TreeNode[]>([])

  useEffect(() => {
    loadTagsConfig()
    loadFiles()
  }, [])

  useEffect(() => {
    if (files.length > 0) {
      buildTree()
    }
  }, [files, searchQuery, selectedTags])

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
    try {
      const response = await fetch(`/api/memory/read?path=${encodeURIComponent(relativePath)}`)
      const data = await response.json()
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

  const buildTree = () => {
    const filteredFiles = files.filter(file => {
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      if (selectedTags.length > 0) {
        const tags = getFileTags(file.relativePath)
        if (!selectedTags.some(t => tags.includes(t))) {
          return false
        }
      }
      
      return true
    })

    const tree: TreeNode[] = []
    const map = new Map<string, TreeNode>()

    filteredFiles.forEach(file => {
      const parts = file.relativePath.split('/')
      let currentPath = ''
      
      parts.forEach((part, index) => {
        const parentPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part
        
        if (!map.has(currentPath)) {
          const isLast = index === parts.length - 1
          const node: TreeNode = {
            name: part,
            path: currentPath,
            relativePath: currentPath,
            isDirectory: !isLast,
            children: isLast ? undefined : [],
            file: isLast ? file : undefined,
            expanded: false
          }
          
          map.set(currentPath, node)
          
          if (parentPath) {
            const parent = map.get(parentPath)
            if (parent && parent.children) {
              parent.children.push(node)
            }
          } else {
            tree.push(node)
          }
        }
      })
    })

    setTreeData(tree)
  }

  const toggleNode = (node: TreeNode) => {
    const updateTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(n => {
        if (n.path === node.path) {
          return { ...n, expanded: !n.expanded }
        }
        if (n.children) {
          return { ...n, children: updateTree(n.children) }
        }
        return n
      })
    }
    setTreeData(updateTree(treeData))
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

  const renderTreeNode = (node: TreeNode, depth: number = 0): JSX.Element => {
    const tags = node.file ? getFileTags(node.file.relativePath) : []
    const isSelected = selectedFile === node.relativePath

    if (node.isDirectory) {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleNode(node)}
            className="w-full flex items-center gap-1 p-1 rounded hover:bg-accent text-left"
            style={{ paddingLeft: `${depth * 12 + 4}px` }}
          >
            {node.expanded ? (
              <ChevronDown className="h-3 w-3 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
            )}
            {node.expanded ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0 text-yellow-500" />
            )}
            <span className="text-sm font-medium truncate">{node.name}</span>
          </button>
          {node.expanded && node.children && (
            <div>
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        key={node.path}
        onClick={() => node.file && loadFile(node.file.relativePath)}
        className={`w-full flex flex-col gap-0.5 p-1 rounded text-left transition-colors ${
          isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
      >
        <div className="flex items-center gap-1 min-w-0">
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-sm truncate flex-1 min-w-0">{node.name}</span>
        </div>
        {node.file && (
          <>
            <div className="text-[10px] opacity-70 pl-4 truncate">
              {formatSize(node.file.size)} • {formatDate(node.file.modified)}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-0.5 pl-4">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-1 py-0 rounded text-[9px] border ${TAG_COLORS[tag]}`}
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
  }

  const filteredFiles = files.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    if (selectedTags.length > 0) {
      const tags = getFileTags(file.relativePath)
      if (!selectedTags.some(t => tags.includes(t))) {
        return false
      }
    }
    
    return true
  })

  return (
    <div className="flex h-screen p-8 gap-4 overflow-hidden">
      {/* File List Sidebar */}
      <Card className="w-96 flex flex-col h-full overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Memory Files</CardTitle>
              <CardDescription>
                {filteredFiles.filter(f => !f.isDirectory).length} files
                {selectedTags.length > 0 && ` • Filtered`}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                <FolderTree className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
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
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : viewMode === 'tree' ? (
            <div className="space-y-0.5">
              {treeData.map(node => renderTreeNode(node))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => {
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
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Editor */}
      <Card className="flex-1 flex flex-col h-full overflow-hidden">
        <CardHeader className="flex-shrink-0">
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
        <div className="flex-1 overflow-hidden">
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
        </div>
      </Card>
    </div>
  )
}
