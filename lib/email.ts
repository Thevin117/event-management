import nodemailer from 'nodemailer'

export { bookingReceivedTemplate, bookingConfirmedTemplate, eventReminderTemplate } from './email-templates'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.GMAIL_FROM_EMAIL, pass: process.env.GMAIL_APP_PASSWORD },
  })
}

export interface EmailPayload {
  to: string
  subject: string
  html: string
  icsAttachment?: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransport()
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME || 'EventBook'}" <${process.env.GMAIL_FROM_EMAIL}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }
    if (payload.icsAttachment) {
      mailOptions.attachments = [{
        filename: 'event.ics',
        content: payload.icsAttachment,
        contentType: 'text/calendar; charset=utf-8; method=REQUEST',
      }]
    }
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: String(err) }
  }
}
