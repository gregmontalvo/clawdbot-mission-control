'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RefreshCw, Download, AlertCircle, CheckCircle2, Info, XCircle, AlertTriangle, Copy } from "lucide-react"

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'error' | 'warn' | 'info'>('all')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/logs')
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadLogs = () => {
    const logText = logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clawdbot-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />
      case 'warn':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case 'info':
        return <Info className="h-3 w-3 text-blue-500" />
      default:
        return <CheckCircle2 className="h-3 w-3 text-green-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive" className="text-xs">ERROR</Badge>
      case 'warn':
        return <Badge className="bg-yellow-500 text-white text-xs">WARN</Badge>
      case 'info':
        return <Badge variant="default" className="text-xs">INFO</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">DEBUG</Badge>
    }
  }

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warns: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length,
  }

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true
    return log.level === activeTab
  })

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
          <h1 className="text-2xl font-bold">Logs</h1>
          <Badge variant="outline" className="gap-2">
            {stats.total} Total
          </Badge>
          {stats.errors > 0 && (
            <Badge variant="destructive" className="gap-2">
              <XCircle className="h-3 w-3" />
              {stats.errors} Errors
            </Badge>
          )}
          {stats.warns > 0 && (
            <Badge className="bg-yellow-500 text-white gap-2">
              <AlertTriangle className="h-3 w-3" />
              {stats.warns} Warnings
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="error">
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            Errors ({stats.errors})
          </TabsTrigger>
          <TabsTrigger value="warn">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Warnings ({stats.warns})
          </TabsTrigger>
          <TabsTrigger value="info">
            <Info className="h-3.5 w-3.5 mr-1.5" />
            Info ({stats.info})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No log entries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[40px] h-10 py-2">Level</TableHead>
                  <TableHead className="w-[180px] h-10 py-2">Timestamp</TableHead>
                  <TableHead className="w-[120px] h-10 py-2">Source</TableHead>
                  <TableHead className="h-10 py-2">Message</TableHead>
                  <TableHead className="w-[60px] h-10 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index} className="h-12">
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        {getIcon(log.level)}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-xs font-mono text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {log.source ? (
                        <Badge variant="outline" className="text-xs">
                          {log.source}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm font-mono truncate max-w-3xl">
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Copy message"
                        onClick={() => navigator.clipboard.writeText(log.message)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
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
