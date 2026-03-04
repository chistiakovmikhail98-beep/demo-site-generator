import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin';

/**
 * Publish endpoint — in the current architecture, saving IS publishing
 * (site reads from DB on every request, no rebuild needed).
 * This endpoint exists so the admin toolbar "Publish" button works.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = request.headers.get('authorization');
  const token = auth?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await verifyAdminAccess(id, token);
  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.json({ success: true, message: 'Site is live — changes are instant' });
}
