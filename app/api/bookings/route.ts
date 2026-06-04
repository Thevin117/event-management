import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { sendEmail, bookingReceivedTemplate } from '@/lib/email'
import { sendWhatsAppMessage, bookingReceivedWA } from '@/lib/whatsapp'
import { format, parseISO } from 'date-fns'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const bookingSchema = z.object({
  event: z.object({
    event_type: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time_start: z.string().regex(/^\d{2}:\d{2}$/),
    time_end: z.string().regex(/^\d{2}:\d{2}$/),
    no_of_pax: z.number().int().positive(),
    venue: z.string().min(1),
    status: z.string().default('pending'),
  }),
  client_details: z.object({
    client_name: z.string().min(1),
    client_email: z.string().email(),
    client_phone: z.string().min(6),
    client_whatsapp: z.string().optional(),
    company_name: z.string().optional(),
    special_requirements: z.string().optional(),
    appointment_required: z.boolean().default(false),
  }),
  equipment_selections: z.array(z.object({
    equipment_id: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
    total_cost: z.number().nonnegative().default(0),
  })),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { event, client_details, equipment_selections } = parsed.data

    // 1. Create event
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .insert([event])
      .select()

    if (eventError) throw eventError

    const eventId = eventData[0].id

    // 2. Create client details
    const { error: clientError } = await supabaseAdmin
      .from('client_details')
      .insert([{ ...client_details, event_id: eventId }])

    if (clientError) throw clientError

    // 3. Create bookings for each equipment selection
    const bookingsPayload = equipment_selections.map((sel) => ({
      event_id: eventId,
      equipment_id: sel.equipment_id,
      quantity: sel.quantity,
      booking_date: event.date,
      start_time: event.time_start,
      end_time: event.time_end,
      status: 'booked',
      total_cost: sel.total_cost,
    }))

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingsPayload)

    if (bookingError) throw bookingError

    // 4. Fire-and-forget: send "Booking Received" notifications in background
    const clientData = parsed.data.client_details
    const dateFormatted = format(parseISO(event.date), 'dd MMM yyyy')

    Promise.allSettled([
      clientData.client_email && process.env.GMAIL_FROM_EMAIL && process.env.GMAIL_APP_PASSWORD
        ? sendEmail({
            to: clientData.client_email,
            subject: `Booking Received — Ref #${eventId.slice(0, 8).toUpperCase()}`,
            html: bookingReceivedTemplate({
              clientName: clientData.client_name,
              eventId,
              eventType: event.event_type,
              date: dateFormatted,
              timeStart: event.time_start,
              timeEnd: event.time_end,
              venue: event.venue,
              pax: event.no_of_pax,
            }),
          })
        : Promise.resolve(),

      clientData.client_whatsapp && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
        ? sendWhatsAppMessage({
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
            to: clientData.client_whatsapp,
            message: bookingReceivedWA(clientData.client_name, event.event_type, dateFormatted, eventId),
          }).then(async (result) => {
            if (result.success && clientData.client_whatsapp) {
              await supabaseAdmin.from('whatsapp_messages').insert([{
                event_id: eventId,
                phone_number: clientData.client_whatsapp,
                message: bookingReceivedWA(clientData.client_name, event.event_type, dateFormatted, eventId),
                direction: 'outbound',
                message_id: result.messageId,
                status: 'sent',
              }])
            }
          })
        : Promise.resolve(),
    ]).catch(console.error)

    return NextResponse.json({ success: true, event_id: eventId }, { status: 201 })
  } catch (err) {
    console.error('Create booking error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select(`
        id,
        event_type,
        date,
        time_start,
        time_end,
        no_of_pax,
        venue,
        status,
        created_at,
        client_details ( id, client_name, client_email, client_phone, client_whatsapp, company_name, appointment_required, appointment_status ),
        bookings ( id, equipment_id, quantity, status, total_cost )
      `)
      .order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Get bookings error:', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
