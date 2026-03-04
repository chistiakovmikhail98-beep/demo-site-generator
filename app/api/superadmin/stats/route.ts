import { NextRequest, NextResponse } from 'next/server';
import { verifySuperadmin, unauthorizedResponse } from '@/lib/superadmin-auth';
import { getStats } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!verifySuperadmin(request)) return unauthorizedResponse();

  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('[superadmin/stats] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
