import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Anthropic pricing (as of Feb 2024)
const PRICING = {
  'claude-sonnet-4-5': { input: 3.00, output: 15.00 },
  'claude-opus-4-5': { input: 15.00, output: 75.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  // Fallback for unknown models
  'default': { input: 3.00, output: 15.00 }
}

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING.default
  return (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output)
}

export async function GET() {
  try {
    // Get session status via clawdbot CLI
    const { stdout } = await execAsync('clawdbot session status --json', {
      env: { ...process.env, PATH: process.env.PATH }
    })
    
    const sessionData = JSON.parse(stdout)
    
    // Get sessions list for breakdown
    const { stdout: sessionsStr } = await execAsync('clawdbot sessions list --json', {
      env: { ...process.env, PATH: process.env.PATH }
    })
    
    const sessions = JSON.parse(sessionsStr)
    
    // Calculate costs from session data
    const totalInputTokens = sessionData.usage?.inputTokens || 0
    const totalOutputTokens = sessionData.usage?.outputTokens || 0
    const model = sessionData.model || 'claude-sonnet-4-5'
    
    const totalCost = calculateCost(totalInputTokens, totalOutputTokens, model)
    
    // Estimate daily/weekly/monthly based on session duration
    const sessionDurationHours = (sessionData.durationMs || 0) / (1000 * 60 * 60)
    const costPerHour = sessionDurationHours > 0 ? totalCost / sessionDurationHours : 0
    
    const estimatedDaily = costPerHour * 24
    const estimatedWeekly = estimatedDaily * 7
    const estimatedMonthly = estimatedDaily * 30
    
    // Model breakdown (simplified - would need per-session tracking)
    const modelUsage = {
      [model]: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cost: totalCost,
        percentage: 100
      }
    }
    
    return NextResponse.json({
      current: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        cost: totalCost
      },
      estimates: {
        daily: estimatedDaily,
        weekly: estimatedWeekly,
        monthly: estimatedMonthly,
        avgPerDay: estimatedDaily
      },
      models: modelUsage,
      session: {
        durationHours: sessionDurationHours,
        costPerHour
      }
    })
  } catch (error) {
    console.error('Error fetching cost data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch cost data',
      current: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 },
      estimates: { daily: 0, weekly: 0, monthly: 0, avgPerDay: 0 },
      models: {},
      session: { durationHours: 0, costPerHour: 0 }
    }, { status: 500 })
  }
}
