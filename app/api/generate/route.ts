import { NextRequest, NextResponse } from 'next/server';
import { pool, insertQueueItem } from '@/lib/db';

/** POST /api/generate — add VK URL to queue for worker processing */
export async function POST(request: NextRequest) {
  if (!pool) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { vkUrl } = await request.json();
  if (!vkUrl) {
    return NextResponse.json({ error: 'vkUrl required' }, { status: 400 });
  }

  const item = await insertQueueItem({ vk_url: vkUrl });
  if (!item) {
    return NextResponse.json({ error: 'Failed to create queue item' }, { status: 500 });
  }

  return NextResponse.json({
    queueItemId: item.id,
    statusUrl: `/api/status/${item.id}`,
  });
}
