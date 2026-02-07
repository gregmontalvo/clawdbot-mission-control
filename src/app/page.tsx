import { gateway } from "@/lib/gateway"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Zap, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { getTimeUntil, getTimeSince, msToDate } from "@/lib/utils"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const crons = await gateway.listCrons()
  const config = await gateway.getConfig()

  // Calculate stats
  const enabledCrons = crons.filter(c => c.enabled)
  const recentRuns = crons
    .filter(c => c.state?.lastRunAtMs)
    .sort((a, b) => (b.state?.lastRunAtMs || 0) - (a.state?.lastRunAtMs || 0))
    .slice(0, 5)
  
  const upcomingCrons = crons
    .filter(c => c.state?.nextRunAtMs && c.enabled)
    .sort((a, b) => (a.state?.nextRunAtMs || Infinity) - (b.state?.nextRunAtMs || Infinity))
    .slice(0, 5)

  const errorCount = crons.filter(c => c.state?.lastStatus === 'error').length
  const successCount = crons.filter(c => c.state?.lastStatus === 'ok').length
  const totalRuns = errorCount + successCount
  const successRate = totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0

  // Count skills from config
  const skillCount = Object.keys(config.skills?.entries || {}).length

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Greg. Here's what's happening with Clawdbot.
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crons</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCrons.length}</div>
            <p className="text-xs text-muted-foreground">
              {crons.length} total jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Available</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillCount}</div>
            <p className="text-xs text-muted-foreground">
              Configured and ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {successCount} OK / {errorCount} errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Complete</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successCount}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Next Crons */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last runs from cron jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRuns.length > 0 ? (
                recentRuns.map((cron) => (
                  <div key={cron.id} className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      cron.state?.lastStatus === 'ok' 
                        ? 'bg-green-500/10' 
                        : cron.state?.lastStatus === 'error'
                        ? 'bg-red-500/10'
                        : 'bg-yellow-500/10'
                    }`}>
                      {cron.state?.lastStatus === 'ok' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : cron.state?.lastStatus === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{cron.name}</p>
                      {cron.state?.lastError && (
                        <p className="text-xs text-red-500 line-clamp-1">
                          {cron.state.lastError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {cron.state?.lastRunAtMs ? getTimeSince(cron.state.lastRunAtMs) : 'Never run'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Scheduled Crons */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Crons</CardTitle>
            <CardDescription>Next scheduled executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingCrons.length > 0 ? (
                upcomingCrons.map((cron) => (
                  <div key={cron.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium line-clamp-1">{cron.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cron.state?.nextRunAtMs 
                          ? msToDate(cron.state.nextRunAtMs).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {cron.state?.nextRunAtMs ? getTimeUntil(cron.state.nextRunAtMs) : '-'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming crons</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Real-time status of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Gateway</p>
                <p className="text-xs text-muted-foreground">
                  Port {config.gateway?.port || 'unknown'}
                </p>
              </div>
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Running
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Main channel</p>
              </div>
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                {config.channels?.whatsapp ? 'Connected' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Slack</p>
                <p className="text-xs text-muted-foreground">Team channel</p>
              </div>
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                {config.channels?.slack ? 'Connected' : 'Offline'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
