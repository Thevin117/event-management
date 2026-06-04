export interface Event {
  id: string
  event_type: string
  date: string
  time_start: string
  time_end: string
  no_of_pax: number
  venue: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  client_details?: ClientDetails[]
  bookings?: Booking[]
}

export interface Equipment {
  id: string
  name: string
  type: string
  description?: string
  quantity_available: number
  hourly_rate?: number
  daily_rate?: number
  created_at: string
}

export interface Booking {
  id: string
  event_id: string
  equipment_id: string
  quantity: number
  booking_date: string
  start_time: string
  end_time: string
  status: 'booked' | 'available' | 'hold'
  total_cost?: number
  created_at: string
  equipment?: Equipment
}

export interface ClientDetails {
  id: string
  event_id: string
  client_name: string
  client_email: string
  client_phone: string
  client_whatsapp?: string
  company_name?: string
  special_requirements?: string
  appointment_required: boolean
  appointment_status: 'pending' | 'scheduled' | 'completed'
  created_at: string
}

export interface BookingFormData {
  event_type: string
  date: string
  time_start: string
  time_end: string
  no_of_pax: number
  venue: string
  equipment_id: string
  appointment_required: boolean
  client_name: string
  client_email: string
  client_phone: string
  client_whatsapp?: string
  company_name?: string
  special_requirements?: string
}

export type EventStatus = 'pending' | 'confirmed' | 'cancelled'
