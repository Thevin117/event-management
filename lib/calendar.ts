export interface CalendarEvent {
  uid: string
  title: string
  description: string
  location: string
  startDate: string
  startTime: string
  endTime: string
  organizerEmail: string
  organizerName: string
  attendeeEmail?: string
  attendeeName?: string
}

function formatICSDate(date: string, time: string): string {
  const d = date.replace(/-/g, '')
  const t = time.replace(':', '') + '00'
  return `${d}T${t}`
}

export function generateICS(event: CalendarEvent): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
  const dtStart = formatICSDate(event.startDate, event.startTime)
  const dtEnd = formatICSDate(event.startDate, event.endTime)

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//EventBook//Event Booking Platform//EN',
    'CALSCALE:GREGORIAN', 'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${event.uid}@eventbook.app`,
    `DTSTAMP:${now}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    `ORGANIZER;CN="${event.organizerName}":MAILTO:${event.organizerEmail}`,
    ...(event.attendeeEmail ? [`ATTENDEE;CN="${event.attendeeName || event.attendeeEmail}";ROLE=REQ-PARTICIPANT;RSVP=TRUE:MAILTO:${event.attendeeEmail}`] : []),
    'BEGIN:VALARM', 'TRIGGER:-PT24H', 'ACTION:DISPLAY',
    'DESCRIPTION:Event reminder - 24 hours', 'END:VALARM',
    'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function buildGoogleCalendarLink(event: CalendarEvent): string {
  const dtStart = formatICSDate(event.startDate, event.startTime)
  const dtEnd = formatICSDate(event.startDate, event.endTime)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dtStart}/${dtEnd}`,
    details: event.description,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
