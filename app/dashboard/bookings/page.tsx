'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Event } from '@/lib/types'
import { formatDate, formatTime, statusColor, capitalize } from '@/lib/utils'

const FILTERS = ['all', 'pending', 'confirmed', 'cancelled'] as const
type Filter = typeof FILTERS[number]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: status as Event['status'] } : b))
  }

  async function confirmBooking(id: string) {
    const res = await fetch(`/api/bookings/${id}/confirm`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'confirmed' } : b))
      if (data.calendarLink) {
        if (confirm('Booking confirmed! Open Google Calendar to add the event?')) {
          window.open(data.calendarLink, '_blank')
        }
      }
    }
  }

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  const filtered = bookings
    .filter((b) => filter === 'all' || b.status === filter)
    .filter((b) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const c = b.client_details?.[0]
      return b.event_type.toLowerCase().includes(q) || b.venue.toLowerCase().includes(q) ||
        c?.client_name?.toLowerCase().includes(q) || c?.client_email?.toLowerCase().includes(q) ||
        c?.client_phone?.includes(q)
    })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bookings.length} total bookings</p>
        </div>
        <Link href="/booking" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
          + New Booking
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {capitalize(f)} <span className="ml-1 text-xs">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input type="text" placeholder="Search by event, venue, client name, email or phone…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No bookings found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date & Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => {
                const c = b.client_details?.[0]
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{b.event_type}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{b.venue}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{c?.client_name || '—'}</p>
                      <p className="text-xs text-gray-500">{c?.client_phone || c?.client_email || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-gray-900">{formatDate(b.date)}</p>
                      <p className="text-xs text-gray-500">{formatTime(b.time_start)} – {formatTime(b.time_end)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(b.status)}`}>
                        {capitalize(b.status)}
                      </span>
                      {c?.appointment_required && (
                        <span className="ml-1 text-xs text-blue-600">📅</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'pending' && (
                          <button onClick={() => confirmBooking(b.id)}
                            className="px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                            Confirm
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'pending' && (
                          <button onClick={() => updateStatus(b.id, 'cancelled')}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
                            Cancel
                          </button>
                        )}
                        <Link href={`/dashboard/bookings/${b.id}`}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
