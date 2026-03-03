import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/** POST /api/generate — add VK URL to queue for worker processing */
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { vkUrl } = await request.json();
  if (!vkUrl) {
    return NextResponse.json({ error: 'vkUrl required' }, { status: 400 });
  }

  // Create a pending queue item for the worker to pick up
  const { data, error } = await supabase
    .from('queue_items')
    .insert({
      vk_url: vkUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    queueItemId: data.id,
    statusUrl: `/api/status/${data.id}`,
  });
}
