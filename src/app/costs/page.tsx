'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, Calendar, Zap, RefreshCw, Clock } from "lucide-react"

interface CostData {
  current: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }
  estimates: {
    daily: number
    weekly: number
    monthly: number
    avgPerDay: number
  }
  models: {
    [key: string]: {
      inputTokens: number
      outputTokens: number
      cost: number
      percentage: number
    }
  }
  session: {
    durationHours: number
    costPerHour: number
  }
}

export default function CostsPage() {
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/costs')
      const costData = await response.json()
      setData(costData)
    } catch (error) {
      console.error('Failed to load cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(cost)
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(2)}M`
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(1)}K`
    }
    return tokens.toString()
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Costs</h1>
          <p className="text-muted-foreground">
            API usage and cost tracking
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {data && (
        <>
          {/* Current Session Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Session Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCost(data.current.cost)}</div>
                <p className="text-xs text-muted-foreground">
                  Current session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Daily</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCost(data.estimates.daily)}</div>
                <p className="text-xs text-muted-foreground">
                  24h projection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Monthly</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCost(data.estimates.monthly)}</div>
                <p className="text-xs text-muted-foreground">
                  30-day projection
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost/Hour</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCost(data.session.costPerHour)}</div>
                <p className="text-xs text-muted-foreground">
                  Average rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Token Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Token Usage</CardTitle>
              <CardDescription>Current session breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Input Tokens</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTokens(data.current.inputTokens)}
                    </span>
                  </div>
                  <Progress 
                    value={(data.current.inputTokens / data.current.totalTokens) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Output Tokens</span>
                    <span className="text-sm text-muted-foreground">
                      {formatTokens(data.current.outputTokens)}
                    </span>
                  </div>
                  <Progress 
                    value={(data.current.outputTokens / data.current.totalTokens) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Tokens</span>
                    <span className="text-sm font-bold">
                      {formatTokens(data.current.totalTokens)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Usage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Model Usage</CardTitle>
              <CardDescription>Cost breakdown by model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.models).map(([model, usage]) => (
                  <div key={model} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{model}</p>
                        <Badge variant="outline">{usage.percentage}%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Input:</span> {formatTokens(usage.inputTokens)}
                        </div>
                        <div>
                          <span className="font-medium">Output:</span> {formatTokens(usage.outputTokens)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCost(usage.cost)}</p>
                      <p className="text-xs text-muted-foreground">cost</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Current session statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Session Duration</dt>
                  <dd className="text-lg font-bold">
                    {data.session.durationHours.toFixed(2)} hours
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Cost Per Hour</dt>
                  <dd className="text-lg font-bold">
                    {formatCost(data.session.costPerHour)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Total Tokens</dt>
                  <dd className="text-lg font-bold">
                    {formatTokens(data.current.totalTokens)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Total Cost</dt>
                  <dd className="text-lg font-bold text-green-600">
                    {formatCost(data.current.cost)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>Anthropic API pricing (per 1M tokens)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Claude Sonnet 4.5</p>
                    <p className="text-sm text-muted-foreground">Input / Output</p>
                  </div>
                  <p className="text-sm font-mono">$3.00 / $15.00</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Claude Opus 4.5</p>
                    <p className="text-sm text-muted-foreground">Input / Output</p>
                  </div>
                  <p className="text-sm font-mono">$15.00 / $75.00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Alert (optional) */}
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle>Cost Projections</CardTitle>
              </div>
              <CardDescription>
                Based on current usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Weekly estimate:</span>{' '}
                  {formatCost(data.estimates.weekly)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Monthly estimate:</span>{' '}
                  {formatCost(data.estimates.monthly)}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  * Projections based on current session activity. Actual costs may vary.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
            <p className="text-muted-foreground">Loading cost data...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
