import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Bot, Zap } from "lucide-react"

export default function AgentsPage() {
  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Active agents and sessions
          </p>
        </div>
      </div>

      {/* Main Agent */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>Main Agent (Coach)</CardTitle>
            </div>
            <Badge variant="outline" className="gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Active
            </Badge>
          </div>
          <CardDescription>Primary Clawdbot agent</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Model</dt>
              <dd className="text-lg font-mono">claude-sonnet-4-5</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Workspace</dt>
              <dd className="text-sm font-mono">/Users/macmini/clawd</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Max Concurrent</dt>
              <dd className="text-lg">4</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sub-agents Max</dt>
              <dd className="text-lg">8</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Active Sessions</CardTitle>
          </div>
          <CardDescription>Current agent sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">WhatsApp Session</p>
                  <p className="text-sm text-muted-foreground">
                    +34625091204
                  </p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Slack Session</p>
                  <p className="text-sm text-muted-foreground">
                    Badgie workspace
                  </p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Capabilities</CardTitle>
          </div>
          <CardDescription>Agent features and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Search</span>
              <Badge variant="outline">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session Memory (Experimental)</span>
              <Badge variant="outline">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Compaction Mode</span>
              <Badge variant="outline">Safeguard</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Flush</span>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
