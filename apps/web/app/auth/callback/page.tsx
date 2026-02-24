'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/leads';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Supabase automatically handles the OAuth callback when tokens are in URL
    // We just need to wait for it and then redirect
    const handleCallback = async () => {
      // Check for error in URL (from Supabase)
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      // Give Supabase a moment to process the URL hash/params
      // The client library auto-detects and exchanges tokens
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (session) {
        router.push(next);
        return;
      }

      // If no session yet, listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();
          router.push(next);
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        setError('Authentication timed out. Please try again.');
      }, 10000);
    };

    handleCallback();
  }, [router, next, searchParams]);

  if (error) {
    return (
      <main className="login-page">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Authentication Failed</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
          <a href="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Back to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="var(--line-bright)"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="var(--purple)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Signing you in...</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Please wait while we complete authentication.</p>
      </div>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="login-page">
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-card" style={{ textAlign: 'center', padding: '2rem' }}>
          Loading...
        </div>
      </main>
    }>
      <AuthCallback />
    </Suspense>
  );
}
