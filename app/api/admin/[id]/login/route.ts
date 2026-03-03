import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  const result = await loginAdmin(id, password);
  if (!result) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  return NextResponse.json(result);
}
