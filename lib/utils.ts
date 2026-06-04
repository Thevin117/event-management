import { format, parseISO } from 'date-fns'

export function formatDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'dd MMM yyyy') } catch { return dateStr }
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function statusColor(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':   return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default:          return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
