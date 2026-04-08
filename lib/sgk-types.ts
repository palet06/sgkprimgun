export interface HizmetKaydi {
  adi: string
  soyAdi: string
  bordroDonemi: number
  bordroDonemiStr: string
  bordroYili: number
  bordroTuru: string
  bordroTuruAdi: string
  gun: number
  kazanc: number
  kazancStr: string
  isYeriUnvani: string
  isYeriNo: number
  girisTarihi: string
  cikisTarihi: string
  meslekAdi: string
  meslekKodu: string
  belgeKodu: number
  belgeKoduAdi: string
  subeUnvani: string
  isYeriDetay?: {
    isYeriUnvani: string
    ilKodu: number
    siraNo: number
  }
}

export interface SgkResponse {
  success: boolean
  message: string
  data?: {
    hataKodu: number
    hataMesaji: string
    sigortaliBilgisi?: {
      islemMesaj: string
      islemSonuc: boolean
      sgkKisiBilgisi?: {
        adi: string
        soyAdi: string
        tcKimlikNo: number
      }
      sgkSigortaliBilgileri?: {
        sigortaliTumOrtakHizmetlerList: HizmetKaydi[]
      }
    }
  }
}

export interface QueryResult {
  tcKimlikNo: string
  status: "success" | "error" | "pending"
  errorMessage?: string
  adi?: string
  soyAdi?: string
  isYeriUnvani?: string
  aylikGunler: Record<string, number> // "2025/1" -> gun sayısı
  rawData?: SgkResponse
}

export interface LogEntry {
  timestamp: Date
  tcKimlikNo: string
  status: "success" | "error" | "pending"
  message: string
}

export interface QuerySettings {
  delay: number
  concurrency: number
}
