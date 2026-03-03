import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = request.headers.get('authorization');
  const token = auth?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const result = await verifyAdminAccess(id, token);
  return NextResponse.json(result);
}
