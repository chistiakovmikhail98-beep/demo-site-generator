import { NextRequest, NextResponse } from 'next/server';
import { verifySuperadmin, unauthorizedResponse } from '@/lib/superadmin-auth';
import { getAllLeads } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!verifySuperadmin(request)) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') as 'demo' | 'site' | 'all') || 'all';
    const projectId = searchParams.get('projectId') || undefined;

    const leads = await getAllLeads(type, { projectId });
    return NextResponse.json({ leads });
  } catch (err) {
    console.error('[superadmin/leads] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
