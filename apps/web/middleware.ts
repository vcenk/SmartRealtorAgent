import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/leads', '/conversations', '/knowledge-base', '/settings', '/widget-install', '/onboarding'];
// /api/knowledge is protected EXCEPT /api/knowledge/delete uses its own tenant check
// /api/widget/* is PUBLIC (served to external sites)
// /api/widget-script is PUBLIC
const PROTECTED_API = ['/api/knowledge', '/api/settings'];
const PUBLIC_API_PREFIXES = ['/api/widget', '/api/widget-script', '/api/me'];

/* ── Rate limiter ─────────────────────────────────────────── */
// Simple in-memory sliding-window counter.
// Works per Edge node; sufficient for protecting the public widget chat
// endpoint from casual abuse. For multi-region enforcement use Upstash Redis.
const RATE_LIMIT_PATHS = ['/api/widget/chat'];
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 20; // requests per window per IP

const rateCounts = new Map<string, number[]>(); // ip → timestamps

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const hits = (rateCounts.get(ip) ?? []).filter((t) => t > windowStart);
  hits.push(now);
  rateCounts.set(ip, hits);
  return hits.length > RATE_MAX;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Rate-limit public widget chat before anything else
  if (RATE_LIMIT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests — please wait a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)),
            'X-RateLimit-Limit': String(RATE_MAX),
          },
        },
      );
    }
  }

  // Always allow public API and widget pages
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith('/widget/')) return NextResponse.next();

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
    '/conversations/:path*',
    '/knowledge-base/:path*',
    '/settings/:path*',
    '/widget-install/:path*',
    '/onboarding/:path*',
    '/api/knowledge/:path*',
    '/api/settings/:path*',
    '/api/widget/:path*',
    '/api/widget-script',
    '/api/me',
    '/widget/:path*',
  ],
};
