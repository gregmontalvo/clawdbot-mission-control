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

interface Skill {
  name: string
  path: string
  description?: string
  hasSkillMd: boolean
}

interface SkillDetail {
  name: string
  path: string
  content: string
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')

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
  
  const skillsWithDocs = skills.filter(s => s.hasSkillMd)
  const skillsWithoutDocs = skills.filter(s => !s.hasSkillMd)

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
        <Button onClick={loadSkills} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({skills.length})</TabsTrigger>
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
          <SkillsTable skills={skills} onViewDocs={loadSkillDetail} />
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
                className="h-5 px-1"
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
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
                <div className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto max-h-[calc(100vh-300px)] px-4 prose-p:my-4 prose-headings:mt-6 prose-headings:mb-4 prose-ul:my-4 prose-li:my-1 prose-pre:my-4 prose-blockquote:my-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveSkill}
                    disabled={saving || editedContent === selectedSkill?.content}
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
              <TableHead className="h-10 py-2">Name</TableHead>
              <TableHead className="h-10 py-2">Description</TableHead>
              <TableHead className="w-[400px] h-10 py-2">Path</TableHead>
              <TableHead className="w-[180px] h-10 py-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.name} className="h-12">
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
                  <div className="text-sm text-muted-foreground truncate max-w-md">
                    {skill.description || '-'}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="text-xs font-mono text-muted-foreground truncate">
                    {skill.path}
                  </div>
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      asChild
                    >
                      <a href={`file://${skill.path}`} target="_blank" rel="noopener noreferrer">
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Folder
                      </a>
                    </Button>
                    {skill.hasSkillMd && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
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
