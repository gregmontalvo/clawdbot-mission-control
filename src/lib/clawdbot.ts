/**
 * Direct Clawdbot CLI interface
 */
import 'server-only'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { join } from 'path'

const execAsync = promisify(exec)

export interface CronJob {
  id: string
  agentId: string
  name: string
  enabled: boolean
  createdAtMs: number
  updatedAtMs?: number
  schedule: {
    kind: string
    expr: string
    tz: string
  }
  sessionTarget: string
  wakeMode: string
  payload: {
    kind: string
    message?: string
    text?: string
    deliver?: boolean
    channel?: string
    to?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastStatus?: string
    lastDurationMs?: number
    lastError?: string
  }
}

export interface GatewayConfig {
  gateway?: {
    port?: number
    mode?: string
    bind?: string
  }
  channels?: {
    whatsapp?: any
    slack?: any
  }
  skills?: {
    load?: {
      extraDirs?: string[]
    }
    entries?: Record<string, any>
  }
}

export interface MemoryFile {
  name: string
  path: string
  relativePath: string
  size: number
  modified: Date
  isDirectory: boolean
}

export interface Skill {
  name: string
  path: string
  description?: string
  hasSkillMd: boolean
}

export async function listCrons(): Promise<CronJob[]> {
  try {
    const { stdout } = await execAsync(
      'clawdbot cron list --json',
      { timeout: 10000 }
    )
    const data = JSON.parse(stdout)
    return data.jobs || []
  } catch (error) {
    console.error('Failed to fetch crons:', error)
    return []
  }
}

export async function getConfig(): Promise<GatewayConfig> {
  try {
    const { stdout } = await execAsync(
      'clawdbot gateway config --json',
      { timeout: 10000 }
    )
    const data = JSON.parse(stdout)
    return data.parsed || {}
  } catch (error) {
    console.error('Failed to fetch config:', error)
    return {}
  }
}

const WORKSPACE = '/Users/macmini/clawd'

export async function listMemoryFiles(): Promise<MemoryFile[]> {
  const files: MemoryFile[] = []
  
  // Directories to skip
  const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'out',
    '.cache',
    '.remotion',
    'coverage'
  ])
  
  async function scanDirectory(dir: string, baseDir: string = dir, depth: number = 0) {
    // Limit depth to prevent infinite loops
    if (depth > 10) return
    
    const entries = await readdir(dir)
    
    for (const entry of entries) {
      // Skip hidden files and excluded directories
      if (entry.startsWith('.') || SKIP_DIRS.has(entry)) continue
      
      const fullPath = join(dir, entry)
      const stats = await stat(fullPath)
      const relativePath = fullPath.replace(baseDir + '/', '')
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        await scanDirectory(fullPath, baseDir, depth + 1)
      } else if (entry.endsWith('.md')) {
        files.push({
          name: entry,
          path: fullPath,
          relativePath,
          size: stats.size,
          modified: stats.mtime,
          isDirectory: false
        })
      }
    }
  }
  
  try {
    // Scan workspace root
    await scanDirectory(WORKSPACE)
    
    return files.sort((a, b) => {
      // Sort by relative path
      return a.relativePath.localeCompare(b.relativePath)
    })
  } catch (error) {
    console.error('Failed to list memory files:', error)
    return []
  }
}

export async function readMemoryFile(relativePath: string): Promise<string> {
  const fullPath = join(WORKSPACE, relativePath)
  
  // Security check - ensure path is within workspace
  if (!fullPath.startsWith(WORKSPACE)) {
    throw new Error('Invalid path: outside workspace')
  }
  
  try {
    const content = await readFile(fullPath, 'utf-8')
    return content
  } catch (error) {
    console.error('Failed to read file:', error)
    throw error
  }
}

export async function writeMemoryFile(relativePath: string, content: string): Promise<void> {
  const fullPath = join(WORKSPACE, relativePath)
  
  // Security check - ensure path is within workspace
  if (!fullPath.startsWith(WORKSPACE)) {
    throw new Error('Invalid path: outside workspace')
  }
  
  try {
    await writeFile(fullPath, content, 'utf-8')
  } catch (error) {
    console.error('Failed to write file:', error)
    throw error
  }
}

export async function listSkills(): Promise<Skill[]> {
  const config = await getConfig()
  const skillDirs = config.skills?.load?.extraDirs || []
  const skills: Skill[] = []
  
  for (const dir of skillDirs) {
    try {
      const entries = await readdir(dir)
      
      for (const entry of entries) {
        const skillPath = join(dir, entry)
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
    } catch (error) {
      console.error('Failed to scan skill directory:', dir, error)
    }
  }
  
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}
