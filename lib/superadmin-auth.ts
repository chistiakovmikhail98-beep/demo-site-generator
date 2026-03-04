import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fitwebai-secret';

export function verifySuperadmin(request: NextRequest): boolean {
  const token = request.cookies.get('superadmin_jwt')?.value;
  if (!token) return false;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.role === 'superadmin';
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
