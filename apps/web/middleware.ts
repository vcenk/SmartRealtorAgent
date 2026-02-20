import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/leads', '/knowledge-base', '/settings', '/widget-install', '/onboarding'];
const PROTECTED_API = ['/api/knowledge', '/api/settings'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isProtectedApi = PROTECTED_API.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // Supabase stores auth tokens in cookies with a name containing 'auth-token'
  // or as sb-<project-ref>-auth-token. We accept any supabase-related auth cookie.
  const cookies = request.cookies.getAll();
  const hasSession = cookies.some(
    (c) =>
      c.name.includes('auth-token') ||
      c.name.includes('access-token') ||
      c.name.startsWith('sb-'),
  );

  if (!hasSession) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/leads/:path*',
    '/knowledge-base/:path*',
    '/settings/:path*',
    '/widget-install/:path*',
    '/onboarding/:path*',
    '/api/knowledge/:path*',
    '/api/settings/:path*',
  ],
};
