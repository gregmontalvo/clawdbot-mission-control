import { listCrons } from "@/lib/clawdbot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Play, 
  Clock, 
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { getTimeUntil, getTimeSince, formatDuration, cronToHuman, msToDate } from "@/lib/utils"

function getStatusColor(status?: string) {
  switch (status) {
    case "ok":
      return "text-green-500"
    case "error":
      return "text-red-500"
    default:
      return "text-yellow-500"
  }
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "ok":
      return <CheckCircle2 className="h-4 w-4" />
    case "error":
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CronsPage() {
  const crons = await listCrons()
  const enabledCrons = crons.filter(c => c.enabled)

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cron Jobs</h1>
          <p className="text-muted-foreground">
            Manage scheduled tasks and automation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {enabledCrons.length} Active
          </Badge>
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Scheduler Running
          </Badge>
        </div>
      </div>

      {/* Crons Grid */}
      <div className="grid gap-4">
        {crons
          .sort((a, b) => {
            // Sort by next run time
            const aNext = a.state?.nextRunAtMs || Infinity
            const bNext = b.state?.nextRunAtMs || Infinity
            return aNext - bNext
          })
          .map((cron) => (
          <Card key={cron.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{cron.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {cronToHuman(cron.schedule.expr)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">
                        {cron.schedule.expr}
                      </code>
                    </div>
                    <div className="text-xs">
                      {cron.schedule.tz}
                    </div>
                  </div>
                </div>
                <Switch checked={cron.enabled} disabled />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {/* Next Run */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Next Run</p>
                  <div>
                    {cron.state?.nextRunAtMs ? (
                      <>
                        <Badge variant="outline">
                          {getTimeUntil(cron.state.nextRunAtMs)}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {msToDate(cron.state.nextRunAtMs).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not scheduled</p>
                    )}
                  </div>
                </div>

                {/* Last Run */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Run</p>
                  {cron.state?.lastRunAtMs ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={getStatusColor(cron.state.lastStatus)}>
                          {getStatusIcon(cron.state.lastStatus)}
                        </div>
                        <span className="text-sm">{(cron.state.lastStatus || 'unknown').toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getTimeSince(cron.state.lastRunAtMs)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Never run</p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  {cron.state?.lastDurationMs ? (
                    <p className="text-sm font-medium">{formatDuration(cron.state.lastDurationMs)}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">-</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" disabled>
                    <Play className="mr-1 h-3 w-3" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="outline" disabled>
                    Logs
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {cron.state?.lastStatus === 'error' && cron.state.lastError && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-sm text-red-500">{cron.state.lastError}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
