'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Event } from '@/lib/types'
import { formatDate, formatTime, statusColor, capitalize } from '@/lib/utils'

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings').then((r) => r.json())
      .then((data: Event[]) => setBookings(Array.isArray(data) ? data : []))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    today: bookings.filter((b) => b.date === today).length,
  }

  const upcoming = bookings
    .filter((b) => b.date >= today && b.date <= weekLater && b.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  const pending = bookings.filter((b) => b.status === 'pending').slice(0, 5)

  const statCards = [
    { label: 'Total Bookings', value: stats.total, textColor: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-600' },
    { label: 'Pending Review', value: stats.pending, textColor: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
    { label: 'Confirmed', value: stats.confirmed, textColor: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
    { label: "Today's Events", value: stats.today, textColor: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${s.bg} mb-3`}>
              <div className={`w-3 h-3 rounded-full ${s.dot}`} />
            </div>
            <div className={`text-3xl font-bold ${s.textColor}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Needs Attention</h2>
            <Link href="/dashboard/bookings" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.length === 0 ? (
              <p className="text-sm text-gray-400 px-5 py-8 text-center">No pending bookings ✓</p>
            ) : pending.map((b) => {
              const client = b.client_details?.[0]
              return (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xs font-bold shrink-0">
                    {client?.client_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.event_type}</p>
                    <p className="text-xs text-gray-500">{client?.client_name || 'Unknown'} · {formatDate(b.date)}</p>
                  </div>
                  <Link href={`/dashboard/bookings/${b.id}`} className="text-xs text-blue-600 hover:underline shrink-0">Review →</Link>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming This Week</h2>
            <Link href="/dashboard/calendar" className="text-xs text-blue-600 hover:underline">Calendar</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-400 px-5 py-8 text-center">No upcoming events this week</p>
            ) : upcoming.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex flex-col items-center justify-center shrink-0 text-blue-700">
                  <span className="text-[10px] font-bold leading-none">{new Date(b.date + 'T00:00:00').toLocaleDateString('en-MY', { month: 'short' }).toUpperCase()}</span>
                  <span className="text-base font-bold leading-none">{new Date(b.date + 'T00:00:00').getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.event_type}</p>
                  <p className="text-xs text-gray-500 truncate">{b.venue} · {formatTime(b.time_start)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(b.status)}`}>{capitalize(b.status)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Integration Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📱', name: 'WhatsApp Business', href: '/dashboard/settings/plugins#whatsapp' },
            { icon: '📧', name: 'Gmail / SMTP', href: '/dashboard/settings/plugins#gmail' },
            { icon: '📅', name: 'Google Calendar', href: '/dashboard/settings/plugins#calendar' },
          ].map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">Click to configure</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
