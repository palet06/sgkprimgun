"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { QueryResult } from "@/lib/sgk-types"

interface ResultsTableProps {
  results: QueryResult[]
  year: number
}

export function ResultsTable({ results, year }: ResultsTableProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const successResults = results.filter((r) => r.status === "success")

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Sorgu Sonuçları ({successResults.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {successResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz sonuç yok
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[1200px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cyan-600 hover:bg-cyan-600">
                    <TableHead className="text-white font-semibold min-w-[140px] sticky left-0 bg-cyan-600 z-10">
                      Kimlik Numarası
                    </TableHead>
                    {months.map((month) => (
                      <TableHead
                        key={month}
                        className="text-white font-semibold text-center min-w-[100px]"
                      >
                        Prim Yatan Gün Sayısı
                        <br />
                        <span className="text-xs">({year}/{month})</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-white font-semibold min-w-[200px]">
                      İş yeri unvanı
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {successResults.map((result, index) => (
                    <TableRow
                      key={result.tcKimlikNo}
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                    >
                      <TableCell className="font-mono font-medium sticky left-0 bg-inherit z-10">
                        {result.tcKimlikNo}
                      </TableCell>
                      {months.map((month) => {
                        const key = `${year}/${month}`
                        const gun = result.aylikGunler[key] || 0
                        return (
                          <TableCell key={month} className="text-center">
                            {gun > 0 ? (
                              <Badge variant="secondary" className="font-mono">
                                {gun}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-sm max-w-[200px] truncate" title={result.isYeriUnvani}>
                        {result.isYeriUnvani || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
