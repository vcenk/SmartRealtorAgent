'use client';

import { useState, useEffect } from 'react';
import { useAgents } from '@/lib/agent-context';

type ThemeId = 'dark' | 'minimal' | 'professional' | 'glass';

const WIDGET_THEMES: Array<{
  id: ThemeId;
  label: string;
  desc: string;
  preview: {
    panelBg: string;
    headerBg: string;
    headerColor: string;
    userBubble: string;
    aiBubble: string;
    aiBubbleColor: string;
    inputBg: string;
    border: string;
    launcherBg: string;
    radius: string;
    backdropFilter?: string;
  };
}> = [
  {
    id: 'dark',
    label: 'Modern Dark',
    desc: 'Purple → blue gradient, glass bubbles, glowing launcher.',
    preview: {
      panelBg: '#0d0f1a',
      headerBg: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
      headerColor: '#fff',
      userBubble: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
      aiBubble: 'rgba(255,255,255,0.07)',
      aiBubbleColor: '#e2e8f0',
      inputBg: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.08)',
      launcherBg: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
      radius: '20px',
    },
  },
  {
    id: 'minimal',
    label: 'Clean Minimal',
    desc: 'White background, soft shadows, brand-purple accents.',
    preview: {
      panelBg: '#ffffff',
      headerBg: '#ffffff',
      headerColor: '#0f172a',
      userBubble: '#7c3aed',
      aiBubble: '#f1f5f9',
      aiBubbleColor: '#1e293b',
      inputBg: '#f8fafc',
      border: '#e2e8f0',
      launcherBg: '#7c3aed',
      radius: '16px',
    },
  },
  {
    id: 'professional',
    label: 'Professional',
    desc: 'Dark navy, sky-blue accents — trusted, real-estate focused.',
    preview: {
      panelBg: '#0f172a',
      headerBg: '#1e293b',
      headerColor: '#f8fafc',
      userBubble: '#0ea5e9',
      aiBubble: '#1e293b',
      aiBubbleColor: '#cbd5e1',
      inputBg: '#1e293b',
      border: '#334155',
      launcherBg: '#0ea5e9',
      radius: '12px',
    },
  },
  {
    id: 'glass',
    label: 'Glassmorphism',
    desc: 'Frosted-glass panel with blur, translucent bubbles.',
    preview: {
      panelBg: 'rgba(15,15,30,0.55)',
      headerBg: 'rgba(255,255,255,0.08)',
      headerColor: '#fff',
      userBubble: 'rgba(168,85,247,0.75)',
      aiBubble: 'rgba(255,255,255,0.1)',
      aiBubbleColor: '#f1f5f9',
      inputBg: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.12)',
      launcherBg: 'rgba(124,58,237,0.7)',
      radius: '22px',
      backdropFilter: 'blur(20px)',
    },
  },
];

