'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Event } from '@/lib/types'
import { formatTime, statusColor, capitalize } from '@/lib/utils'

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const monthBookings = bookings.filter((b) => {
    const d = new Date(b.date + 'T00:00:00')
    return d.getFullYear() === year && d.getMonth() === month
  })

  function getBookingsForDay(day: number): Event[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return monthBookings.filter((b) => b.date === dateStr)
  }

  const monthName = currentMonth.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{monthBookings.length} events this month</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-4 py-2 font-medium text-gray-900 text-sm min-w-40 text-center">{monthName}</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={() => setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl h-96 animate-pulse" />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-center uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 bg-gray-50/50 border-r border-b border-gray-100" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayBookings = getBookingsForDay(day)
              const isToday = dateStr === today

              return (
                <div key={day} className={`min-h-24 border-r border-b border-gray-100 p-2 ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'} transition`}>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <Link key={b.id} href={`/dashboard/bookings/${b.id}`}
                        className={`block px-1.5 py-0.5 rounded text-[11px] font-medium truncate border ${statusColor(b.status)} hover:opacity-80 transition`}>
                        {formatTime(b.time_start)} {b.event_type}
                      </Link>
                    ))}
                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-gray-400 pl-1">+{dayBookings.length - 3} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        {['pending', 'confirmed', 'cancelled'].map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded border ${statusColor(s)}`} />
            <span className="text-xs text-gray-500">{capitalize(s)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
