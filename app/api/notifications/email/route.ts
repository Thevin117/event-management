import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({
  event_id: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { event_id, to, subject, html } = parsed.data

    if (!process.env.GMAIL_FROM_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: 'Gmail not configured. Add GMAIL_FROM_EMAIL and GMAIL_APP_PASSWORD to .env.local' }, { status: 503 })
    }

    const result = await sendEmail({ to, subject, html })

    if (result.success) {
      await supabaseAdmin.from('notifications').insert([{
        event_id,
        notification_type: 'email',
        recipient: to,
        status: 'sent',
        message: subject,
      }])
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
