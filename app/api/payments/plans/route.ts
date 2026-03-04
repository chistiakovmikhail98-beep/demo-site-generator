import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/payments';

export async function GET() {
  return NextResponse.json({ plans: PLANS });
}
