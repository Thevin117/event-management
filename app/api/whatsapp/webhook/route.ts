import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Webhook verification (GET) — Meta calls this to verify the endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Receive incoming WhatsApp messages (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'ok' })
    }

    for (const msg of messages) {
      if (msg.type !== 'text') continue

      const phoneNumber = msg.from
      const messageText = msg.text?.body || ''
      const messageId = msg.id

      // Try to find the event linked to this phone number
      const { data: clientData } = await supabaseAdmin
        .from('client_details')
        .select('event_id')
        .or(`client_phone.eq.${phoneNumber},client_whatsapp.eq.${phoneNumber}`)
        .order('created_at', { ascending: false })
        .limit(1)

      const eventId = clientData?.[0]?.event_id || null

      // Store inbound message
      await supabaseAdmin.from('whatsapp_messages').insert([{
        event_id: eventId,
        phone_number: phoneNumber,
        message: messageText,
        direction: 'inbound',
        message_id: messageId,
        status: 'received',
      }])
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ status: 'ok' }) // Always return 200 to Meta
  }
}
