export function bookingReceivedTemplate(data: { clientName: string; eventId: string; eventType: string; date: string; timeStart: string; timeEnd: string; venue: string; pax: number }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px;text-align:center;"><h1 style="color:white;margin:0;font-size:24px;">Booking Received</h1><p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">We have received your booking request</p></div>
<div style="padding:32px;"><p style="color:#374151;font-size:16px;">Dear <strong>${data.clientName}</strong>,</p><p style="color:#6b7280;font-size:14px;">Thank you! Our team will review and confirm within 24 hours.</p>
<div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:20px 0;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;width:40%;">Ref ID</td><td style="color:#111827;font-size:14px;font-family:monospace;">${data.eventId.slice(0,8).toUpperCase()}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Event</td><td style="color:#111827;font-size:14px;">${data.eventType}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Date</td><td style="color:#111827;font-size:14px;">${data.date}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Time</td><td style="color:#111827;font-size:14px;">${data.timeStart} – ${data.timeEnd}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Venue</td><td style="color:#111827;font-size:14px;">${data.venue}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Pax</td><td style="color:#111827;font-size:14px;">${data.pax}</td></tr>
</table></div></div>
<div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;"><p style="color:#9ca3af;font-size:12px;margin:0;">EventBook · Professional AV Equipment Rental</p></div>
</div></body></html>`
}

export function bookingConfirmedTemplate(data: { clientName: string; eventId: string; eventType: string; date: string; timeStart: string; timeEnd: string; venue: string; pax: number }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px;text-align:center;"><h1 style="color:white;margin:0;font-size:24px;">Booking Confirmed! 🎉</h1><p style="color:#a7f3d0;margin:8px 0 0;font-size:14px;">Your event has been approved</p></div>
<div style="padding:32px;"><p style="color:#374151;font-size:16px;">Dear <strong>${data.clientName}</strong>,</p><p style="color:#6b7280;font-size:14px;">Great news! Your booking is confirmed. A calendar invite is attached.</p>
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;width:40%;">Event</td><td style="color:#111827;font-size:14px;font-weight:600;">${data.eventType}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Date</td><td style="color:#111827;font-size:14px;font-weight:600;">${data.date}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Time</td><td style="color:#111827;font-size:14px;font-weight:600;">${data.timeStart} – ${data.timeEnd}</td></tr>
<tr><td style="color:#6b7280;font-size:14px;padding:4px 0;">Venue</td><td style="color:#111827;font-size:14px;font-weight:600;">${data.venue}</td></tr>
</table></div>
<p style="color:#6b7280;font-size:13px;">Our team will arrive at least 2 hours before your event for setup.</p></div>
<div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;"><p style="color:#9ca3af;font-size:12px;margin:0;">EventBook · Professional AV Equipment Rental</p></div>
</div></body></html>`
}

export function eventReminderTemplate(data: { clientName: string; eventType: string; date: string; timeStart: string; venue: string }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;background:#f9fafb;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;"><h1 style="color:white;margin:0;font-size:24px;">⏰ Event Tomorrow!</h1></div>
<div style="padding:32px;"><p style="color:#374151;font-size:16px;">Dear <strong>${data.clientName}</strong>,</p>
<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:20px;margin:20px 0;">
<p style="margin:0;font-size:14px;color:#374151;"><strong>📋 Event:</strong> ${data.eventType}</p>
<p style="margin:8px 0 0;font-size:14px;color:#374151;"><strong>📅 Date:</strong> ${data.date}</p>
<p style="margin:8px 0 0;font-size:14px;color:#374151;"><strong>⏰ Time:</strong> ${data.timeStart}</p>
<p style="margin:8px 0 0;font-size:14px;color:#374151;"><strong>📍 Venue:</strong> ${data.venue}</p>
</div>
<p style="color:#6b7280;font-size:13px;">Our setup team will arrive 2 hours before the event.</p></div>
<div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;"><p style="color:#9ca3af;font-size:12px;margin:0;">EventBook · Professional AV Equipment Rental</p></div>
</div></body></html>`
}
