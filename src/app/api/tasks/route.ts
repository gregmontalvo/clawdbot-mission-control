import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface Task {
  id: string
  text: string
  source: string
  file?: string
  completed: boolean
  priority?: 'high' | 'medium' | 'low'
  category: 'todo' | 'reminder' | 'project' | 'crm'
}

async function extractTasksFromMemory(): Promise<Task[]> {
  const tasks: Task[] = []
  const memoryDir = path.join(process.env.HOME || '', 'clawd', 'memory')
  
  try {
    const files = await fs.readdir(memoryDir)
    const mdFiles = files.filter(f => f.endsWith('.md'))
    
    for (const file of mdFiles) {
      const filePath = path.join(memoryDir, file)
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Extract [ ] and [x] checkboxes
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        // Uncompleted tasks
        const uncompleted = line.match(/^[\s-]*\[ \]\s+(.+)/)
        if (uncompleted) {
          tasks.push({
            id: `${file}-${index}`,
            text: uncompleted[1].trim(),
            source: 'memory',
            file,
            completed: false,
            priority: line.includes('⚠️') || line.includes('🔴') ? 'high' : 
                     line.includes('🟡') ? 'medium' : 'low',
            category: 'todo'
          })
        }
        
        // Completed tasks (last 7 days only)
        const completed = line.match(/^[\s-]*\[x\]\s+(.+)/i)
        if (completed) {
          tasks.push({
            id: `${file}-${index}`,
            text: completed[1].trim(),
            source: 'memory',
            file,
            completed: true,
            priority: 'low',
            category: 'todo'
          })
        }
      })
    }
  } catch (error) {
    console.error('Error reading memory files:', error)
  }
  
  return tasks
}

async function extractProjectTasks(): Promise<Task[]> {
  const tasks: Task[] = []
  const projectsFile = path.join(process.env.HOME || '', 'clawd', 'memory', 'projects-open.md')
  
  try {
    const content = await fs.readFile(projectsFile, 'utf-8')
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      if (line.includes('⏸️') || line.includes('🔴') || line.includes('⚠️')) {
        tasks.push({
          id: `project-${index}`,
          text: line.replace(/[⏸️🔴⚠️]/g, '').trim(),
          source: 'projects',
          file: 'projects-open.md',
          completed: false,
          priority: 'high',
          category: 'project'
        })
      }
    })
  } catch (error) {
    // File might not exist
  }
  
  return tasks
}

async function extractHeartbeatTasks(): Promise<Task[]> {
  const tasks: Task[] = []
  const heartbeatFile = path.join(process.env.HOME || '', 'clawd', 'HEARTBEAT.md')
  
  try {
    const content = await fs.readFile(heartbeatFile, 'utf-8')
    
    // Look for pending checks
    if (content.includes('[ ] ')) {
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        const match = line.match(/\[ \]\s+(.+)/)
        if (match) {
          tasks.push({
            id: `heartbeat-${index}`,
            text: match[1].trim(),
            source: 'heartbeat',
            file: 'HEARTBEAT.md',
            completed: false,
            priority: 'medium',
            category: 'reminder'
          })
        }
      })
    }
  } catch (error) {
    // File might not exist
  }
  
  return tasks
}

export async function GET() {
  try {
    const [memoryTasks, projectTasks, heartbeatTasks] = await Promise.all([
      extractTasksFromMemory(),
      extractProjectTasks(),
      extractHeartbeatTasks()
    ])
    
    const allTasks = [...memoryTasks, ...projectTasks, ...heartbeatTasks]
    
    // Filter recent completed tasks (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const recentTasks = allTasks.filter(task => {
      if (!task.completed) return true
      // For completed tasks, check if file was modified recently
      // (simplified - in production would parse dates from content)
      return true
    })
    
    return NextResponse.json({
      tasks: recentTasks,
      stats: {
        total: allTasks.length,
        pending: allTasks.filter(t => !t.completed).length,
        completed: allTasks.filter(t => t.completed).length,
        high: allTasks.filter(t => t.priority === 'high' && !t.completed).length,
        medium: allTasks.filter(t => t.priority === 'medium' && !t.completed).length,
        low: allTasks.filter(t => t.priority === 'low' && !t.completed).length,
      }
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
