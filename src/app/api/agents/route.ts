import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get sessions list via clawdbot CLI
    const { stdout } = await execAsync('clawdbot sessions list --json', {
      env: { ...process.env, PATH: process.env.PATH }
    })
    
    const sessions = JSON.parse(stdout)
    
    // Get config for agent details
    const { stdout: configStr } = await execAsync('clawdbot gateway config.get --json', {
      env: { ...process.env, PATH: process.env.PATH }
    })
    
    const config = JSON.parse(configStr)
    
    return NextResponse.json({
      sessions,
      config: {
        model: config.model || 'unknown',
        workspace: config.agents?.main?.workspace || process.env.HOME + '/clawd',
        maxConcurrent: config.agents?.main?.maxConcurrent || 4,
        subAgentsMax: config.agents?.spawn?.max || 8,
        memorySearch: config.agents?.main?.memory?.search?.enabled !== false,
        sessionMemory: config.agents?.main?.memory?.session?.enabled || false,
        compactionMode: config.agents?.main?.compaction?.mode || 'safeguard'
      }
    })
  } catch (error) {
    console.error('Error fetching agents data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch agents data',
      sessions: [],
      config: {}
    }, { status: 500 })
  }
}
