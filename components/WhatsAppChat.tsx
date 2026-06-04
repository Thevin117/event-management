'use client'

import { useState } from 'react'

interface Message { id: string; event_id: string; phone_number: string; message: string; direction: 'inbound' | 'outbound'; status: string; created_at: string }

const QUICK_REPLIES = [
  'Hi! Your booking has been received. We\'ll confirm within 24 hours.',
  'Your booking is confirmed! Our team will arrive 2 hours before the event.',
  'Reminder: Your event is tomorrow! Please ensure venue access is available.',
  'Could you please provide more details about your event requirements?',
]

export default function WhatsAppChat({ eventId, clientName, clientPhone, messages, onMessageSent }: {
  eventId: string; clientName: string; clientPhone: string; messages: Message[]; onMessageSent: (msg: Message) => void
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage(msg: string) {
    if (!msg.trim()) return
    setSending(true); setError(null)
    try {
      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, to: clientPhone, message: msg }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onMessageSent({ id: Date.now().toString(), event_id: eventId, phone_number: clientPhone, message: msg, direction: 'outbound', status: 'sent', created_at: new Date().toISOString() })
        setText('')
      } else setError(data.error || 'Failed to send')
    } catch { setError('Network error') } finally { setSending(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col" style={{ height: 540 }}>
      <div className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">{clientName[0]}</div>
        <div><p className="font-semibold text-sm">{clientName}</p><p className="text-xs text-green-100">{clientPhone}</p></div>
        <span className="ml-auto text-xs bg-green-500/50 px-2 py-0.5 rounded-full">WhatsApp Business</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#efeae2]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <span className="text-3xl mb-2">💬</span><p>No messages yet</p>
            <p className="text-xs mt-1">Use the quick replies below to start a conversation</p>
          </div>
        ) : messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-xl text-sm shadow-sm ${msg.direction === 'outbound' ? 'bg-[#dcf8c6] text-gray-800 rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'}`}>
              <p className="whitespace-pre-wrap">{msg.message}</p>
              <p className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-green-700 text-right' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{msg.direction === 'outbound' && ' ✓✓'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t bg-white overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {QUICK_REPLIES.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} className="px-3 py-1 text-xs border border-green-300 text-green-700 rounded-full hover:bg-green-50 transition whitespace-nowrap">
              {q.slice(0, 40)}…
            </button>
          ))}
        </div>
      </div>

      {error && <p className="px-4 py-1 text-xs text-red-600 bg-red-50">{error}</p>}
      <div className="flex items-end gap-2 px-3 py-3 bg-white border-t">
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(text) } }}
          placeholder="Type a message…" rows={2}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        <button onClick={() => sendMessage(text)} disabled={sending || !text.trim()}
          className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition disabled:opacity-40 shrink-0">
          {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
        </button>
      </div>
    </div>
  )
}
