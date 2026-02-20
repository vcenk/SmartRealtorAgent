'use client';

import { FormEvent, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined' ? `${window.location.origin}/leads` : undefined,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus('Check your email for the sign-in link.');
  };

  return (
    <main className="container section" style={{ maxWidth: 520 }}>
      <h1>Sign In</h1>
      <p>Use Supabase magic link authentication.</p>
      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: '0.75rem' }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: 10, border: '1px solid var(--line)' }}
        />
        <button className="btn btn-primary" type="submit">
          Send Magic Link
        </button>
      </form>
      {status && <p>{status}</p>}
    </main>
  );
}
