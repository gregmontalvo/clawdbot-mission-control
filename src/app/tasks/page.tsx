'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckSquare, Clock, ListTodo, AlertTriangle, RefreshCw, FileText, Folder, Bell } from "lucide-react"

interface Task {
  id: string
  text: string
  source: string
  file?: string
  completed: boolean
  priority?: 'high' | 'medium' | 'low'
  category: 'todo' | 'reminder' | 'project' | 'crm'
}

interface TaskStats {
  total: number
  pending: number
  completed: number
  high: number
  medium: number
  low: number
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    completed: 0,
    high: 0,
    medium: 0,
    low: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('pending')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data.tasks || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'todo':
        return <CheckSquare className="h-4 w-4" />
      case 'reminder':
        return <Bell className="h-4 w-4" />
      case 'project':
        return <Folder className="h-4 w-4" />
      case 'crm':
        return <FileText className="h-4 w-4" />
      default:
        return <ListTodo className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed
      case 'completed':
        return task.completed
      case 'high':
        return !task.completed && task.priority === 'high'
      default:
        return true
    }
  })

  const pendingTasks = filteredTasks.filter(t => !t.completed)
  const completedTasks = filteredTasks.filter(t => t.completed)

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Pending and completed tasks from memory, projects, and heartbeat
          </p>
        </div>
        <Button onClick={loadTasks} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer" onClick={() => setFilter('all')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All tasks
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => setFilter('pending')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Tasks awaiting action
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => setFilter('high')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.high}</div>
            <p className="text-xs text-muted-foreground">
              Urgent tasks
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => setFilter('completed')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('high')}
        >
          High Priority
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>{pendingTasks.length} tasks to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority?.toUpperCase() || 'LOW'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.source}
                          </Badge>
                        </div>
                        <p className="text-sm">{task.text}</p>
                        {task.file && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.file}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>{completedTasks.length} tasks done</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border opacity-60"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {task.source}
                          </Badge>
                        </div>
                        <p className="text-sm line-through">{task.text}</p>
                        {task.file && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.file}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === 'completed' ? 'No completed tasks in the last 7 days' : 'No pending tasks found'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
