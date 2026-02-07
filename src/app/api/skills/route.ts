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
  tags?: string[]
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
          
          // Read content and parse frontmatter
          const content = await readFile(skillMdPath, 'utf-8')
          let tags: string[] = []
          
          // Parse YAML frontmatter if exists
          if (content.startsWith('---')) {
            const frontmatterEnd = content.indexOf('---', 3)
            if (frontmatterEnd !== -1) {
              const frontmatter = content.slice(3, frontmatterEnd)
              
              // Extract description from frontmatter
              const descMatch = frontmatter.match(/description:\s*(.+?)(?:\n|$)/i)
              if (descMatch) {
                description = descMatch[1].trim()
              }
              
              // Extract tags from frontmatter
              const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/i)
              if (tagsMatch) {
                tags = tagsMatch[1]
                  .split(',')
                  .map(t => t.trim().replace(/['"]/g, ''))
                  .filter(Boolean)
              }
            }
          }
          
          // Fallback: Try to read first heading as description
          if (!description) {
            const firstLine = content.split('\n').find(line => 
              line.startsWith('#') && !line.startsWith('##')
            )
            if (firstLine) {
              description = firstLine.replace(/^#\s*/, '').trim()
            }
          }
          
          skills.push({
            name: entry,
            path: skillPath,
            description,
            hasSkillMd,
            tags
          })
        } catch (e) {
          // No SKILL.md
          skills.push({
            name: entry,
            path: skillPath,
            description,
            hasSkillMd
          })
        }
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
