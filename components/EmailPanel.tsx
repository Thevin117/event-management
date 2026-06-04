'use client'

import { useState } from 'react'
import { Event } from '@/lib/types'
import { bookingReceivedTemplate, bookingConfirmedTemplate, eventReminderTemplate } from '@/lib/email-templates'
import { format, parseISO } from 'date-fns'

const TEMPLATES = [
  { value: 'received', label: 'Booking Received' },
  { value: 'confirmed', label: 'Booking Confirmed ✓' },
  { value: 'reminder', label: 'Event Reminder ⏰' },
]

export default function EmailPanel({ eventId, clientEmail, clientName, event }: { eventId: string; clientEmail: string; clientName: string; event: Event }) {
  const [template, setTemplate] = useState('received')
  const [subject, setSubject] = useState(`Booking Received — Ref #${eventId.slice(0, 8).toUpperCase()}`)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dateFormatted = event.date ? format(parseISO(event.date), 'dd MMM yyyy') : event.date
  const base = { clientName, eventId, eventType: event.event_type, date: dateFormatted, timeStart: event.time_start, timeEnd: event.time_end, venue: event.venue, pax: event.no_of_pax }

  function buildHtml() {
    if (template === 'confirmed') return bookingConfirmedTemplate(base)
    if (template === 'reminder') return eventReminderTemplate({ clientName, eventType: event.event_type, date: dateFormatted, timeStart: event.time_start, venue: event.venue })
    return bookingReceivedTemplate(base)
  }

  function onTemplateChange(val: string) {
    setTemplate(val)
    if (val === 'received') setSubject(`Booking Received — Ref #${eventId.slice(0, 8).toUpperCase()}`)
    if (val === 'confirmed') setSubject(`🎉 Your Booking is Confirmed! — ${event.event_type}`)
    if (val === 'reminder') setSubject(`⏰ Reminder: Your Event is Tomorrow!`)
  }

  async function send() {
    setSending(true); setError(null); setSent(false)
    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, to: clientEmail, subject, html: buildHtml() }),
      })
      const data = await res.json()
      if (res.ok && data.success) setSent(true); else setError(data.error || 'Failed to send')
    } catch { setError('Network error') } finally { setSending(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <div><p className="font-semibold text-gray-900 text-sm">Send Email</p><p className="text-xs text-gray-500">To: {clientName} &lt;{clientEmail}&gt;</p></div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Template</label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button key={t.value} onClick={() => onTemplateChange(t.value)}
                className={`px-3 py-2 rounded-lg text-sm text-left border transition ${template === t.value ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {sent && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Email sent to {clientEmail}</p>}
        <button onClick={send} disabled={sending || !subject.trim()} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {sending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</> : <>Send Email</>}
        </button>
      </div>
    </div>
  )
}
