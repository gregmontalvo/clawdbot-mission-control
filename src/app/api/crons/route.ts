import { NextResponse } from 'next/server'
import { listCrons } from '@/lib/clawdbot'

export async function GET() {
  try {
    const crons = await listCrons()
    return NextResponse.json({ crons })
  } catch (error) {
    console.error('Failed to fetch crons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crons' },
      { status: 500 }
    )
  }
}
