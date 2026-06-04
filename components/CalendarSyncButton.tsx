'use client'

import { useState } from 'react'

export default function CalendarSyncButton({ eventId }: { eventId: string }) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ googleCalendarLink?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function sync() {
    setSyncing(true); setError(null)
    try {
      const res = await fetch('/api/calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_id: eventId }) })
      const data = await res.json()
      if (res.ok) setResult(data); else setError(data.error || 'Failed')
    } catch { setError('Network error') } finally { setSyncing(false) }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Sync to Google Calendar or download an .ics file for any calendar app.</p>
      <div className="flex flex-wrap gap-3">
        <button onClick={sync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          {syncing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          {syncing ? 'Generating…' : 'Sync to Google Calendar'}
        </button>
        <a href={`/api/calendar?event_id=${eventId}`} download
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Download .ics
        </a>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result?.googleCalendarLink && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <a href={result.googleCalendarLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:underline">Open in Google Calendar →</a>
        </div>
      )}
    </div>
  )
}
