'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/agent-context';

type ThemeId = 'dark' | 'minimal' | 'professional' | 'glass';

const THEMES: Array<{ id: ThemeId; label: string; color: string }> = [
  { id: 'dark', label: 'Modern Dark', color: 'var(--purple-light)' },
  { id: 'minimal', label: 'Clean Minimal', color: '#a3e635' },
  { id: 'professional', label: 'Professional', color: '#38bdf8' },
  { id: 'glass', label: 'Glassmorphism', color: '#c084fc' },
];

const steps = [
  {
    num: '01',
    title: 'Choose your theme',
    desc: 'Pick a widget style in Settings, then copy the snippet with your selected theme applied.',
  },
  {
    num: '02',
    title: 'Paste before </body>',
    desc: 'Add the snippet to any page where you want the AI chat widget to appear.',
  },
  {
    num: '03',
    title: 'Go live',
    desc: 'Save and deploy. The widget appears as a floating button in the bottom-right corner.',
  },
];

type SubInfo = { plan: string; limits: { canPublish: boolean } };

export default function WidgetInstallPage() {
  const [theme, setTheme] = useState<ThemeId>('dark');
  const { activeAgentId: tenantId } = useAgents();
  const [sub, setSub] = useState<SubInfo | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => {});
  }, []);

  const canPublish = sub?.limits.canPublish ?? false;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  const snippet = `<script
  src="${origin}/api/widget-script"
  data-bot-id="${tenantId}"
  data-theme="${theme}"
></script>`;

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'growth' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Stripe not configured yet — fall through
    }
  };

  return (
    <div className="dash-page">
      {/* Page header */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Widget Install</h1>
          <p className="dash-page-sub">Embed the AI chatbot on your agency website in minutes.</p>
        </div>
        <div className="badge" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>🔌 One Script Tag</div>
      </div>

      {/* Upgrade banner for starter plan */}
      {sub && !canPublish && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.12))',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              Upgrade to publish your widget
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Your Starter plan lets you create agents and test them in the{' '}
              <Link href="/test-chat" style={{ color: 'var(--purple-light)' }}>Test Chat</Link> page.
              To embed the widget on your website, upgrade to the Growth plan.
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '0.7rem 1.8rem', whiteSpace: 'nowrap' }}
            onClick={handleUpgrade}
          >
            Upgrade to Growth — $49/mo
          </button>
        </div>
      )}

      {/* Steps */}
      <div className="widget-steps">
        {steps.map((s) => (
          <div key={s.num} className="widget-step">
            <div className="widget-step-num">{s.num}</div>
            <div>
              <div className="widget-step-title">{s.title}</div>
              <p className="widget-step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Theme picker */}
      <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>
        Select theme for your snippet
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 1rem',
              background: theme === t.id ? 'rgba(124,58,237,0.2)' : 'var(--surface)',
              border: `1px solid ${theme === t.id ? 'rgba(124,58,237,0.5)' : 'var(--line)'}`,
              color: theme === t.id ? t.color : 'var(--muted)',
              borderRadius: '999px',
            }}
          >
            {theme === t.id ? '✓ ' : ''}{t.label}
          </button>
        ))}
      </div>

      {/* Code snippet */}
      <div className="dash-code-block-wrap" style={{ opacity: canPublish ? 1 : 0.5, pointerEvents: canPublish ? 'auto' : 'none' }}>
        <div className="dash-code-header">
          <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
            HTML — paste before &lt;/body&gt; · theme: <strong style={{ color: 'var(--purple-light)' }}>{theme}</strong>
          </span>
          <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.9rem' }}
            onClick={() => navigator.clipboard?.writeText(snippet)}
          >
            Copy
          </button>
        </div>
        <pre className="dash-code-block">{snippet}</pre>
      </div>

      {/* Attributes reference */}
      <div style={{ marginTop: '2rem' }}>
        <div className="dash-section-label" style={{ marginBottom: '0.75rem' }}>Script attributes reference</div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Required</th>
                <th>Values</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { attr: 'data-bot-id', req: 'Yes', vals: 'UUID string', desc: 'Your tenant bot ID from Settings' },
                { attr: 'data-theme', req: 'No', vals: 'dark · minimal · professional · glass', desc: 'Widget visual theme (default: dark)' },
                { attr: 'data-bot-name', req: 'No', vals: 'Any string', desc: 'Name shown in chat header (default: Smart Realtor Agent)' },
                { attr: 'data-api-base-url', req: 'No', vals: 'URL', desc: 'API origin (default: auto-detected)' },
                { attr: 'data-welcome-message', req: 'No', vals: 'Any string', desc: 'First message the bot sends' },
              ].map((row) => (
                <tr key={row.attr}>
                  <td><code style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--purple-light)' }}>{row.attr}</code></td>
                  <td>
                    <span className="dash-status-badge" style={{ background: row.req === 'Yes' ? 'rgba(239,68,68,0.12)' : 'rgba(100,116,139,0.15)', color: row.req === 'Yes' ? '#f87171' : 'var(--muted)' }}>
                      {row.req}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{row.vals}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info card */}
      <div className="dash-info-card" style={{ marginTop: '2rem' }}>
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Configure themes and branding in Settings</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            Preview all 4 widget themes with live mini-previews in the{' '}
            <Link href="/settings" style={{ color: 'var(--purple-light)' }}>Settings page</Link>.
            Your bot name, welcome message, and brand color are also configured there.
          </p>
        </div>
      </div>
    </div>
  );
}
