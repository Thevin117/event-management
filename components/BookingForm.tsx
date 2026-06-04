'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { BookingFormData, Equipment } from '@/lib/types'

const EVENT_TYPES = ['Corporate Event', 'Wedding', 'Concert', 'Conference', 'Festival', 'Birthday Party', 'Other']

export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null)
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<BookingFormData>()
  const selectedEquipmentId = watch('equipment_id')
  const selectedDate = watch('date')
  const startTime = watch('time_start')
  const endTime = watch('time_end')

  useEffect(() => {
    fetch('/api/equipment').then((r) => r.json()).then(setEquipment).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedEquipmentId && selectedDate && startTime && endTime) {
      setCheckingAvail(true)
      setAvailability(null)
      fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment_id: selectedEquipmentId, booking_date: selectedDate, start_time: startTime, end_time: endTime }),
      }).then((r) => r.json()).then(setAvailability).catch(console.error).finally(() => setCheckingAvail(false))
    }
  }, [selectedEquipmentId, selectedDate, startTime, endTime])

  async function nextStep() {
    const fieldsMap: Record<number, (keyof BookingFormData)[]> = {
      1: ['event_type', 'date', 'time_start', 'time_end', 'no_of_pax', 'venue'],
      2: ['equipment_id'],
    }
    const valid = await trigger(fieldsMap[step])
    if (valid) setStep((s) => s + 1)
  }

  async function onSubmit(data: BookingFormData) {
    setLoading(true)
    try {
      const selectedEquip = equipment.find((e) => e.id === data.equipment_id)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: { event_type: data.event_type, date: data.date, time_start: data.time_start, time_end: data.time_end, no_of_pax: Number(data.no_of_pax), venue: data.venue, status: 'pending' },
          client_details: { client_name: data.client_name, client_email: data.client_email, client_phone: data.client_phone, client_whatsapp: data.client_whatsapp || '', company_name: data.company_name || '', special_requirements: data.special_requirements || '', appointment_required: data.appointment_required || false },
          equipment_selections: [{ equipment_id: data.equipment_id, quantity: 1, total_cost: selectedEquip?.daily_rate || 0 }],
        }),
      })
      const result = await res.json()
      if (res.ok) setSubmitted(result.event_id)
      else alert(result.error || 'Failed to submit booking')
    } catch { alert('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
        <p className="text-gray-500 mb-1">Your booking request has been received.</p>
        <p className="text-xs text-gray-400 mb-6 font-mono">{submitted}</p>
        <a href="/dashboard" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">View Dashboard</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-8 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between mb-2">
          {['Event Details', 'Services', 'Your Details'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${step === i + 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className="w-8 sm:w-16 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select {...register('event_type', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select event type</option>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.event_type && <p className="mt-1 text-xs text-red-500">{errors.event_type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} {...register('date', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" {...register('time_start', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.time_start && <p className="mt-1 text-xs text-red-500">{errors.time_start.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" {...register('time_end', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.time_end && <p className="mt-1 text-xs text-red-500">{errors.time_end.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. of Pax</label>
                <input type="number" min={1} {...register('no_of_pax', { required: 'Required', min: 1 })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.no_of_pax && <p className="mt-1 text-xs text-red-500">{errors.no_of_pax.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input type="text" placeholder="Venue address" {...register('venue', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.venue && <p className="mt-1 text-xs text-red-500">{errors.venue.message}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Select Service</h2>
            <div className="space-y-3">
              {equipment.length === 0 && <p className="text-gray-400 text-sm">Loading equipment...</p>}
              {equipment.map((eq) => (
                <label key={eq.id} className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedEquipmentId === eq.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" value={eq.id} {...register('equipment_id', { required: 'Please select a service' })} className="mt-1 mr-3" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{eq.name}</span>
                      {eq.daily_rate && <span className="text-sm font-medium text-blue-600">RM {eq.daily_rate}/day</span>}
                    </div>
                    {eq.description && <p className="text-sm text-gray-500 mt-0.5">{eq.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{eq.quantity_available} units available</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.equipment_id && <p className="text-xs text-red-500">{errors.equipment_id.message}</p>}
            {checkingAvail && <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />Checking availability...</div>}
            {availability && !checkingAvail && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${availability.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <span>{availability.available ? '✓' : '✗'}</span>{availability.message}
              </div>
            )}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
              <input type="checkbox" {...register('appointment_required')} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
              <div>
                <span className="font-medium text-gray-900">Request a site appointment</span>
                <p className="text-xs text-gray-500">Our team will contact you to arrange a visit</p>
              </div>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Your Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" placeholder="Your full name" {...register('client_name', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.client_name && <p className="mt-1 text-xs text-red-500">{errors.client_name.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" placeholder="you@example.com" {...register('client_email', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.client_email && <p className="mt-1 text-xs text-red-500">{errors.client_email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" placeholder="+60 12 345 6789" {...register('client_phone', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {errors.client_phone && <p className="mt-1 text-xs text-red-500">{errors.client_phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="tel" placeholder="+60 12 345 6789" {...register('client_whatsapp')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" {...register('company_name')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} {...register('special_requirements')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 1} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Back</button>
          <span className="text-sm text-gray-400">Step {step} of 3</span>
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">Continue</button>
          ) : (
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
