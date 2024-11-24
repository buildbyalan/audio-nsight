import { NextResponse } from 'next/server'

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

export async function GET() {
  try {
    // Fetch transcriptions list from AssemblyAI
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch transcriptions')
    }

    const data = await response.json()
    
    // Format the transcriptions
    const transcriptions = data.map((item: any) => ({
      id: item.id,
      file_name: item.audio_url.split('/').pop() || 'Unknown File',
      status: item.status,
      transcript: item.status === 'completed' ? {
        text: item.text,
        confidence: item.confidence,
        words: item.words,
      } : undefined,
      created_at: item.created,
    }))

    return NextResponse.json({ transcriptions })
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcriptions' },
      { status: 500 }
    )
  }
}
