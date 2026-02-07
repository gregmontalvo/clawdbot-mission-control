/**
 * Direct Clawdbot CLI interface
 */
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
  
  async function scanDirectory(dir: string, baseDir: string = dir) {
    const entries = await readdir(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stats = await stat(fullPath)
      const relativePath = fullPath.replace(baseDir + '/', '')
      
      if (entry.startsWith('.')) continue // Skip hidden files
      
      if (stats.isDirectory()) {
        files.push({
          name: entry,
          path: fullPath,
          relativePath,
          size: 0,
          modified: stats.mtime,
          isDirectory: true
        })
        
        // Recursively scan subdirectories
        await scanDirectory(fullPath, baseDir)
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
    // Scan workspace root for .md files
    await scanDirectory(WORKSPACE)
    
    // Also scan memory directory
    const memoryDir = join(WORKSPACE, 'memory')
    try {
      await scanDirectory(memoryDir)
    } catch (e) {
      // Memory dir might not exist
    }
    
    return files.sort((a, b) => {
      // Directories first, then by name
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
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
