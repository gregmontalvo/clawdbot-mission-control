'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
  Play, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  Repeat,
  Bell
} from "lucide-react"
import { getTimeUntil, getTimeSince, formatDuration, msToDate } from "@/lib/utils"

interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: {
    kind: string
    expr: string
    tz?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastStatus?: string
    lastDurationMs?: number
    lastError?: string
  }
}

type SortField = 'name' | 'nextRun' | 'lastRun' | 'status' | 'duration'
type SortDirection = 'asc' | 'desc'
type CronType = 'recurring' | 'oneoff'

// Detect if a cron is recurring or one-off based on schedule
function getCronType(schedule: CronJob['schedule'], name: string): CronType {
  const expr = schedule.expr
  
  // Check name for reminders/recordatorios
  const nameIndicatesOneOff = 
    name.toLowerCase().includes('recordatorio') ||
    name.toLowerCase().includes('reminder')
  
  // Parse cron expression: minute hour day month dayOfWeek
  const parts = expr.split(' ')
  if (parts.length >= 5) {
    const day = parts[2]
    const month = parts[3]
    
    // If both day and month are specific numbers (not * or */), it's a one-off
    const hasSpecificDate = 
      day !== '*' && !day.includes('/') && !day.includes(',') &&
      month !== '*' && !month.includes('/') && !month.includes(',')
    
    if (hasSpecificDate || nameIndicatesOneOff) {
      return 'oneoff'
    }
  }
  
  return 'recurring'
}

export default function CronsPage() {
  const [crons, setCrons] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'recurring' | 'oneoff'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDisabled, setShowDisabled] = useState(true)
  const [sortField, setSortField] = useState<SortField>('nextRun')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    loadCrons()
  }, [])

  const loadCrons = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/crons')
      if (!response.ok) throw new Error('Failed to fetch crons')
      const data = await response.json()
      setCrons(data.crons || [])
    } catch (error) {
      console.error('Failed to load crons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const getStatusInfo = (cron: CronJob) => {
    if (!cron.enabled) {
      return { icon: XCircle, color: 'text-gray-500', text: 'Disabled', bgColor: 'bg-gray-500/10' }
    }
    
    const status = cron.state?.lastStatus
    if (status === 'ok') {
      return { icon: CheckCircle2, color: 'text-green-500', text: 'OK', bgColor: 'bg-green-500/10' }
    }
    if (status === 'error') {
      return { icon: XCircle, color: 'text-red-500', text: 'Error', bgColor: 'bg-red-500/10' }
    }
    return { icon: AlertCircle, color: 'text-yellow-500', text: 'Pending', bgColor: 'bg-yellow-500/10' }
  }

  const filteredAndSortedCrons = useMemo(() => {
    let filtered = crons.filter(cron => {
      const matchesSearch = cron.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDisabled = showDisabled || cron.enabled
      
      // Filter by tab
      const cronType = getCronType(cron.schedule, cron.name)
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'recurring' && cronType === 'recurring') ||
                        (activeTab === 'oneoff' && cronType === 'oneoff')
      
      return matchesSearch && matchesDisabled && matchesTab
    })

    filtered.sort((a, b) => {
      let compareValue = 0
      
      switch (sortField) {
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'nextRun':
          compareValue = (a.state?.nextRunAtMs || Infinity) - (b.state?.nextRunAtMs || Infinity)
          break
        case 'lastRun':
          compareValue = (b.state?.lastRunAtMs || 0) - (a.state?.lastRunAtMs || 0)
          break
        case 'status':
          const statusA = a.enabled ? (a.state?.lastStatus || 'z') : 'disabled'
          const statusB = b.enabled ? (b.state?.lastStatus || 'z') : 'disabled'
          compareValue = statusA.localeCompare(statusB)
          break
        case 'duration':
          compareValue = (a.state?.lastDurationMs || 0) - (b.state?.lastDurationMs || 0)
          break
      }

      return sortDirection === 'asc' ? compareValue : -compareValue
    })

    return filtered
  }, [crons, searchQuery, showDisabled, sortField, sortDirection, activeTab])

  const paginatedCrons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedCrons.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedCrons, currentPage])

  const totalPages = Math.ceil(filteredAndSortedCrons.length / itemsPerPage)

  const stats = useMemo(() => ({
    total: crons.length,
    enabled: crons.filter(c => c.enabled).length,
    disabled: crons.filter(c => !c.enabled).length,
    errors: crons.filter(c => c.state?.lastStatus === 'error').length,
    ok: crons.filter(c => c.state?.lastStatus === 'ok').length,
    recurring: crons.filter(c => getCronType(c.schedule, c.name) === 'recurring').length,
    oneoff: crons.filter(c => getCronType(c.schedule, c.name) === 'oneoff').length,
  }), [crons])

  if (loading) {
    return (
      <div className="flex-1 p-8">
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
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            {stats.enabled} Active
          </Badge>
          {stats.errors > 0 && (
            <Badge variant="destructive" className="gap-2">
              {stats.errors} Errors
            </Badge>
          )}
        </div>
        <Button onClick={loadCrons} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as any)
        setCurrentPage(1)
      }} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="recurring">
            <Repeat className="h-3.5 w-3.5 mr-1.5" />
            Recurring ({stats.recurring})
          </TabsTrigger>
          <TabsTrigger value="oneoff">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            One-offs ({stats.oneoff})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-[40px] h-10 py-2">Status</TableHead>
                <TableHead className="w-[90px] h-10 py-2">Type</TableHead>
                <TableHead 
                  className="h-10 py-2 cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="w-[160px] h-10 py-2">Schedule</TableHead>
                <TableHead 
                  className="w-[120px] h-10 py-2 cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('nextRun')}
                >
                  <div className="flex items-center gap-2">
                    Next Run
                    {getSortIcon('nextRun')}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[120px] h-10 py-2 cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('lastRun')}
                >
                  <div className="flex items-center gap-2">
                    Last Run
                    {getSortIcon('lastRun')}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[80px] h-10 py-2 cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center gap-2">
                    Duration
                    {getSortIcon('duration')}
                  </div>
                </TableHead>
                <TableHead className="w-[90px] h-10 py-2 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCrons.map((cron) => {
                const statusInfo = getStatusInfo(cron)
                const StatusIcon = statusInfo.icon
                const cronType = getCronType(cron.schedule, cron.name)
                
                return (
                  <TableRow key={cron.id} className="h-12">
                    <TableCell className="py-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
                        <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {cronType === 'recurring' ? (
                        <Badge variant="secondary" className="gap-1">
                          <Repeat className="h-3 w-3" />
                          <span className="text-xs">Recurring</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Bell className="h-3 w-3" />
                          <span className="text-xs">One-off</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm font-medium truncate max-w-xs">{cron.name}</div>
                      {cron.state?.lastError && (
                        <div className="text-xs text-red-500 truncate max-w-xs">
                          {cron.state.lastError}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">{cron.schedule.expr}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {cron.state?.nextRunAtMs ? (
                        <div className="text-sm">
                          {getTimeUntil(cron.state.nextRunAtMs)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {cron.state?.lastRunAtMs ? (
                        <div className="text-sm">
                          {getTimeSince(cron.state.lastRunAtMs)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {cron.state?.lastDurationMs ? (
                        <span className="font-mono text-sm">
                          {formatDuration(cron.state.lastDurationMs)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Run now"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Switch
                          checked={cron.enabled}
                          className="scale-75"
                          title={cron.enabled ? 'Disable' : 'Enable'}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-3">
          <div className="text-xs text-muted-foreground">
            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedCrons.length)} of {filteredAndSortedCrons.length}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
