import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabase) {
    // Dev mode — accept the lead without DB
    const body = await request.json();
    console.log('[dev] Lead received:', body.name, body.phone);
    return NextResponse.json({ success: true, demo: true });
  }

  const body = await request.json();
  const { name, phone, messenger, studio_name, studio_phone, source_url } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('leads')
    .insert({
      name,
      phone,
      messenger: messenger || 'telegram',
      studio_name: studio_name || '',
      studio_phone: studio_phone || '',
      source_url: source_url || '',
      created_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
