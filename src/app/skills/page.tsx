import { listSkills } from "@/lib/clawdbot"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Blocks, FileText, FolderOpen } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SkillsPage() {
  const skills = await listSkills()
  
  const skillsWithDocs = skills.filter(s => s.hasSkillMd)
  const skillsWithoutDocs = skills.filter(s => !s.hasSkillMd)

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">
            Installed agent skills and capabilities
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Blocks className="h-4 w-4" />
          {skills.length} Total
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Documentation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillsWithDocs.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((skillsWithDocs.length / skills.length) * 100)}% coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Docs</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillsWithoutDocs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Skills with Documentation */}
      {skillsWithDocs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Documented Skills</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {skillsWithDocs.map((skill) => (
              <Card key={skill.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{skill.name}</CardTitle>
                      {skill.description && (
                        <CardDescription className="mt-1">
                          {skill.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Docs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {skill.path}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`file://${skill.path}`} target="_blank" rel="noopener noreferrer">
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Open Folder
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`file://${skill.path}/SKILL.md`} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" />
                        View SKILL.md
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Skills without Documentation */}
      {skillsWithoutDocs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Skills Missing Documentation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {skillsWithoutDocs.map((skill) => (
              <Card key={skill.name} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    <Badge variant="secondary">No Docs</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {skill.path}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href={`file://${skill.path}`} target="_blank" rel="noopener noreferrer">
                      <FolderOpen className="h-3 w-3 mr-1" />
                      Open Folder
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No skills found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
