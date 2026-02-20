'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/leads` : undefined,
      },
    });
    setLoading(false);
    if (error) {
      setStatus({ type: 'error', msg: error.message });
      return;
    }
    setStatus({ type: 'success', msg: 'Check your email for the sign-in link.' });
  };

  return (
    <main className="login-page">
      {/* Background glow blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-card">
        {/* Logo */}
        <Link href="/" className="login-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="url(#login-lg)" />
            <path d="M8 20V12l6-5 6 5v8h-4v-5h-4v5H8Z" fill="white" fillOpacity="0.9" />
            <defs>
              <linearGradient id="login-lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c3aed" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          SmartRealtor<span className="gradient-text">AI</span>
        </Link>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">Sign in with a magic link — no password needed.</p>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@agency.com"
              className="form-input"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending…' : 'Send Magic Link →'}
          </button>
        </form>

        {status && (
          <div className={`login-status ${status.type === 'error' ? 'login-status-error' : 'login-status-success'}`}>
            {status.type === 'success' ? '✓ ' : '✕ '}{status.msg}
          </div>
        )}

        <p className="login-footer-text">
          Don&apos;t have an account?{' '}
          <Link href="/#pricing" className="login-link">
            View pricing
          </Link>
        </p>
      </div>
    </main>
  );
}
