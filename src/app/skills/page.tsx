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
import { Blocks, FileText, FolderOpen, CheckCircle2, XCircle, RefreshCw } from "lucide-react"

interface Skill {
  name: string
  path: string
  description?: string
  hasSkillMd: boolean
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

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
          <SkillsTable skills={skills} />
        </TabsContent>

        <TabsContent value="documented">
          <SkillsTable skills={skillsWithDocs} />
        </TabsContent>

        <TabsContent value="missing">
          <SkillsTable skills={skillsWithoutDocs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SkillsTable({ skills }: { skills: any[] }) {
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
                        asChild
                      >
                        <a href={`file://${skill.path}/SKILL.md`} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          Docs
                        </a>
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
