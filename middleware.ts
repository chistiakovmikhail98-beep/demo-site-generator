import { NextRequest, NextResponse } from 'next/server';

// Top-level app routes that should NOT be rewritten to /s/[slug]/...
const APP_ROUTES = new Set(['/order', '/order/success', '/demo', '/sim', '/api', '/builder']);

function isAppRoute(pathname: string): boolean {
  if (APP_ROUTES.has(pathname)) return true;
  if (pathname.startsWith('/api/')) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never rewrite top-level app routes
  if (isAppRoute(pathname)) return NextResponse.next();

  const host = request.headers.get('host') || '';
  const parts = host.split('.');

  // slug.fitwebai.ru → rewrite to /s/slug
  if (parts.length === 3 && parts[1] === 'fitwebai' && parts[2] === 'ru') {
    const slug = parts[0];
    if (slug !== 'www' && slug !== 'api') {
      const url = new URL(`/s/${slug}${pathname}`, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.rewrite(url);
    }
  }

  // localhost development: slug.localhost:3000 → /s/slug
  if (parts.length >= 2 && parts[parts.length - 1].startsWith('localhost')) {
    const slug = parts[0];
    if (slug !== 'www' && slug !== 'api' && slug !== 'localhost') {
      const url = new URL(`/s/${slug}${pathname}`, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all paths except static files and api
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
