"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import type { QuerySettings } from "@/lib/sgk-types"

interface QueryFormProps {
  apiKey: string
  setApiKey: (value: string) => void
  apiUrl: string
  setApiUrl: (value: string) => void
  kimlikNumaralari: string
  setKimlikNumaralari: (value: string) => void
  settings: QuerySettings
  setSettings: (settings: QuerySettings) => void
  validCount: number
}

export function QueryForm({
  apiKey,
  setApiKey,
  apiUrl,
  setApiUrl,
  kimlikNumaralari,
  setKimlikNumaralari,
  settings,
  setSettings,
  validCount,
}: QueryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setKimlikNumaralari(text)
  }

  return (
    <div className="space-y-4">
      {/* API Key */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary">API Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="apiKey" className="text-sm text-muted-foreground">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="API Key giriniz..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="apiUrl" className="text-sm text-muted-foreground">
              API URL
            </Label>
            <Input
              id="apiUrl"
              type="text"
              placeholder="http://abc.com/sgk-service/hizmet/tum-sigortali-hizmet-dokumu-sorgula"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kimlik Numaraları */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary">Kimlik Numaraları</CardTitle>
          <p className="text-sm text-muted-foreground">
            Her satıra bir numara veya virgül ile ayırın
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={`Örnek:\n98044116610\n98044116611\n98044116612`}
            value={kimlikNumaralari}
            onChange={(e) => setKimlikNumaralari(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              CSV/TXT Yükle
            </Button>
            <p className="text-sm text-muted-foreground">
              Geçerli kimlik numaraları: <span className="font-semibold text-foreground">{validCount}</span> adet
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ayarlar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-primary">Sorgu Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="delay" className="text-sm text-muted-foreground">
                Gecikme (ms)
              </Label>
              <Input
                id="delay"
                type="number"
                min={0}
                value={settings.delay}
                onChange={(e) => setSettings({ ...settings, delay: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="concurrency" className="text-sm text-muted-foreground">
                Eşzamanlılık
              </Label>
              <Input
                id="concurrency"
                type="number"
                min={1}
                max={10}
                value={settings.concurrency}
                onChange={(e) => setSettings({ ...settings, concurrency: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