/* Mini chatbot preview component */
function ThemePreview({ theme }: { theme: (typeof WIDGET_THEMES)[number] }) {
  const p = theme.preview;
  return (
    <div
      style={{
        background: p.panelBg,
        border: `1px solid ${p.border}`,
        borderRadius: p.radius,
        overflow: 'hidden',
        backdropFilter: p.backdropFilter ?? 'none',
        WebkitBackdropFilter: p.backdropFilter ?? 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* header */}
      <div
        style={{
          background: p.headerBg,
          color: p.headerColor,
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: `1px solid ${p.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>🏡</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 9, lineHeight: 1.2 }}>Smart Realtor Agent</div>
          <div style={{ fontSize: 7, opacity: 0.7 }}>● Online</div>
        </div>
      </div>

      {/* messages */}
      <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden' }}>
        {/* ai msg */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
          <div style={{ background: p.aiBubble, color: p.aiBubbleColor, border: `1px solid ${p.border}`, borderRadius: '8px 8px 8px 2px', padding: '4px 7px', fontSize: 7.5, maxWidth: '85%', lineHeight: 1.4 }}>
            Hi! Ask me about any listing.
          </div>
        </div>
        {/* user msg */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: p.userBubble, color: '#fff', borderRadius: '8px 8px 2px 8px', padding: '4px 7px', fontSize: 7.5, maxWidth: '75%', lineHeight: 1.4 }}>
            What's nearby?
          </div>
        </div>
        {/* ai msg */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
          <div style={{ background: p.aiBubble, color: p.aiBubbleColor, border: `1px solid ${p.border}`, borderRadius: '8px 8px 8px 2px', padding: '4px 7px', fontSize: 7.5, maxWidth: '90%', lineHeight: 1.4 }}>
            Great schools, cafes, parks within 5 min.
          </div>
        </div>
      </div>

      {/* input */}
      <div style={{ padding: '5px 7px', borderTop: `1px solid ${p.border}`, background: p.panelBg, display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ flex: 1, background: p.inputBg, border: `1px solid ${p.border}`, borderRadius: 999, padding: '3px 8px', fontSize: 7, color: 'rgba(150,150,150,0.7)' }}>
          Ask a question…
        </div>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.launcherBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', flexShrink: 0 }}>
          ➤
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { activeAgentId: tenantId, loading: tenantLoading } = useAgents();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('dark');
  const [botName, setBotName] = useState('Smart Realtor Agent');
  const [agencyName, setAgencyName] = useState('Demo Realty');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState(
    "Hi! I'm your AI real estate assistant. Ask me anything about listings, neighborhoods, or getting started.",
  );
  const [brandColor, setBrandColor] = useState('#7c3aed');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load current settings from DB once we have the tenantId
  useEffect(() => {
    if (tenantLoading) return;
    fetch(`/api/settings?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setAgencyName(d.name);
        if (d.website_url) setWebsiteUrl(d.website_url);
        if (d.bot_name) setBotName(d.bot_name);
        if (d.welcome_message) setWelcomeMsg(d.welcome_message);
        if (d.widget_theme) setSelectedTheme(d.widget_theme as ThemeId);
        if (d.brand_color) setBrandColor(d.brand_color);
      })
      .catch(() => {/* silently ignore if DB not yet connected */});
  }, [tenantLoading, tenantId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          name: agencyName,
          websiteUrl,
          botName,
          welcomeMessage: welcomeMsg,
          widgetTheme: selectedTheme,
          brandColor,
        }),
      });
      setSaveMsg(res.ok ? '✓ Saved' : '✗ Save failed');
    } catch {
      setSaveMsg('✗ Network error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="dash-page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="dash-page-title">Settings</h1>
          <p className="dash-page-sub">Manage your tenant profile, widget theme, and policy configuration.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saveMsg && (
            <span style={{ fontSize: '0.85rem', color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
              {saveMsg}
            </span>
          )}
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.88rem', padding: '0.6rem 1.3rem' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Widget Theme Selector ────────────────────────── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="dash-section-label" style={{ marginBottom: '1rem' }}>
          Widget Theme — choose the look of your embedded chatbot
        </div>
        <div className="theme-grid">
          {WIDGET_THEMES.map((t) => {
            const active = selectedTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`theme-card${active ? ' theme-card-active' : ''}`}
              >
                {/* Mini preview */}
                <div className="theme-preview-wrap">
                  <ThemePreview theme={t} />
                </div>

                {/* Label */}
                <div className="theme-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="theme-label">{t.label}</span>
                    {active && <span className="theme-active-badge">✓ Selected</span>}
                  </div>
                  <p className="theme-desc">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Embed snippet preview */}
        <div className="dash-code-block-wrap" style={{ marginTop: '1.25rem' }}>
          <div className="dash-code-header">
            <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Your embed snippet with selected theme</span>
          </div>
          <pre className="dash-code-block">{`<script
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/widget-script"
  data-bot-id="${tenantId}"
  data-theme="${selectedTheme}"
></script>`}</pre>
        </div>
      </section>

      <div className="settings-grid">
        {/* Tenant profile */}
        <section className="dash-settings-card">
          <div className="dash-settings-card-title">Tenant Profile</div>
          <div className="form-field">
            <label className="form-label">Agency name</label>
            <input className="form-input" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Website URL</label>
            <input className="form-input" type="url" placeholder="https://yoursite.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Bot ID</label>
            <div className="settings-bot-id">
              <code className="settings-code">{tenantId}</code>
              <button
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem', flexShrink: 0 }}
                onClick={() => navigator.clipboard?.writeText(tenantId)}
              >
                Copy
              </button>
            </div>
            <p className="form-hint">Use this ID in your widget script tag.</p>
          </div>
        </section>

        {/* Widget branding */}
        <section className="dash-settings-card">
          <div className="dash-settings-card-title">Widget Branding</div>
          <div className="form-field">
            <label className="form-label">Bot display name</label>
            <input
              className="form-input"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Welcome message</label>
            <textarea
              className="form-input"
              rows={3}
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Brand accent color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer' }}
              />
              <input
                className="form-input"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <p className="form-hint">Used for minimal and professional themes.</p>
          </div>
        </section>

        {/* Policy config */}
        <section className="dash-settings-card">
          <div className="dash-settings-card-title">Policy Configuration</div>
          <div className="form-field">
            <label className="form-label">Citation enforcement</label>
            <div className="settings-toggle-row">
              <div className="settings-toggle active" />
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Require citations for all factual responses
              </span>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Off-topic guard</label>
            <div className="settings-toggle-row">
              <div className="settings-toggle active" />
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Block questions unrelated to real estate
              </span>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Max tokens per response</label>
            <input className="form-input" type="number" defaultValue={512} min={128} max={2048} />
          </div>
        </section>

        {/* Danger zone */}
        <section className="dash-settings-card dash-danger-card">
          <div className="dash-settings-card-title" style={{ color: '#f87171' }}>Danger Zone</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            These actions are irreversible. Proceed with caution.
          </p>
          <button
            className="btn"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '0.88rem',
            }}
          >
            Delete Tenant &amp; All Data
          </button>
        </section>
      </div>
    </div>
  );
}
