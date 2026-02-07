import { NextResponse } from 'next/server'
import { listMemoryFiles } from '@/lib/clawdbot'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const files = await listMemoryFiles()
    return NextResponse.json(files)
  } catch (error: any) {
    console.error('Failed to list memory files:', error)
    return NextResponse.json(
      { error: 'Failed to list files', details: error.message },
      { status: 500 }
    )
  }
}
