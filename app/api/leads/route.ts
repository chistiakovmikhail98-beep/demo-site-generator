import { NextRequest, NextResponse } from 'next/server';
import { insertLead } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, messenger, studio_name, studio_phone, source_url } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  const saved = await insertLead({ name, phone, messenger, studio_name, studio_phone, source_url });

  return NextResponse.json({ success: true, saved });
}
