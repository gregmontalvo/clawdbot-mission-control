/**
 * Clawdbot Gateway API Client
 */

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://127.0.0.1:18789'
const AUTH_TOKEN = process.env.GATEWAY_AUTH_TOKEN || ''

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
    whatsapp?: {
      enabled?: boolean
    }
    slack?: {
      enabled?: boolean
    }
  }
  skills?: {
    load?: {
      extraDirs?: string[]
    }
    entries?: Record<string, any>
  }
}

class GatewayClient {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = GATEWAY_URL
    this.token = AUTH_TOKEN
  }

  private async request(method: string, path: string, body?: any) {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Gateway request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async listCrons(): Promise<CronJob[]> {
    const data = await this.request('POST', '/api/cron/list', {})
    return data.jobs || []
  }

  async getConfig(): Promise<GatewayConfig> {
    const data = await this.request('POST', '/api/gateway/config.get', {})
    return data.result?.config || {}
  }

  async listSkills(): Promise<string[]> {
    // This would need to be implemented in the Gateway API
    // For now, return mock data
    return []
  }
}

export const gateway = new GatewayClient()
