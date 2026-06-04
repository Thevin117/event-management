import Link from 'next/link'

const SETTINGS_SECTIONS = [
  {
    href: '/dashboard/settings/plugins',
    icon: '🔌',
    title: 'Plugin Integrations',
    description: 'Configure WhatsApp, Gmail, and Google Calendar integrations',
    badge: '3 plugins',
  },
]

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your platform configuration and integrations.</p>
      </div>

      <div className="space-y-3">
        {SETTINGS_SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}
            className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition hover:border-blue-300">
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{s.title}</p>
              <p className="text-sm text-gray-500">{s.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.badge}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
