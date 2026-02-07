import { NextResponse } from 'next/server'
import { writeMemoryFile } from '@/lib/clawdbot'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { path, content } = await request.json()
    
    if (!path || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content required' },
        { status: 400 }
      )
    }
    
    await writeMemoryFile(path, content)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to write file:', error)
    return NextResponse.json(
      { error: 'Failed to write file', details: error.message },
      { status: 500 }
    )
  }
}
