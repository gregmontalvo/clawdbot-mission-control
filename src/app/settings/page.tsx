import { getConfig } from "@/lib/clawdbot"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, Server, MessageSquare, Blocks } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const config = await getConfig()

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Gateway configuration and system settings
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          Read-only
        </Badge>
      </div>

      {/* Gateway Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Gateway</CardTitle>
          </div>
          <CardDescription>Gateway daemon configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Port</dt>
              <dd className="text-lg font-mono">{config.gateway?.port || 'unknown'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Mode</dt>
              <dd className="text-lg">
                <Badge variant="outline">{config.gateway?.mode || 'unknown'}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Bind</dt>
              <dd className="text-lg font-mono">{config.gateway?.bind || 'unknown'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Channels */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Channels</CardTitle>
          </div>
          <CardDescription>Connected messaging platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${config.channels?.whatsapp ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    {config.channels?.whatsapp?.allowFrom?.length || 0} allowed contacts
                  </p>
                </div>
              </div>
              <Badge variant={config.channels?.whatsapp ? 'default' : 'secondary'}>
                {config.channels?.whatsapp ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {/* Slack */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${config.channels?.slack ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-sm text-muted-foreground">
                    Mode: {config.channels?.slack?.mode || 'unknown'}
                  </p>
                </div>
              </div>
              <Badge variant={config.channels?.slack ? 'default' : 'secondary'}>
                {config.channels?.slack ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            <CardTitle>Skills Configuration</CardTitle>
          </div>
          <CardDescription>Skill directories and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Extra Directories</p>
              <div className="space-y-1">
                {config.skills?.load?.extraDirs?.map((dir) => (
                  <p key={dir} className="text-sm font-mono bg-muted p-2 rounded">
                    {dir}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Configured Skills</p>
              <p className="text-sm text-muted-foreground">
                {Object.keys(config.skills?.entries || {}).length} skills with custom config
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Config */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Configuration</CardTitle>
          <CardDescription>Full gateway configuration (JSON)</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(config, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
