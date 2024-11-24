import { NextResponse } from 'next/server'

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 1. Upload file to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      body: file,
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY!,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to AssemblyAI')
    }

    const { upload_url } = await uploadResponse.json()

    // 2. Start transcription
    const transcribeResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
      }),
    })

    if (!transcribeResponse.ok) {
      throw new Error('Failed to start transcription')
    }

    const { id: transcriptId } = await transcribeResponse.json()

    // 3. Create transcription record in database
    const transcription = {
      id: transcriptId,
      file_name: file.name,
      status: 'processing',
      created_at: new Date().toISOString(),
    }

    // Store in your preferred database
    // For now, we'll use localStorage in the client

    return NextResponse.json({ 
      success: true,
      transcription 
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to process transcription' },
      { status: 500 }
    )
  }
}
