import { NextResponse } from 'next/server'
import { readdir, stat, readFile } from 'fs/promises'
import { join } from 'path'

const WORKSPACE = '/Users/macmini/clawd'
const SKILLS_DIR = join(WORKSPACE, 'skills')

interface Skill {
  name: string
  path: string
  description?: string
  hasSkillMd: boolean
}

export async function GET() {
  try {
    const skills: Skill[] = []
    
    // Read skills directory
    const entries = await readdir(SKILLS_DIR)
    
    for (const entry of entries) {
      const skillPath = join(SKILLS_DIR, entry)
      const stats = await stat(skillPath)
      
      if (stats.isDirectory()) {
        const skillMdPath = join(skillPath, 'SKILL.md')
        let hasSkillMd = false
        let description = ''
        
        try {
          await stat(skillMdPath)
          hasSkillMd = true
          
          // Try to read first line as description
          const content = await readFile(skillMdPath, 'utf-8')
          const firstLine = content.split('\n').find(line => 
            line.startsWith('#') && !line.startsWith('##')
          )
          if (firstLine) {
            description = firstLine.replace(/^#\s*/, '').trim()
          }
        } catch (e) {
          // No SKILL.md
        }
        
        skills.push({
          name: entry,
          path: skillPath,
          description,
          hasSkillMd
        })
      }
    }
    
    // Sort by name
    skills.sort((a, b) => a.name.localeCompare(b.name))
    
    return NextResponse.json({ skills })
  } catch (error) {
    console.error('Failed to list skills:', error)
    return NextResponse.json(
      { error: 'Failed to list skills', skills: [] },
      { status: 500 }
    )
  }
}
