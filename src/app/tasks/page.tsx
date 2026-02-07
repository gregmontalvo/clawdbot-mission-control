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
import { CheckSquare, Clock, ListTodo, AlertTriangle, RefreshCw, FileText, Folder, Bell, CheckCircle2, Circle } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'high'>('pending')

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
        return <CheckSquare className="h-3 w-3" />
      case 'reminder':
        return <Bell className="h-3 w-3" />
      case 'project':
        return <Folder className="h-3 w-3" />
      case 'crm':
        return <FileText className="h-3 w-3" />
      default:
        return <ListTodo className="h-3 w-3" />
    }
  }

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">HIGH</Badge>
      case 'medium':
        return <Badge variant="default" className="text-xs">MED</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">LOW</Badge>
    }
  }

  const filteredTasks = tasks.filter(task => {
    switch (activeTab) {
      case 'pending':
        return !task.completed
      case 'completed':
        return task.completed
      case 'high':
        return !task.completed && task.priority === 'high'
      default:
        return !task.completed
    }
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
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Badge variant="outline" className="gap-2">
            <ListTodo className="h-3 w-3" />
            {stats.total} Total
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Clock className="h-3 w-3 text-blue-500" />
            {stats.pending} Pending
          </Badge>
          {stats.high > 0 && (
            <Badge variant="destructive" className="gap-2">
              <AlertTriangle className="h-3 w-3" />
              {stats.high} Urgent
            </Badge>
          )}
        </div>
        <Button onClick={loadTasks} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="high">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            High Priority ({stats.high})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[40px] h-10 py-2">Status</TableHead>
                  <TableHead className="w-[80px] h-10 py-2">Priority</TableHead>
                  <TableHead className="w-[80px] h-10 py-2">Category</TableHead>
                  <TableHead className="h-10 py-2">Task</TableHead>
                  <TableHead className="w-[120px] h-10 py-2">Source</TableHead>
                  <TableHead className="w-[250px] h-10 py-2">File</TableHead>
                  <TableHead className="w-[100px] h-10 py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="h-12">
                    <TableCell className="py-2">
                      {task.completed ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
                          <Circle className="h-3 w-3 text-blue-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {getPriorityBadge(task.priority)}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className="gap-1">
                        {getCategoryIcon(task.category)}
                        <span className="text-xs">{task.category}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className={`text-sm ${task.completed ? 'line-through opacity-60' : ''}`}>
                        {task.text}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className="text-xs">
                        {task.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      {task.file ? (
                        <div className="text-xs font-mono text-muted-foreground truncate">
                          {task.file}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title={task.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {task.completed ? <Circle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
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
