import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const execAsync = promisify(exec)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionKey: string }> }
) {
  try {
    const { sessionKey } = await params
    
    // First, get session list to find the sessionId for this key
    const { stdout } = await execAsync(
      'clawdbot sessions --json',
      {
        timeout: 10000,
        env: { 
          ...process.env,
          PATH: `/opt/homebrew/bin:${process.env.PATH}`
        }
      }
    )
    
    const data = JSON.parse(stdout)
    const session = data.sessions?.find((s: any) => s.key === sessionKey)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', key: sessionKey },
        { status: 404 }
      )
    }
    
    // Read the session file directly
    const sessionFile = join(homedir(), '.clawdbot', 'agents', 'main', 'sessions', `${session.sessionId}.jsonl`)
    
    try {
      const content = readFileSync(sessionFile, 'utf-8')
      const lines = content.trim().split('\n')
      
      // Parse JSONL and extract messages
      const messages = lines
        .map(line => {
          try {
            return JSON.parse(line)
          } catch {
            return null
          }
        })
        .filter((event: any) => event?.type === 'message')
        .map((event: any) => ({
          role: event.message.role,
          content: Array.isArray(event.message.content) 
            ? event.message.content.map((c: any) => c.text || c.type).join('\n')
            : event.message.content,
          timestamp: event.timestamp
        }))
      
      return NextResponse.json({
        key: sessionKey,
        messages
      })
    } catch (fileError: any) {
      console.error('Failed to read session file:', fileError)
      return NextResponse.json(
        { error: 'Session file not found', details: fileError.message },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Failed to fetch session history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session history', details: error.message },
      { status: 500 }
    )
  }
}
