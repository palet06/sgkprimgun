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
  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <CardTitle className="text-base font-semibold text-primary">
            Sorgu Sonuclari ({results.length})
          </CardTitle>
          {results.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Basarili: {successCount}
              </Badge>
              {errorCount > 0 && (
                <Badge variant="destructive">
                  Hatali: {errorCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henuz sonuc yok
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[1200px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cyan-600 hover:bg-cyan-600">
                    <TableHead className="text-white font-semibold min-w-[140px] sticky left-0 bg-cyan-600 z-10">
                      Kimlik Numarasi
                    </TableHead>
                    <TableHead className="text-white font-semibold text-center min-w-[80px]">
                      Durum
                    </TableHead>
                    {months.map((month) => (
                      <TableHead
                        key={month}
                        className="text-white font-semibold text-center min-w-[100px]"
                      >
                        Prim Yatan Gun Sayisi
                        <br />
                        <span className="text-xs">({year}/{month})</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-white font-semibold min-w-[200px]">
                      Is yeri unvani
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const isError = result.status === "error"
                    return (
                      <TableRow
                        key={result.tcKimlikNo}
                        className={`${index % 2 === 0 ? "bg-background" : "bg-muted/30"} ${isError ? "bg-red-50" : ""}`}
                      >
                        <TableCell className={`font-mono font-medium sticky left-0 z-10 ${isError ? "bg-red-50" : "bg-inherit"}`}>
                          {result.tcKimlikNo}
                        </TableCell>
                        <TableCell className="text-center">
                          {isError ? (
                            <Badge variant="destructive" className="font-semibold">
                              HATA
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              OK
                            </Badge>
                          )}
                        </TableCell>
                        {months.map((month) => {
                          const key = `${year}/${month}`
                          const gun = result.aylikGunler[key] || 0
                          return (
                            <TableCell key={month} className="text-center">
                              {isError ? (
                                <span className="text-red-500 font-semibold">HATA</span>
                              ) : gun > 0 ? (
                                <Badge variant="secondary" className="font-mono">
                                  {gun}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                          )
                        })}
                        <TableCell 
                          className={`text-sm max-w-[200px] truncate ${isError ? "text-red-600" : ""}`} 
                          title={isError ? result.errorMessage : result.isYeriUnvani}
                        >
                          {isError ? result.errorMessage || "Hata" : (result.isYeriUnvani || "-")}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
