'use client'

import { useState } from 'react'

interface Plugin {
  id: string
  name: string
  icon: string
  description: string
  color: string
  envVars: { key: string; label: string; type?: string; placeholder?: string }[]
  docs: string
  features: string[]
}

const PLUGINS: Plugin[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: '📱',
    description: 'Send booking confirmations, reminders, and chat with clients via WhatsApp Business API.',
    color: 'green',
    features: ['Auto-send on booking creation', 'Auto-notify on confirmation', 'Two-way messaging in booking detail', 'Message history stored in database'],
    envVars: [
      { key: 'WHATSAPP_ACCESS_TOKEN', label: 'Access Token', type: 'password', placeholder: 'EAAxxxxxx…' },
      { key: 'WHATSAPP_PHONE_NUMBER_ID', label: 'Phone Number ID', placeholder: '123456789012345' },
      { key: 'WEBHOOK_VERIFY_TOKEN', label: 'Webhook Verify Token', placeholder: 'wa_your_token_here' },
    ],
    docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
  },
  {
    id: 'gmail',
    name: 'Gmail / SMTP',
    icon: '📧',
    description: 'Send professional HTML emails with booking confirmations, approvals, and calendar invites.',
    color: 'red',
    features: ['Booking received confirmation email', 'Booking confirmed email with .ics attachment', 'Event reminder 24 hours before', 'Custom email from admin booking detail'],
    envVars: [
      { key: 'GMAIL_FROM_EMAIL', label: 'From Email', placeholder: 'bookings@yourdomain.com' },
      { key: 'GMAIL_FROM_NAME', label: 'Display Name', placeholder: 'EventBook' },
      { key: 'GMAIL_APP_PASSWORD', label: 'Gmail App Password', type: 'password', placeholder: 'xxxx xxxx xxxx xxxx' },
      { key: 'SMTP_HOST', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
      { key: 'SMTP_PORT', label: 'SMTP Port', placeholder: '587' },
    ],
    docs: 'https://support.google.com/accounts/answer/185833',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: 'Sync confirmed bookings to Google Calendar and generate .ics files for clients.',
    color: 'blue',
    features: ['One-click Google Calendar sync from booking detail', '.ics file download for any calendar app', 'Auto-attach .ics to confirmation emails', 'Client calendar invite on booking confirmation'],
    envVars: [
      { key: 'GOOGLE_CALENDAR_ENABLED', label: 'Enable Calendar Sync', placeholder: 'true' },
      { key: 'GOOGLE_CALENDAR_AUTO_INVITE', label: 'Auto-Invite Clients', placeholder: 'true' },
    ],
    docs: 'https://developers.google.com/calendar',
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; btn: string }> = {
  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', btn: 'bg-green-600 hover:bg-green-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', btn: 'bg-red-600 hover:bg-red-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' },
}

export default function PluginsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plugin Integrations</h1>
        <p className="text-gray-500 text-sm mt-0.5">Connect external services to automate notifications and calendar sync.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-amber-600 shrink-0">⚠️</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Configuration via .env.local</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Add the environment variables below to your <code className="bg-amber-100 px-1 rounded font-mono">.env.local</code> file and restart the dev server. In production (Vercel), add them as environment variables in your project settings.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {PLUGINS.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>
    </div>
  )
}

function PluginCard({ plugin }: { plugin: Plugin }) {
  const [expanded, setExpanded] = useState(false)
  const c = COLOR_MAP[plugin.color]

  return (
    <div id={plugin.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <div className={`w-12 h-12 ${c.bg} ${c.border} border rounded-xl flex items-center justify-center text-2xl shrink-0`}>
          {plugin.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.badge}`}>Plugin</span>
          </div>
          <p className="text-sm text-gray-500">{plugin.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {plugin.features.map((f) => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">✓ {f}</span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition shrink-0"
        >
          {expanded ? 'Close' : 'Configure'}
        </button>
      </div>

      {expanded && (
        <div className={`${c.bg} border-t ${c.border} px-5 py-4 space-y-4`}>
          <h4 className="text-sm font-semibold text-gray-700">Environment Variables</h4>
          <p className="text-xs text-gray-500">Add these to your <code className="bg-white px-1 rounded font-mono border border-gray-200">.env.local</code> file:</p>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 overflow-x-auto">
            {plugin.envVars.map((v) => (
              <div key={v.key}>
                <span className="text-gray-400"># {v.label}</span><br />
                <span>{v.key}=<span className="text-yellow-300">{v.placeholder}</span></span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={plugin.docs}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 ${c.btn} text-white text-sm font-medium rounded-lg transition`}
            >
              View Setup Docs →
            </a>
            <p className="text-xs text-gray-500">After adding env vars, restart the dev server</p>
          </div>
        </div>
      )}
    </div>
  )
}
