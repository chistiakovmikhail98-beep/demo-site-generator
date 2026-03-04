import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const JWT_SECRET = process.env.JWT_SECRET || 'fitwebai-secret';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin auth not configured' }, { status: 500 });
    }

    if (login !== ADMIN_LOGIN || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'superadmin' }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('superadmin_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
