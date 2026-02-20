'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

const navItems = [
  { href: '/leads', label: 'Leads', icon: '🎯' },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
  { href: '/widget-install', label: 'Widget Install', icon: '🔌' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setUserEmail(data.session?.user.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="dash-root">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-inner">
          {/* Logo */}
          <Link href="/" className="dash-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#dash-lg)" />
              <path d="M8 20V12l6-5 6 5v8h-4v-5h-4v5H8Z" fill="white" fillOpacity="0.9" />
              <defs>
                <linearGradient id="dash-lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span>SmartRealtor<span className="gradient-text">AI</span></span>
          </Link>

          {/* Nav label */}
          <div className="dash-nav-label">Dashboard</div>

          {/* Nav items */}
          <nav className="dash-nav">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`dash-nav-item${active ? ' active' : ''}`}
                >
                  <span className="dash-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="dash-sidebar-bottom">
            {userEmail && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted2)', padding: '0 0.5rem 0.5rem', wordBreak: 'break-all' }}>
                {userEmail}
              </div>
            )}
            <Link href="/" className="dash-nav-item" style={{ color: 'var(--muted2)' }}>
              <span className="dash-nav-icon">↩</span>
              Back to site
            </Link>
            <button
              onClick={handleSignOut}
              className="dash-nav-item"
              style={{ color: '#f87171', border: 0, background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <span className="dash-nav-icon">⎋</span>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Demo Realty</span>
              <span style={{ color: 'var(--line-bright)', fontSize: '0.8rem' }}>›</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
                {navItems.find((n) => n.href === pathname)?.label ?? 'Dashboard'}
              </span>
            </div>
            <div className="badge" style={{ fontSize: '0.75rem' }}>✦ Free Trial</div>
          </div>
        </header>

        {/* Page */}
        <div className="dash-content">
          {authenticated === false ? (
            <div className="dash-auth-wall">
              <div className="dash-auth-card">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <h2>Authentication required</h2>
                <p>Please sign in with your magic link to access the dashboard.</p>
                <Link className="btn btn-primary" href="/login">
                  Sign In →
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
