import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert milliseconds timestamp to Date
 */
export function msToDate(ms: number): Date {
  return new Date(ms)
}

/**
 * Format time until a future date
 */
export function getTimeUntil(futureMs: number): string {
  const now = Date.now()
  const diff = futureMs - now
  
  if (diff < 0) return "Overdue"
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) {
    const remainingHours = hours % 24
    return `In ${days}d ${remainingHours}h`
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `In ${hours}h ${remainingMinutes}m`
  }
  return `In ${minutes}m`
}

/**
 * Format time since a past date
 */
export function getTimeSince(pastMs: number): string {
  const now = Date.now()
  const diff = now - pastMs
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "Just now"
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  const seconds = ms / 1000
  if (seconds < 1) return `${ms}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = seconds / 60
  return `${minutes.toFixed(1)}m`
}

/**
 * Parse cron expression to human readable
 */
export function cronToHuman(expr: string): string {
  const parts = expr.split(' ')
  if (parts.length !== 5) return expr
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  
  // Common patterns
  if (expr === '0 * * * *') return 'Every hour'
  if (expr === '*/30 * * * *') return 'Every 30 minutes'
  if (expr === '*/15 * * * *') return 'Every 15 minutes'
  if (expr.startsWith('0 ') && hour !== '*') {
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return `${days[parseInt(dayOfWeek)]} at ${hour}:00`
    }
    if (dayOfMonth !== '*' && month !== '*') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${months[parseInt(month) - 1]} ${dayOfMonth} at ${hour}:${minute}`
    }
    return `Daily at ${hour}:${minute.padStart(2, '0')}`
  }
  
  return expr
}
