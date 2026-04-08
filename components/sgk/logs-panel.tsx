"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { LogEntry } from "@/lib/sgk-types"

interface LogsPanelProps {
  logs: LogEntry[]
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">İstek Logları</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded border" ref={scrollRef}>
          <div className="p-3 space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Henüz log yok</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 pb-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-muted-foreground shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  <Badge
                    variant={
                      log.status === "success"
                        ? "default"
                        : log.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                    className="shrink-0 text-[10px] px-1.5"
                  >
                    {log.status === "success" ? "OK" : log.status === "error" ? "ERR" : "..."}
                  </Badge>
                  <span className="text-muted-foreground shrink-0">{log.tcKimlikNo}:</span>
                  <span className={log.status === "error" ? "text-red-600" : "text-foreground"}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
