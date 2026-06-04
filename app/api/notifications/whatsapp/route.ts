import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { z } from 'zod'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({
  event_id: z.string().uuid(),
  to: z.string().min(6),
  message: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { event_id, to, message } = parsed.data

    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json({ error: 'WhatsApp not configured. Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to .env.local' }, { status: 503 })
    }

    const result = await sendWhatsAppMessage({
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      to,
      message,
    })

    if (result.success) {
      // Store outbound message
      await supabaseAdmin.from('whatsapp_messages').insert([{
        event_id,
        phone_number: to,
        message,
        direction: 'outbound',
        message_id: result.messageId,
        status: 'sent',
      }])

      await supabaseAdmin.from('notifications').insert([{
        event_id,
        notification_type: 'whatsapp',
        recipient: to,
        status: 'sent',
        message,
      }])
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('event_id')

    if (!eventId) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Get messages error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
