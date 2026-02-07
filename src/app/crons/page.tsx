'use client'

import { useState, useEffect, useMemo } from 'react'
import { listCrons } from "@/lib/clawdbot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw
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

export default function CronsPage() {
  const [crons, setCrons] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDisabled, setShowDisabled] = useState(true)
  const [sortField, setSortField] = useState<SortField>('nextRun')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    loadCrons()
  }, [])

  const loadCrons = async () => {
    setLoading(true)
    try {
      const data = await listCrons()
      setCrons(data)
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
      return matchesSearch && matchesDisabled
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
  }, [crons, searchQuery, showDisabled, sortField, sortDirection])

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
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cron Jobs</h1>
          <p className="text-muted-foreground">
            Manage scheduled tasks and automation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            {stats.enabled} Active
          </Badge>
          <Button onClick={loadCrons} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.enabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.disabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.ok}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cron jobs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showDisabled}
                onCheckedChange={setShowDisabled}
              />
              <label className="text-sm text-muted-foreground cursor-pointer">
                Show disabled
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">Schedule</TableHead>
                <TableHead 
                  className="w-[150px] cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('nextRun')}
                >
                  <div className="flex items-center gap-2">
                    Next Run
                    {getSortIcon('nextRun')}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[150px] cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('lastRun')}
                >
                  <div className="flex items-center gap-2">
                    Last Run
                    {getSortIcon('lastRun')}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[100px] cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center gap-2">
                    Duration
                    {getSortIcon('duration')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCrons.map((cron) => {
                const statusInfo = getStatusInfo(cron)
                const StatusIcon = statusInfo.icon
                
                return (
                  <TableRow key={cron.id}>
                    <TableCell>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cron.name}</div>
                        {cron.state?.lastError && (
                          <div className="text-xs text-red-500 truncate max-w-md">
                            {cron.state.lastError}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs">{cron.schedule.expr}</span>
                      </div>
                      {cron.schedule.tz && (
                        <div className="text-xs text-muted-foreground">{cron.schedule.tz}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {cron.state?.nextRunAtMs ? (
                        <div>
                          <div className="font-medium text-sm">
                            {getTimeUntil(cron.state.nextRunAtMs)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {msToDate(cron.state.nextRunAtMs).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cron.state?.lastRunAtMs ? (
                        <div>
                          <div className="font-medium text-sm">
                            {getTimeSince(cron.state.lastRunAtMs)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {msToDate(cron.state.lastRunAtMs).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {cron.state?.lastDurationMs ? (
                        <span className="font-mono text-sm">
                          {formatDuration(cron.state.lastDurationMs)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Run now"
                        >
                          <Play className="h-3.5 w-3.5" />
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCrons.length)} of {filteredAndSortedCrons.length} cron jobs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
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
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
