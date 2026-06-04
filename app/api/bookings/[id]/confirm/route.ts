import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, bookingConfirmedTemplate } from '@/lib/email'
import { sendWhatsAppMessage, bookingConfirmedWA } from '@/lib/whatsapp'
import { generateICS, buildGoogleCalendarLink } from '@/lib/calendar'
import { format, parseISO } from 'date-fns'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Fetch full event with client details
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('*, client_details(*)')
      .eq('id', id)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // 2. Update status to confirmed
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ status: 'confirmed' })
      .eq('id', id)

    if (updateError) throw updateError

    const client = event.client_details?.[0]
    if (!client) {
      return NextResponse.json({ success: true, message: 'Confirmed (no client details to notify)' })
    }

    const dateFormatted = format(parseISO(event.date), 'dd MMM yyyy')

    // 3. Generate ICS calendar file
    const ics = generateICS({
      uid: id,
      title: `${event.event_type} - ${client.client_name}`,
      description: `Event: ${event.event_type}\nVenue: ${event.venue}\nPax: ${event.no_of_pax}\nRef: ${id}`,
      location: event.venue,
      startDate: event.date,
      startTime: event.time_start,
      endTime: event.time_end,
      organizerEmail: process.env.GMAIL_FROM_EMAIL || 'bookings@eventbook.app',
      organizerName: process.env.GMAIL_FROM_NAME || 'EventBook',
      attendeeEmail: client.client_email,
      attendeeName: client.client_name,
    })

    const calendarLink = buildGoogleCalendarLink({
      uid: id,
      title: `${event.event_type} - ${client.client_name}`,
      description: `Venue: ${event.venue}`,
      location: event.venue,
      startDate: event.date,
      startTime: event.time_start,
      endTime: event.time_end,
      organizerEmail: process.env.GMAIL_FROM_EMAIL || '',
      organizerName: process.env.GMAIL_FROM_NAME || 'EventBook',
    })

    // 4. Send all notifications in parallel
    const [emailResult, waResult] = await Promise.allSettled([
      // Email with ICS attachment
      client.client_email
        ? sendEmail({
            to: client.client_email,
            subject: `🎉 Your Booking is Confirmed! — ${event.event_type}`,
            html: bookingConfirmedTemplate({
              clientName: client.client_name,
              eventId: id,
              eventType: event.event_type,
              date: dateFormatted,
              timeStart: event.time_start,
              timeEnd: event.time_end,
              venue: event.venue,
              pax: event.no_of_pax,
            }),
            icsAttachment: ics,
          })
        : Promise.resolve({ success: false, error: 'No email' }),

      // WhatsApp message
      client.client_whatsapp && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
        ? sendWhatsAppMessage({
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
            to: client.client_whatsapp,
            message: bookingConfirmedWA(
              client.client_name,
              event.event_type,
              dateFormatted,
              event.time_start,
              event.venue
            ),
          })
        : Promise.resolve({ success: false, error: 'WhatsApp not configured' }),
    ])

    // 5. Log notifications in DB
    const notifRecords = []

    if (emailResult.status === 'fulfilled' && emailResult.value.success) {
      notifRecords.push({
        event_id: id,
        notification_type: 'email',
        recipient: client.client_email,
        status: 'sent',
        message: 'Booking confirmed email with ICS',
      })
    }
    if (waResult.status === 'fulfilled' && waResult.value.success) {
      notifRecords.push({
        event_id: id,
        notification_type: 'whatsapp',
        recipient: client.client_whatsapp,
        status: 'sent',
        message: 'Booking confirmed WhatsApp',
      })
    }

    // Store WhatsApp outbound message in whatsapp_messages table
    if (waResult.status === 'fulfilled' && waResult.value.success && client.client_whatsapp) {
      await supabaseAdmin.from('whatsapp_messages').insert([{
        event_id: id,
        phone_number: client.client_whatsapp,
        message: bookingConfirmedWA(client.client_name, event.event_type, dateFormatted, event.time_start, event.venue),
        direction: 'outbound',
        status: 'sent',
      }])
    }

    if (notifRecords.length > 0) {
      await supabaseAdmin.from('notifications').insert(notifRecords)
    }

    return NextResponse.json({
      success: true,
      calendarLink,
      notifications: {
        email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
        whatsapp: waResult.status === 'fulfilled' ? waResult.value : { success: false },
      },
    })
  } catch (err) {
    console.error('Confirm booking error:', err)
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
  }
}
