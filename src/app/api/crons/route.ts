import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use the cron tool to get the list
    const { stdout } = await execAsync(
      'clawdbot cron list --format=json',
      { timeout: 10000 }
    )
    
    const data = JSON.parse(stdout)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch crons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crons', details: error.message },
      { status: 500 }
    )
  }
}
