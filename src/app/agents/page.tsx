'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Bot, Zap, RefreshCw, MessageSquare, Clock } from "lucide-react"

interface Session {
  sessionKey: string
  kind?: string
  label?: string
  channel?: string
  createdAt?: string
  lastMessageAt?: string
  messageCount?: number
}

interface AgentConfig {
  model: string
  workspace: string
  maxConcurrent: number
  subAgentsMax: number
  memorySearch: boolean
  sessionMemory: boolean
  compactionMode: string
}

export default function AgentsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setSessions(data.sessions || [])
      setConfig(data.config || null)
    } catch (error) {
      console.error('Failed to load agents data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSessionLabel = (session: Session) => {
    if (session.label) return session.label
    if (session.channel) return `${session.channel} session`
    return session.sessionKey.slice(0, 8)
  }

  const getTimeSince = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const ms = Date.now() - new Date(timestamp).getTime()
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const mainSessions = sessions.filter(s => s.kind !== 'spawn')
  const subAgentSessions = sessions.filter(s => s.kind === 'spawn')

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
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Active conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              User channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subAgentSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Spawned workers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Agent Config */}
      {config && (
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
            <CardDescription>Primary Clawdbot agent configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Model</dt>
                <dd className="text-lg font-mono">{config.model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Workspace</dt>
                <dd className="text-sm font-mono truncate">{config.workspace}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Max Concurrent</dt>
                <dd className="text-lg">{config.maxConcurrent}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sub-agents Max</dt>
                <dd className="text-lg">{config.subAgentsMax}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Main Sessions */}
        {mainSessions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Main Sessions</CardTitle>
              </div>
              <CardDescription>Active user channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mainSessions.map((session) => (
                    <div
                      key={session.sessionKey}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{getSessionLabel(session)}</p>
                          {session.channel && (
                            <Badge variant="outline" className="text-xs">
                              {session.channel}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{session.messageCount || 0} messages</span>
                          <span>Last: {getTimeSince(session.lastMessageAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          {session.sessionKey}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Sub-Agent Sessions */}
        {subAgentSessions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <CardTitle>Sub-Agents</CardTitle>
              </div>
              <CardDescription>Spawned worker sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {subAgentSessions.map((session) => (
                    <div
                      key={session.sessionKey}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{getSessionLabel(session)}</p>
                          <Badge variant="secondary" className="text-xs">
                            Spawn
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{session.messageCount || 0} messages</span>
                          <span>Created: {getTimeSince(session.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          {session.sessionKey}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Capabilities */}
      {config && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle>Capabilities</CardTitle>
            </div>
            <CardDescription>Agent features and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Search</span>
                <Badge variant={config.memorySearch ? "default" : "secondary"}>
                  {config.memorySearch ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session Memory (Experimental)</span>
                <Badge variant={config.sessionMemory ? "default" : "secondary"}>
                  {config.sessionMemory ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Compaction Mode</span>
                <Badge variant="outline">{config.compactionMode}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Max Concurrent Sessions</span>
                <Badge variant="outline">{config.maxConcurrent}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {sessions.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No active sessions</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
            <p className="text-muted-foreground">Loading agent data...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
