/**
 * Direct Clawdbot CLI interface
 */
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface CronJob {
  id: string
  agentId: string
  name: string
  enabled: boolean
  createdAtMs: number
  updatedAtMs?: number
  schedule: {
    kind: string
    expr: string
    tz: string
  }
  sessionTarget: string
  wakeMode: string
  payload: {
    kind: string
    message?: string
    text?: string
    deliver?: boolean
    channel?: string
    to?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastStatus?: string
    lastDurationMs?: number
    lastError?: string
  }
}

export interface GatewayConfig {
  gateway?: {
    port?: number
    mode?: string
    bind?: string
  }
  channels?: {
    whatsapp?: any
    slack?: any
  }
  skills?: {
    load?: {
      extraDirs?: string[]
    }
    entries?: Record<string, any>
  }
}

export async function listCrons(): Promise<CronJob[]> {
  try {
    const { stdout } = await execAsync(
      'clawdbot cron list --json',
      { timeout: 10000 }
    )
    const data = JSON.parse(stdout)
    return data.jobs || []
  } catch (error) {
    console.error('Failed to fetch crons:', error)
    return []
  }
}

export async function getConfig(): Promise<GatewayConfig> {
  try {
    const { stdout } = await execAsync(
      'clawdbot gateway config --json',
      { timeout: 10000 }
    )
    const data = JSON.parse(stdout)
    return data.parsed || {}
  } catch (error) {
    console.error('Failed to fetch config:', error)
    return {}
  }
}
