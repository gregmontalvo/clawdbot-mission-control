'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Blocks, FileText, FolderOpen, CheckCircle2, XCircle, RefreshCw, Save, ExternalLink, Eye, Code } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface Skill {
  name: string
  path: string
  description?: string
  hasSkillMd: boolean
  tags?: string[]
}

interface SkillDetail {
  name: string
  path: string
  content: string
}

// Generate consistent color for each tag
const getTagColor = (tag: string) => {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  ]
  
  // Simple hash function to get consistent color for same tag
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      setSkills(data.skills || [])
    } catch (error) {
      console.error('Failed to load skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSkillDetail = async (skillName: string) => {
    setLoadingDetail(true)
    setViewMode('view') // Always start in view mode
    try {
      const response = await fetch(`/api/skills/${skillName}`)
      const data = await response.json()
      setSelectedSkill(data)
      setEditedContent(data.content)
    } catch (error) {
      console.error('Failed to load skill detail:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const saveSkill = async () => {
    if (!selectedSkill) return
    
    setSaving(true)
    try {
      await fetch(`/api/skills/${selectedSkill.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent })
      })
      
      // Update local state
      if (selectedSkill) {
        setSelectedSkill({ ...selectedSkill, content: editedContent })
      }
    } catch (error) {
      console.error('Failed to save skill:', error)
    } finally {
      setSaving(false)
    }
  }

  const closeSheet = () => {
    setSelectedSkill(null)
    setEditedContent('')
  }
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(
      skills
        .flatMap(s => s.tags || [])
        .filter(Boolean)
    )
  ).sort()
  
  // Filter skills by tag
  const filteredSkills = selectedTag === 'all' 
    ? skills 
    : skills.filter(s => s.tags?.includes(selectedTag))
  
  const skillsWithDocs = filteredSkills.filter(s => s.hasSkillMd)
  const skillsWithoutDocs = filteredSkills.filter(s => !s.hasSkillMd)

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Skills</h1>
          <Badge variant="outline" className="gap-2">
            <Blocks className="h-3 w-3" />
            {skills.length} Total
          </Badge>
          <Badge variant="outline" className="gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            {skillsWithDocs.length} Documented
          </Badge>
          {skillsWithoutDocs.length > 0 && (
            <Badge variant="outline" className="gap-2">
              <XCircle className="h-3 w-3 text-orange-500" />
              {skillsWithoutDocs.length} Missing Docs
            </Badge>
          )}
        </div>
        <Button onClick={loadSkills} variant="outline" size="sm" className="cursor-pointer">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Tags:</span>
          <Button
            variant={selectedTag === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag('all')}
            className="h-7 cursor-pointer"
          >
            All ({skills.length})
          </Button>
          {allTags.map(tag => {
            const count = skills.filter(s => s.tags?.includes(tag)).length
            const isSelected = selectedTag === tag
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`h-7 px-3 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-offset-2 ring-offset-background' 
                    : 'hover:scale-105'
                } ${getTagColor(tag)}`}
              >
                {tag} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredSkills.length})</TabsTrigger>
          <TabsTrigger value="documented">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Documented ({skillsWithDocs.length})
          </TabsTrigger>
          {skillsWithoutDocs.length > 0 && (
            <TabsTrigger value="missing">
              Missing Docs ({skillsWithoutDocs.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all">
          <SkillsTable skills={filteredSkills} onViewDocs={loadSkillDetail} />
        </TabsContent>

        <TabsContent value="documented">
          <SkillsTable skills={skillsWithDocs} onViewDocs={loadSkillDetail} />
        </TabsContent>

        <TabsContent value="missing">
          <SkillsTable skills={skillsWithoutDocs} onViewDocs={loadSkillDetail} />
        </TabsContent>
      </Tabs>

      {/* Skill Detail Sidesheet */}
      <Sheet open={!!selectedSkill} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedSkill?.name}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">{selectedSkill?.path}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 cursor-pointer"
                asChild
              >
                <a href={`file://${selectedSkill?.path}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </SheetDescription>
          </SheetHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* Mode Tabs */}
              <div className="flex gap-1 border-b">
                <button
                  onClick={() => setViewMode('view')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    viewMode === 'view'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    viewMode === 'edit'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Code className="h-4 w-4 inline mr-2" />
                  Edit
                </button>
              </div>

              {/* Content */}
              {viewMode === 'view' ? (
                <div className="prose prose-base dark:prose-invert max-w-none overflow-y-auto max-h-[calc(100vh-300px)] px-4 [&>*]:my-6 [&>h1]:mt-10 [&>h1]:mb-6 [&>h2]:mt-8 [&>h2]:mb-5 [&>h3]:mt-6 [&>h3]:mb-4 [&>ul]:my-6 [&>ul]:space-y-3 [&>ol]:my-6 [&>ol]:space-y-3 [&>pre]:my-6 [&>blockquote]:my-6 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {editedContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[calc(100vh-300px)] font-mono text-sm"
                  placeholder="Edit skill documentation..."
                />
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  {editedContent !== selectedSkill?.content && (
                    <span className="text-orange-500">• Unsaved changes</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeSheet}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveSkill}
                    disabled={saving || editedContent === selectedSkill?.content}
                    className="cursor-pointer"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function SkillsTable({ skills, onViewDocs }: { skills: Skill[], onViewDocs: (name: string) => void }) {
  if (skills.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No skills found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-[40px] h-10 py-2">Docs</TableHead>
              <TableHead className="w-[200px] h-10 py-2">Name</TableHead>
              <TableHead className="h-10 py-2">Description</TableHead>
              <TableHead className="w-[280px] h-10 py-2">Tags</TableHead>
              <TableHead className="w-[120px] h-10 py-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.name} className="hover:bg-muted/50 transition-colors">
                <TableCell className="py-2">
                  {skill.hasSkillMd ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10">
                      <XCircle className="h-3 w-3 text-orange-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  <div className="font-medium">{skill.name}</div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {skill.description || '-'}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex gap-1 flex-wrap">
                    {skill.tags && skill.tags.length > 0 ? (
                      skill.tags.map(tag => (
                        <span 
                          key={tag} 
                          className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 cursor-pointer"
                      asChild
                    >
                      <a href={`file://${skill.path}`} target="_blank" rel="noopener noreferrer">
                        <FolderOpen className="h-3 w-3" />
                      </a>
                    </Button>
                    {skill.hasSkillMd && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 cursor-pointer"
                        onClick={() => onViewDocs(skill.name)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Docs
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
