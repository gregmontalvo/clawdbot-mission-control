import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source?: string
}

export async function GET() {
  try {
    // Get log file path from gateway status
    const { stdout } = await execAsync('clawdbot gateway status 2>&1 | grep "File logs:"')
    const logPath = stdout.match(/File logs: (.+)/)?.[1]?.trim()
    
    if (!logPath) {
      return NextResponse.json({ logs: [] })
    }

    // Read last 500 lines of log file
    const { stdout: logContent } = await execAsync(`tail -n 500 "${logPath}"`)
    
    // Parse logs
    const logs: LogEntry[] = []
    const lines = logContent.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      // Try to parse structured logs
      const match = line.match(/^\[(.+?)\] (\w+): (.+)$/)
      if (match) {
        logs.push({
          timestamp: match[1],
          level: match[2].toLowerCase() as any,
          message: match[3]
        })
      } else {
        // Fallback for unstructured logs
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: line
        })
      }
    }
    
    return NextResponse.json({ logs: logs.reverse() })
  } catch (error: any) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error.message, logs: [] },
      { status: 500 }
    )
  }
}
