import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages

    if (!messages?.length) return NextResponse.json({ status: 'ok' })

    const supabaseAdmin = getSupabaseAdmin()

    for (const msg of messages) {
      if (msg.type !== 'text') continue
      const phoneNumber = msg.from
      const messageText = msg.text?.body || ''

      const { data: clientData } = await supabaseAdmin
        .from('client_details')
        .select('event_id')
        .or(`client_phone.eq.${phoneNumber},client_whatsapp.eq.${phoneNumber}`)
        .order('created_at', { ascending: false })
        .limit(1)

      await supabaseAdmin.from('whatsapp_messages').insert([{
        event_id: clientData?.[0]?.event_id || null,
        phone_number: phoneNumber,
        message: messageText,
        direction: 'inbound',
        message_id: msg.id,
        status: 'received',
      }])
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ status: 'ok' })
  }
}
