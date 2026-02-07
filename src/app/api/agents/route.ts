import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Call sessions list
    const { stdout } = await execAsync('clawdbot sessions list --json', {
      timeout: 10000,
      env: { 
        ...process.env,
        PATH: `/opt/homebrew/bin:${process.env.PATH}`
      }
    })
    
    const data = JSON.parse(stdout)
    
    return NextResponse.json({
      sessions: data.sessions || [],
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message, stderr: error.stderr },
      { status: 500 }
    )
  }
}
