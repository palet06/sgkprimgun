"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Square, Download } from "lucide-react"
import type { QueryResult } from "@/lib/sgk-types"

interface ProgressPanelProps {
  results: QueryResult[]
  total: number
  isRunning: boolean
  onStart: () => void
  onStop: () => void
  onExport: () => void
}

export function ProgressPanel({
  results,
  total,
  isRunning,
  onStart,
  onStop,
  onExport,
}: ProgressPanelProps) {
  const completed = results.filter((r) => r.status === "success").length
  const failed = results.filter((r) => r.status === "error").length
  const processed = completed + failed
  const progress = total > 0 ? (processed / total) * 100 : 0

  return (
    <div className="space-y-4">
      {/* İlerleme Durumu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary">İlerleme Durumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Toplam</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completed}</p>
              <p className="text-sm text-muted-foreground">Tamamlanan</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{failed}</p>
              <p className="text-sm text-muted-foreground">Başarısız</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">İlerleme</span>
              <span className="text-green-600 font-medium">{progress.toFixed(1)}% tamamlandı</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Kontroller */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary">Kontroller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isRunning ? (
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={onStop}
            >
              <Square className="h-4 w-4" />
              Sorgulamayı Durdur
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={onStart}
              disabled={total === 0}
            >
              <Play className="h-4 w-4" />
              Sorgulamayı Başlat
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onExport}
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4" />
            Excel Olarak İndir
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
