const WA_API_BASE = 'https://graph.facebook.com/v19.0'

export interface WhatsAppTextMessage {
  phoneNumberId: string
  accessToken: string
  to: string
  message: string
}

export async function sendWhatsAppMessage(payload: WhatsAppTextMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch(`${WA_API_BASE}/${payload.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${payload.accessToken}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: payload.to.replace(/\D/g, ''),
        type: 'text',
        text: { preview_url: false, body: payload.message },
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'WhatsApp API error')
    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (err) {
    console.error('WhatsApp send error:', err)
    return { success: false, error: String(err) }
  }
}

export function bookingReceivedWA(clientName: string, eventType: string, date: string, eventId: string): string {
  return `Hi ${clientName}! 👋\n\n✅ *Booking Received*\nThank you for booking with EventBook!\n\n📋 *Event:* ${eventType}\n📅 *Date:* ${date}\n🔖 *Ref:* ${eventId.slice(0, 8).toUpperCase()}\n\nWe'll confirm within 24 hours. You'll receive another message once confirmed.\n\nQuestions? Just reply here! 😊`
}

export function bookingConfirmedWA(clientName: string, eventType: string, date: string, timeStart: string, venue: string): string {
  return `Hi ${clientName}! 🎉\n\n🟢 *Booking Confirmed!*\nYour event has been approved.\n\n📋 *Event:* ${eventType}\n📅 *Date:* ${date}\n⏰ *Time:* ${timeStart}\n📍 *Venue:* ${venue}\n\nOur setup team will arrive 2 hours before your event. See you there! 🙌`
}

export function eventReminderWA(clientName: string, eventType: string, timeStart: string, venue: string): string {
  return `Hi ${clientName}! ⏰\n\n*Reminder: Your event is TOMORROW!*\n\n📋 *${eventType}*\n⏰ *Starts at:* ${timeStart}\n📍 *Venue:* ${venue}\n\nOur team will be there for setup before you arrive. 🎊`
}

export function bookingCancelledWA(clientName: string, eventType: string, date: string): string {
  return `Hi ${clientName},\n\nYour booking for *${eventType}* on ${date} has been cancelled.\n\nIf you'd like to rebook, please reply here or visit our website.\n\nSorry for any inconvenience. 🙏`
}
