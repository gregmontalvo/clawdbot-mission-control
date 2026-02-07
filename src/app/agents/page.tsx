'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Activity, MessageSquare, Clock, Zap, RefreshCw, Eye, Bot, User } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface Session {
  key: string
  kind: string
  label?: string
  sessionId: string
  updatedAt: number
  ageMs: number
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  model?: string
  agentId?: string
  lastMessages?: Message[]
}

interface SessionHistory {
  messages: Message[]
  key: string
}

export default function AgentsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionHistory, setSessionHistory] = useState<SessionHistory | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterKind, setFilterKind] = useState<string>('interesting') // 'all', 'interesting', 'direct', 'group'

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setSessions(data.sessions || [])
      setLastUpdate(data.timestamp)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSessionHistory = async (sessionKey: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/agents/${encodeURIComponent(sessionKey)}`)
      const data = await response.json()
      setSessionHistory(data)
    } catch (error) {
      console.error('Failed to load session history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const openSessionDetail = (session: Session) => {
    setSelectedSession(session)
    loadSessionHistory(session.key)
  }

  const closeSheet = () => {
    setSelectedSession(null)
    setSessionHistory(null)
  }

  // Initial load
  useEffect(() => {
    loadSessions()
  }, [])

  // Auto-refresh every 2 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadSessions()
    }, 2000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const parseSessionName = (key: string): string => {
    // Extract human-friendly name from session key
    if (key.includes('whatsapp:group:')) {
      return '💬 WhatsApp Group'
    }
    if (key.includes('whatsapp:')) {
      return '💬 WhatsApp Chat'
    }
    if (key.includes('slack:channel:')) {
      const channelMatch = key.match(/slack:channel:([^:]+)/)
      if (channelMatch) {
        return `💼 Slack #${channelMatch[1]}`
      }
      return '💼 Slack Channel'
    }
    if (key === 'agent:main:main') {
      return '🤖 Main Session (You)'
    }
    if (key.includes('cron:')) {
      return '⏰ Cron Job'
    }
    if (key.includes('spawn:')) {
      return '🌱 Spawned Agent'
    }
    return key
  }

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'direct': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'group': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  }

  const isInterestingSession = (session: Session): boolean => {
    const key = session.key
    // Interesting = not cron, or is main session, or has recent activity
    if (key === 'agent:main:main') return true
    if (key.includes('whatsapp')) return true
    if (key.includes('slack')) return true
    if (key.includes('spawn')) return true
    return false
  }

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      if (filterKind === 'all') return true
      if (filterKind === 'direct') return session.kind === 'direct'
      if (filterKind === 'group') return session.kind === 'group'
      if (filterKind === 'interesting') return isInterestingSession(session)
      return true
    })
    .sort((a, b) => b.updatedAt - a.updatedAt) // Most recent first

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Agent Sessions</h1>
          <Badge variant="outline" className="gap-2">
            <Activity className="h-3 w-3" />
            {filteredSessions.length} / {sessions.length} Sessions
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
          >
            <Zap className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button onClick={loadSessions} variant="outline" size="sm" className="cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Button
          variant={filterKind === 'interesting' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterKind('interesting')}
          className="h-7 cursor-pointer"
        >
          💡 Interesting
        </Button>
        <Button
          variant={filterKind === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterKind('all')}
          className="h-7 cursor-pointer"
        >
          All
        </Button>
        <Button
          variant={filterKind === 'direct' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterKind('direct')}
          className="h-7 cursor-pointer"
        >
          Direct
        </Button>
        <Button
          variant={filterKind === 'group' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterKind('group')}
          className="h-7 cursor-pointer"
        >
          Group
        </Button>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground ml-auto">
            Updated {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Sessions Table */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No active sessions</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[120px] h-10 py-2">Kind</TableHead>
                  <TableHead className="w-[250px] h-10 py-2">Session</TableHead>
                  <TableHead className="h-10 py-2">Info</TableHead>
                  <TableHead className="w-[180px] h-10 py-2">Last Activity</TableHead>
                  <TableHead className="w-[100px] h-10 py-2 text-center">Tokens</TableHead>
                  <TableHead className="w-[100px] h-10 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => {
                  const lastMsg = session.lastMessages?.[session.lastMessages.length - 1]
                  const sessionName = parseSessionName(session.key)
                  return (
                    <TableRow 
                      key={session.key}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openSessionDetail(session)}
                    >
                      <TableCell className="py-2">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium border ${getKindColor(session.kind)}`}>
                          {session.kind}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="font-medium text-sm">
                          {sessionName}
                        </div>
                        {session.model && (
                          <div className="text-xs text-muted-foreground">
                            {session.model}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {lastMsg ? (
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                            <span className="font-medium">
                              {lastMsg.role === 'user' ? '👤 ' : '🤖 '}
                            </span>
                            {lastMsg.content.slice(0, 100)}
                            {lastMsg.content.length > 100 && '...'}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">
                            Click to view history
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {session.totalTokens ? (
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {session.totalTokens?.toLocaleString()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">tokens</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            openSessionDetail(session)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Session Detail Sidesheet */}
      <Sheet open={!!selectedSession} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Session Details
            </SheetTitle>
            <SheetDescription className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">Key:</span>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{selectedSession?.key}</code>
              </div>
              {selectedSession?.model && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">Model:</span>
                  <span>{selectedSession.model}</span>
                </div>
              )}
              {selectedSession?.totalTokens && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">Total Tokens:</span>
                  <span>{selectedSession.totalTokens.toLocaleString()}</span>
                </div>
              )}
            </SheetDescription>
          </SheetHeader>

          {loadingHistory ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin opacity-50" />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                {sessionHistory?.messages && sessionHistory.messages.length > 0 ? (
                  sessionHistory.messages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        msg.role === 'user' 
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' 
                          : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.role === 'user' ? 'User' : 'Assistant'}
                        </span>
                        {msg.timestamp && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No messages in history
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
