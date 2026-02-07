import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const WORKSPACE = '/Users/macmini/clawd'
const SKILLS_DIR = join(WORKSPACE, 'skills')

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const skillPath = join(SKILLS_DIR, params.name, 'SKILL.md')
    const content = await readFile(skillPath, 'utf-8')
    
    return NextResponse.json({
      name: params.name,
      path: skillPath,
      content
    })
  } catch (error) {
    console.error('Failed to read skill:', error)
    return NextResponse.json(
      { error: 'Failed to read skill' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { content } = await request.json()
    const skillPath = join(SKILLS_DIR, params.name, 'SKILL.md')
    
    await writeFile(skillPath, content, 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to write skill:', error)
    return NextResponse.json(
      { error: 'Failed to write skill' },
      { status: 500 }
    )
  }
}
