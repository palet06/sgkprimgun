"use client"

import { useState, useCallback, useRef } from "react"
import { QueryForm } from "@/components/sgk/query-form"
import { ProgressPanel } from "@/components/sgk/progress-panel"
import { ResultsTable } from "@/components/sgk/results-table"
import { LogsPanel } from "@/components/sgk/logs-panel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { QueryResult, LogEntry, QuerySettings, SgkResponse, HizmetKaydi } from "@/lib/sgk-types"

export default function SgkQueryPage() {
  const [apiKey, setApiKey] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [kimlikNumaralari, setKimlikNumaralari] = useState("")
  const [settings, setSettings] = useState<QuerySettings>({ delay: 300, concurrency: 1 })
  const [results, setResults] = useState<QueryResult[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedYear, setSelectedYear] = useState(2025)
  const abortControllerRef = useRef<AbortController | null>(null)

  // TC Kimlik numaralarını parse et
  const parseKimlikNumaralari = useCallback((text: string): string[] => {
    const numbers = text
      .split(/[\n,;|\s]+/)
      .map((n) => n.trim())
      .filter((n) => /^\d{9,11}$/.test(n))
    // return [...new Set(numbers)] // Tekrarları kaldır
    return numbers
   }, [])

  const validKimlikler = parseKimlikNumaralari(kimlikNumaralari)

  const addLog = useCallback((tcKimlikNo: string, status: LogEntry["status"], message: string) => {
    setLogs((prev) => [...prev, { timestamp: new Date(), tcKimlikNo, status, message }])
  }, [])

  const processResponse = (tcKimlikNo: string, response: SgkResponse): QueryResult => {
    const result: QueryResult = {
      tcKimlikNo,
      status: "success",
      aylikGunler: {},
    }

    if (!response.success || !response.data?.sigortaliBilgisi?.sgkSigortaliBilgileri) {
      result.status = "error"
      result.errorMessage = response.message || response.data?.hataMesaji || "Veri alınamadı"
      return result
    }

    const hizmetler = response.data.sigortaliBilgisi.sgkSigortaliBilgileri.sigortaliTumOrtakHizmetlerList || []
    const kisiBilgisi = response.data.sigortaliBilgisi.sgkKisiBilgisi

    if (kisiBilgisi) {
      result.adi = kisiBilgisi.adi
      result.soyAdi = kisiBilgisi.soyAdi
    }

    // Sadece "Asıl" bordro türü kayıtlarını işle ve yıla göre grupla
    const asilHizmetler = hizmetler.filter((h: HizmetKaydi) => h.bordroTuru === "A")

    // Her ay için son iş yerini ve toplam gün sayısını hesapla
    const aylikVeriler: Record<string, { gun: number; isYeri: string }> = {}

    asilHizmetler.forEach((hizmet: HizmetKaydi) => {
      const key = `${hizmet.bordroYili}/${hizmet.bordroDonemi}`
      
      if (!aylikVeriler[key]) {
        aylikVeriler[key] = { gun: 0, isYeri: "" }
      }
      
      aylikVeriler[key].gun += hizmet.gun
      // Son iş yerini sakla
      if (hizmet.isYeriUnvani) {
        aylikVeriler[key].isYeri = hizmet.isYeriUnvani
      }
    })

    // Sonuçları aylik günlere dönüştür
    Object.entries(aylikVeriler).forEach(([key, value]) => {
      result.aylikGunler[key] = value.gun
      if (value.isYeri && !result.isYeriUnvani) {
        result.isYeriUnvani = value.isYeri
      }
    })

    // En son iş yerini bul
    if (asilHizmetler.length > 0) {
      const sortedHizmetler = [...asilHizmetler].sort((a, b) => {
        if (a.bordroYili !== b.bordroYili) return b.bordroYili - a.bordroYili
        return b.bordroDonemi - a.bordroDonemi
      })
      result.isYeriUnvani = sortedHizmetler[0].isYeriUnvani
    }

    result.rawData = response
    return result
  }

  const queryOne = async (tcKimlikNo: string, signal: AbortSignal): Promise<QueryResult> => {
    try {
      addLog(tcKimlikNo, "pending", "Sorgu başlatılıyor...")

      const response = await fetch("/api/sgk-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tcKimlikNo, apiKey, apiUrl }),
        signal,
      })

      const data: SgkResponse = await response.json()
      const result = processResponse(tcKimlikNo, data)

      if (result.status === "success") {
        const toplamGun = Object.values(result.aylikGunler).reduce((a, b) => a + b, 0)
        addLog(tcKimlikNo, "success", `Başarılı - Toplam ${toplamGun} gün bulundu`)
      } else {
        addLog(tcKimlikNo, "error", result.errorMessage || "Hata oluştu")
      }

      return result
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata"
      addLog(tcKimlikNo, "error", errorMessage)
      return {
        tcKimlikNo,
        status: "error",
        errorMessage,
        aylikGunler: {},
      }
    }
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const startQuery = async () => {
    if (validKimlikler.length === 0) return

    setIsRunning(true)
    setResults([])
    setLogs([])
    abortControllerRef.current = new AbortController()

    const { delay, concurrency } = settings
    const signal = abortControllerRef.current.signal

    try {
      // Batch processing with concurrency
      for (let i = 0; i < validKimlikler.length; i += concurrency) {
        if (signal.aborted) break

        const batch = validKimlikler.slice(i, i + concurrency)
        const batchResults = await Promise.all(
          batch.map((tcKimlikNo) => queryOne(tcKimlikNo, signal))
        )

        setResults((prev) => [...prev, ...batchResults])

        if (i + concurrency < validKimlikler.length && delay > 0) {
          await sleep(delay)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        addLog("-", "error", "Sorgulama kullanıcı tarafından durduruldu")
      }
    } finally {
      setIsRunning(false)
      abortControllerRef.current = null
    }
  }

  const stopQuery = () => {
    abortControllerRef.current?.abort()
    setIsRunning(false)
  }

  const exportToExcel = () => {
    if (results.length === 0) return

    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    // CSV header - Durum sutunu eklendi
    const headers = [
      "Kimlik Numarası",
      "Durum",
      ...months.map((m) => `Prim Yatan Gün Sayısı (${selectedYear}/${m})`),
      "İş yeri unvanı",
      "Hata Mesajı",
    ]

    // CSV rows - tum sonuclari dahil et
    const rows = results.map((result) => [
      result.tcKimlikNo,
      result.status === "error" ? "HATA" : "BASARILI",
      ...months.map((m) => result.status === "error" ? "HATA" : (result.aylikGunler[`${selectedYear}/${m}`] || 0)),
      result.isYeriUnvani || "",
      result.errorMessage || "",
    ])

    // Create CSV content
    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n")

    // Download
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sgk_prim_gun_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  return (
    <main className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            SGK Döneme Göre Yatan Prim Gün Sayısı Sorgulama Sistemi
          </h1>
          <p className="text-muted-foreground">
            Çoklu kimlik numarası ile toplu SGK hizmet dökümü sorgulama
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <QueryForm
              apiKey={apiKey}
              setApiKey={setApiKey}
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              kimlikNumaralari={kimlikNumaralari}
              setKimlikNumaralari={setKimlikNumaralari}
              settings={settings}
              setSettings={setSettings}
              validCount={validKimlikler.length}
            />
          </div>

          {/* Right Column - Progress & Controls */}
          <div className="space-y-4">
            <ProgressPanel
              results={results}
              total={validKimlikler.length}
              isRunning={isRunning}
              onStart={startQuery}
              onStop={stopQuery}
              onExport={exportToExcel}
            />

            {/* Year Selector */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Görüntülenecek Yıl</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Table 
        <ResultsTable results={results} year={selectedYear} />*/}

        {/* Logs 
        <LogsPanel logs={logs} />*/}
      </div>
    </main>
  )
}
