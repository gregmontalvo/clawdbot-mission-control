'use client'

import { useEffect, useState } from 'react'
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
import { Users, Bot, MessageSquare, RefreshCw, Clock, Send } from "lucide-react"

interface Session {
  sessionKey: string
  kind?: string
  label?: string
  channel?: string
  createdAt?: string
  lastMessageAt?: string
  messageCount?: number
}

export default function AgentsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'main' | 'subagents'>('main')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to load agents data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSessionLabel = (session: Session) => {
    if (session.label) return session.label
    if (session.channel) return `${session.channel} session`
    return session.sessionKey.slice(0, 12)
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
          <h1 className="text-2xl font-bold">Agents</h1>
          <Badge variant="outline" className="gap-2">
            <Users className="h-3 w-3" />
            {sessions.length} Sessions
          </Badge>
          <Badge variant="outline" className="gap-2">
            <MessageSquare className="h-3 w-3 text-blue-500" />
            {mainSessions.length} Main
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Bot className="h-3 w-3 text-purple-500" />
            {subAgentSessions.length} Sub-agents
          </Badge>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="main">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Main Sessions ({mainSessions.length})
          </TabsTrigger>
          <TabsTrigger value="subagents">
            <Bot className="h-3.5 w-3.5 mr-1.5" />
            Sub-agents ({subAgentSessions.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No active sessions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[40px] h-10 py-2">Status</TableHead>
                  <TableHead className="w-[200px] h-10 py-2">Label</TableHead>
                  <TableHead className="w-[100px] h-10 py-2">Kind</TableHead>
                  <TableHead className="w-[100px] h-10 py-2">Channel</TableHead>
                  <TableHead className="w-[80px] h-10 py-2">Messages</TableHead>
                  <TableHead className="w-[120px] h-10 py-2">Last Active</TableHead>
                  <TableHead className="w-[120px] h-10 py-2">Created</TableHead>
                  <TableHead className="h-10 py-2">Session Key</TableHead>
                  <TableHead className="w-[100px] h-10 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === 'main' ? mainSessions : subAgentSessions).map((session) => (
                  <TableRow key={session.sessionKey} className="h-12">
                    <TableCell className="py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="font-medium truncate">
                        {getSessionLabel(session)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant={session.kind === 'spawn' ? 'secondary' : 'default'} className="text-xs">
                        {session.kind || 'main'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      {session.channel ? (
                        <Badge variant="outline" className="text-xs">
                          {session.channel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm font-mono">
                        {session.messageCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm text-muted-foreground">
                        {getTimeSince(session.lastMessageAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm text-muted-foreground">
                        {getTimeSince(session.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-xs font-mono text-muted-foreground truncate max-w-xs">
                        {session.sessionKey}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          title="Send message"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          title="View history"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
