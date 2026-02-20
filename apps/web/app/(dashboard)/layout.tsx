'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
    });
  }, []);

  return (
    <div className="container section">
      <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <Link href="/leads">Leads</Link>
        <Link href="/knowledge-base">Knowledge Base</Link>
        <Link href="/widget-install">Widget Install</Link>
        <Link href="/settings">Settings</Link>
      </nav>
      {authenticated === false ? (
        <div className="card">
          <h2>Authentication required</h2>
          <p>Please sign in with Supabase before using the dashboard.</p>
          <Link className="btn btn-primary" href="/login">
            Sign In
          </Link>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
