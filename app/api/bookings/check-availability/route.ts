import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { equipment_id, booking_date, start_time, end_time } = await req.json()

    if (!equipment_id || !booking_date || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('equipment_id', equipment_id)
      .eq('booking_date', booking_date)
      .eq('status', 'booked')

    if (error) throw error

    const hasConflict = (bookings ?? []).some(
      (b: { start_time: string; end_time: string }) =>
        start_time < b.end_time && end_time > b.start_time
    )

    return NextResponse.json({
      available: !hasConflict,
      message: hasConflict ? 'Equipment not available for the selected time' : 'Equipment available',
    })
  } catch (err) {
    console.error('Availability check error:', err)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
