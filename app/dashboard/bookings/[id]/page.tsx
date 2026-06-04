'use client'

import { useEffect, useState, use } from 'react'
import { Event } from '@/lib/types'
import { formatDate, formatTime, statusColor, capitalize } from '@/lib/utils'
import WhatsAppChat from '@/components/WhatsAppChat'
import CalendarSyncButton from '@/components/CalendarSyncButton'
import EmailPanel from '@/components/EmailPanel'
import Link from 'next/link'

interface WhatsAppMessage {
  id: string
  event_id: string
  phone_number: string
  message: string
  direction: 'inbound' | 'outbound'
  status: string
  created_at: string
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [booking, setBooking] = useState<Event | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'whatsapp' | 'email'>('details')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/bookings/${id}`).then((r) => r.json()),
      fetch(`/api/notifications/whatsapp?event_id=${id}`).then((r) => r.json()),
    ])
      .then(([evt, msgs]) => {
        setBooking(evt)
        setMessages(Array.isArray(msgs) ? msgs : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleConfirm() {
    setConfirming(true)
    try {
      const res = await fetch(`/api/bookings/${id}/confirm`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setBooking((prev) => prev ? { ...prev, status: 'confirmed' } : prev)
        if (data.calendarLink) {
          if (confirm('Confirmed! Open Google Calendar to add this event?')) {
            window.open(data.calendarLink, '_blank')
          }
        }
      }
    } finally {
      setConfirming(false)
    }
  }

  async function handleStatusChange(status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setBooking((prev) => prev ? { ...prev, status: status as Event['status'] } : prev)
  }

  async function handleMessageSent(msg: WhatsAppMessage) {
    setMessages((prev) => [...prev, msg])
  }

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm animate-pulse">Loading booking…</div>
  }
  if (!booking) {
    return <div className="p-8 text-red-500">Booking not found.</div>
  }

  const client = booking.client_details?.[0]

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/dashboard/bookings" className="text-xs text-gray-400 hover:text-gray-600 mb-1 inline-block">← Bookings</Link>
          <h1 className="text-2xl font-bold text-gray-900">{booking.event_type}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{formatDate(booking.date)} · {formatTime(booking.time_start)} – {formatTime(booking.time_end)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor(booking.status)}`}>
            {capitalize(booking.status)}
          </span>
          {booking.status === 'pending' && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {confirming ? 'Confirming…' : '✓ Confirm'}
            </button>
          )}
          {booking.status !== 'cancelled' && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {(['details', 'whatsapp', 'email'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'whatsapp' ? `💬 WhatsApp ${messages.length > 0 ? `(${messages.length})` : ''}` : tab === 'email' ? '📧 Email' : '📋 Details'}
          </button>
        ))}
      </div>

      {/* Tab: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Event */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Event Details</h3>
            <dl className="space-y-3">
              <DetailRow label="Event Type" value={booking.event_type} />
              <DetailRow label="Date" value={formatDate(booking.date)} />
              <DetailRow label="Time" value={`${formatTime(booking.time_start)} – ${formatTime(booking.time_end)}`} />
              <DetailRow label="Venue" value={booking.venue} />
              <DetailRow label="Pax" value={String(booking.no_of_pax)} />
              <DetailRow label="Booked on" value={booking.created_at ? new Date(booking.created_at).toLocaleDateString() : '—'} />
            </dl>
          </div>

          {/* Client */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Client Details</h3>
            {client ? (
              <dl className="space-y-3">
                <DetailRow label="Name" value={client.client_name} />
                <DetailRow label="Email" value={client.client_email} />
                <DetailRow label="Phone" value={client.client_phone} />
                {client.client_whatsapp && <DetailRow label="WhatsApp" value={client.client_whatsapp} />}
                {client.company_name && <DetailRow label="Company" value={client.company_name} />}
                {client.special_requirements && <DetailRow label="Requirements" value={client.special_requirements} />}
                <DetailRow label="Appointment?" value={client.appointment_required ? '📅 Yes — requested' : 'No'} />
              </dl>
            ) : <p className="text-sm text-gray-400">No client details on file.</p>}
          </div>

          {/* Calendar sync */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Calendar</h3>
            <CalendarSyncButton eventId={id} />
          </div>
        </div>
      )}

      {/* Tab: WhatsApp */}
      {activeTab === 'whatsapp' && client && (
        <WhatsAppChat
          eventId={id}
          clientName={client.client_name}
          clientPhone={client.client_whatsapp || client.client_phone}
          messages={messages}
          onMessageSent={handleMessageSent}
        />
      )}
      {activeTab === 'whatsapp' && !client && (
        <p className="text-sm text-gray-400 bg-white border border-gray-200 rounded-xl p-8 text-center">No client contact info for this booking.</p>
      )}

      {/* Tab: Email */}
      {activeTab === 'email' && client && (
        <EmailPanel
          eventId={id}
          clientEmail={client.client_email}
          clientName={client.client_name}
          event={booking}
        />
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="text-xs text-gray-500 w-28 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{value}</dd>
    </div>
  )
}
