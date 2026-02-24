'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'sra_active_agent_id';

type Step = 'agency' | 'knowledge' | 'widget';

const STEPS: Array<{ id: Step; label: string; icon: string }> = [
  { id: 'agency', label: 'Agency Profile', icon: '🏢' },
  { id: 'knowledge', label: 'Add Knowledge', icon: '📚' },
  { id: 'widget', label: 'Deploy Widget', icon: '🔌' },
];

/* ── Step 1 ─────────────────────────────────────────────── */
function StepAgency({ onNext }: { onNext: (agentId: string) => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) { setError('Agency name is required'); return; }
    setSaving(true);
    setError('');
    try {
      // Create a new agent
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), websiteUrl: url.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || data.error || 'Failed to create agent');
      }
      const agent = await res.json();
      // Store the new agent ID
      localStorage.setItem(STORAGE_KEY, agent.id);
      onNext(agent.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-step-body">
      <h2 className="onboarding-step-title">Tell us about your agency</h2>
      <p className="onboarding-step-sub">This will be used to personalise your chatbot.</p>
      <div className="form-field">
        <label className="form-label">Agency name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coastal Homes Realty" />
      </div>
      <div className="form-field">
        <label className="form-label">Website URL <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>(optional)</span></label>
        <input className="form-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com" />
      </div>
      {error && <p style={{ color: '#f87171', fontSize: '0.83rem' }}>{error}</p>}
      <button className="btn btn-primary" onClick={submit} disabled={saving} style={{ marginTop: '1rem', width: '100%' }}>
        {saving ? 'Creating Agent…' : 'Continue →'}
      </button>
    </div>
  );
}

/* ── Step 2 ─────────────────────────────────────────────── */
function StepKnowledge({ agentId, onNext }: { agentId: string; onNext: () => void }) {
  const [mode, setMode] = useState<'url' | 'text' | 'skip'>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const ingest = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: agentId,
          title: title.trim(),
          url: mode === 'url' ? url.trim() : undefined,
          content: mode === 'text' ? content.trim() : undefined,
        }),
      });
      if (!res.ok) throw new Error('Ingestion failed');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="onboarding-step-body" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
        <h2 className="onboarding-step-title">Knowledge indexed!</h2>
        <p className="onboarding-step-sub">Your AI assistant can now answer questions using this content.</p>
        <button className="btn btn-primary" onClick={onNext} style={{ marginTop: '1.25rem', width: '100%' }}>
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="onboarding-step-body">
      <h2 className="onboarding-step-title">Add your first knowledge source</h2>
      <p className="onboarding-step-sub">Give your AI assistant content to answer questions with — paste a URL or text, or skip for now.</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['url', 'text', 'skip'] as const).map((m) => (
          <button
            key={m}
            className="btn"
            onClick={() => setMode(m)}
            style={{
              fontSize: '0.82rem', padding: '0.4rem 1rem',
              background: mode === m ? 'rgba(124,58,237,0.15)' : 'var(--surface)',
              border: `1px solid ${mode === m ? 'rgba(124,58,237,0.5)' : 'var(--line)'}`,
              borderRadius: '999px',
              color: mode === m ? 'var(--purple-light)' : 'var(--muted)',
            }}
          >
            {m === 'url' ? '🔗 From URL' : m === 'text' ? '📝 Paste Text' : '⏭ Skip'}
          </button>
        ))}
      </div>

      {mode !== 'skip' && (
        <>
          <div className="form-field">
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Buyer FAQ 2026" />
          </div>
          {mode === 'url' ? (
            <div className="form-field">
              <label className="form-label">Page URL</label>
              <input className="form-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com/faq" />
            </div>
          ) : (
            <div className="form-field">
              <label className="form-label">Content</label>
              <textarea className="form-input" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste content here…" />
            </div>
          )}
          {error && <p style={{ color: '#f87171', fontSize: '0.83rem' }}>{error}</p>}
          <button className="btn btn-primary" onClick={ingest} disabled={loading} style={{ marginTop: '0.5rem', width: '100%' }}>
            {loading ? 'Indexing…' : 'Index & Continue →'}
          </button>
        </>
      )}

      {mode === 'skip' && (
        <button className="btn btn-outline" onClick={onNext} style={{ width: '100%' }}>
          Skip for now →
        </button>
      )}
    </div>
  );
}

/* ── Step 3 ─────────────────────────────────────────────── */
function StepWidget({ agentId, onFinish }: { agentId: string; onFinish: () => void }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  const snippet = `<script
  src="${origin}/api/widget-script"
  data-bot-id="${agentId}"
  data-theme="dark"
></script>`;

  return (
    <div className="onboarding-step-body">
      <h2 className="onboarding-step-title">Embed your chatbot</h2>
      <p className="onboarding-step-sub">Paste this snippet before the <code>&lt;/body&gt;</code> tag on any page where you want the widget to appear.</p>
      <div className="dash-code-block-wrap" style={{ marginBottom: '1.25rem' }}>
        <div className="dash-code-header">
          <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>HTML</span>
          <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.9rem' }}
            onClick={() => navigator.clipboard?.writeText(snippet)}>
            Copy
          </button>
        </div>
        <pre className="dash-code-block">{snippet}</pre>
      </div>
      <button className="btn btn-primary" onClick={onFinish} style={{ width: '100%' }}>
        Go to Dashboard →
      </button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('agency');
  const [agentId, setAgentId] = useState<string>('');
  const router = useRouter();

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const handleAgencyComplete = (newAgentId: string) => {
    setAgentId(newAgentId);
    setStep('knowledge');
  };

  return (
    <div className="onboarding-root">
      {/* Header */}
      <div className="onboarding-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="url(#ob-lg)" />
          <path d="M8 20V12l6-5 6 5v8h-4v-5h-4v5H8Z" fill="white" fillOpacity="0.9" />
          <defs>
            <linearGradient id="ob-lg" x1="0" y1="0" x2="28" y2="28">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
          SmartRealtor<span className="gradient-text">AI</span>
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => router.push('/leads')}
          style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
        >
          Skip to Dashboard
        </button>
      </div>

      {/* Progress */}
      <div className="onboarding-progress">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`onboarding-step-dot${i === stepIndex ? ' active' : ''}${i < stepIndex ? ' done' : ''}`}
          >
            <div className="onboarding-dot-icon">{i < stepIndex ? '✓' : s.icon}</div>
            <span className="onboarding-dot-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="onboarding-card">
        {step === 'agency' && <StepAgency onNext={handleAgencyComplete} />}
        {step === 'knowledge' && <StepKnowledge agentId={agentId} onNext={() => setStep('widget')} />}
        {step === 'widget' && <StepWidget agentId={agentId} onFinish={() => router.push('/leads')} />}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--muted2)', fontSize: '0.82rem', marginTop: '2rem' }}>
        Step {stepIndex + 1} of {STEPS.length}
      </p>
    </div>
  );
}
