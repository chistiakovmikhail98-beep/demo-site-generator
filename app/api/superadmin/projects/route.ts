import { NextRequest, NextResponse } from 'next/server';
import { verifySuperadmin, unauthorizedResponse } from '@/lib/superadmin-auth';
import { getAllProjects } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!verifySuperadmin(request)) return unauthorizedResponse();

  try {
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('[superadmin/projects] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
