import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/leads';
  const origin = requestUrl.origin;

  // Check for OAuth errors from provider
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    const errorMsg = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${errorMsg}`);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Handle cookie errors in edge cases
            }
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[Auth Callback] Session exchange error:', sessionError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${encodeURIComponent(sessionError.message)}`);
  }

  // No code and no error - likely a direct visit or misconfiguration
  console.error('[Auth Callback] No code parameter received. Check Supabase Site URL configuration.');
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${encodeURIComponent('No authorization code received. Please check Supabase Site URL configuration.')}`);
}
