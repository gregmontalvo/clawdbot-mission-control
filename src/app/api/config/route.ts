import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use the gateway config tool
    const { stdout } = await execAsync(
      'clawdbot gateway config --format=json',
      { timeout: 10000 }
    )
    
    const data = JSON.parse(stdout)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch config', details: error.message },
      { status: 500 }
    )
  }
}
