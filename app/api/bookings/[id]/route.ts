import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, client_details (*), bookings (*, equipment (*))')
      .eq('id', id)
      .single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('Get event error:', err)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('events').update(body).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Update event error:', err)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete event error:', err)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
