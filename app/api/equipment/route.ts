import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('equipment').select('*').order('name')
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Equipment fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
  }
}
