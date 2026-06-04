import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateICS, buildGoogleCalendarLink } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('event_id')
    if (!eventId) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: event, error } = await supabaseAdmin
      .from('events').select('*, client_details(*)').eq('id', eventId).single()
    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const client = event.client_details?.[0]
    const ics = generateICS({
      uid: eventId,
      title: `${event.event_type}${client ? ` - ${client.client_name}` : ''}`,
      description: `Event: ${event.event_type}\nVenue: ${event.venue}\nPax: ${event.no_of_pax}`,
      location: event.venue,
      startDate: event.date,
      startTime: event.time_start,
      endTime: event.time_end,
      organizerEmail: process.env.GMAIL_FROM_EMAIL || 'bookings@eventbook.app',
      organizerName: process.env.GMAIL_FROM_NAME || 'EventBook',
      attendeeEmail: client?.client_email,
      attendeeName: client?.client_name,
    })

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="event-${eventId.slice(0, 8)}.ics"`,
      },
    })
  } catch (err) {
    console.error('Calendar error:', err)
    return NextResponse.json({ error: 'Failed to generate calendar file' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { event_id } = await req.json()
    const supabaseAdmin = getSupabaseAdmin()
    const { data: event, error } = await supabaseAdmin
      .from('events').select('*, client_details(*)').eq('id', event_id).single()
    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const client = event.client_details?.[0]
    const link = buildGoogleCalendarLink({
      uid: event_id,
      title: `${event.event_type}${client ? ` - ${client.client_name}` : ''}`,
      description: `Venue: ${event.venue}\nPax: ${event.no_of_pax}`,
      location: event.venue,
      startDate: event.date,
      startTime: event.time_start,
      endTime: event.time_end,
      organizerEmail: process.env.GMAIL_FROM_EMAIL || '',
      organizerName: process.env.GMAIL_FROM_NAME || 'EventBook',
    })

    return NextResponse.json({ googleCalendarLink: link, icsUrl: `/api/calendar?event_id=${event_id}` })
  } catch (err) {
    console.error('Calendar sync error:', err)
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 })
  }
}
