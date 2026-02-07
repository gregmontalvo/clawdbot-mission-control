"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Blocks,
  Clock,
  Calendar,
  Brain,
  CheckSquare,
  Users,
  DollarSign,
  ScrollText,
  Settings,
  Bot
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Skills', href: '/skills', icon: Blocks },
  { name: 'Crons', href: '/crons', icon: Clock },
  { name: 'Calendario', href: '/calendario', icon: Calendar },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Costs', href: '/costs', icon: DollarSign },
  { name: 'Logs', href: '/logs', icon: ScrollText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Bot className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Mission Control</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            C
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium">Coach</p>
            <p className="text-xs text-muted-foreground">Clawdbot Agent</p>
          </div>
        </div>
      </div>
    </div>
  )
}
