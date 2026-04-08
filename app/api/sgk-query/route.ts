import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { tcKimlikNo, apiKey, apiUrl } = await request.json()

    if (!tcKimlikNo) {
      return NextResponse.json(
        { success: false, message: "TC Kimlik No gerekli" },
        { status: 400 }
      )
    }

    const targetUrl = apiUrl || process.env.SGK_API_URL || "http://abc.com/sgk-service/hizmet/tum-sigortali-hizmet-dokumu-sorgula"
    const targetApiKey = apiKey || process.env.SGK_API_KEY

    if (!targetApiKey) {
      return NextResponse.json(
        { success: false, message: "API Key gerekli" },
        { status: 400 }
      )
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ApiKey": targetApiKey,
      },
      body: JSON.stringify({ tcKimlikNo: Number(tcKimlikNo) }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `API hatası: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("SGK API Error:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Bilinmeyen hata" },
      { status: 500 }
    )
  }
}
