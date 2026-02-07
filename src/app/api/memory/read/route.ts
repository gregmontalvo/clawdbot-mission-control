import { NextResponse } from 'next/server'
import { readMemoryFile } from '@/lib/clawdbot'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter required' },
        { status: 400 }
      )
    }
    
    const content = await readMemoryFile(path)
    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('Failed to read file:', error)
    return NextResponse.json(
      { error: 'Failed to read file', details: error.message },
      { status: 500 }
    )
  }
}
