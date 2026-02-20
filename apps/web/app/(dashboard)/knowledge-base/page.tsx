'use client';

import { useState, useEffect, useRef } from 'react';

const DEMO_TENANT = '11111111-1111-1111-1111-111111111111';

type Source = {
  id: string;
  title: string;
  url?: string;
  chunk_count: number;
  status: string;
  updated_at: string;
};

const statusStyle: Record<string, { bg: string; color: string }> = {
  indexed: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  error: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

/* ── Add Source Modal ─────────────────────────────────────── */
function AddSourceModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (mode === 'url' && !url.trim()) { setError('URL is required'); return; }
    if (mode === 'text' && content.trim().length < 10) { setError('Content must be at least 10 characters'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: DEMO_TENANT,
          title: title.trim(),
          url: mode === 'url' ? url.trim() : undefined,
          content: mode === 'text' ? content.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.formErrors?.join(', ') ?? json.error ?? 'Ingestion failed');
      } else {
        onAdded();
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Knowledge Source</span>
          <button className="sra-close" onClick={onClose}>✕</button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['url', 'text'] as const).map((m) => (
            <button
              key={m}
              className="btn"
              onClick={() => setMode(m)}
              style={{
                fontSize: '0.82rem',
                padding: '0.4rem 1rem',
                background: mode === m ? 'rgba(124,58,237,0.15)' : 'var(--surface)',
                border: `1px solid ${mode === m ? 'rgba(124,58,237,0.5)' : 'var(--line)'}`,
                borderRadius: '999px',
                color: mode === m ? 'var(--purple-light)' : 'var(--muted)',
              }}
            >
              {m === 'url' ? '🔗 From URL' : '📝 Paste Text'}
            </button>
          ))}
        </div>

        <div className="form-field">
          <label className="form-label">Title</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Downtown SF Buyer Guide" />
        </div>

        {mode === 'url' ? (
          <div className="form-field">
            <label className="form-label">URL</label>
            <input className="form-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://agency.com/guide" />
            <p className="form-hint">The page will be scraped and chunked automatically.</p>
          </div>
        ) : (
          <div className="form-field">
            <label className="form-label">Content</label>
            <textarea className="form-input" rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste the document text here…" />
            <p className="form-hint">Plain text or markdown. Max 100 000 characters.</p>
          </div>
        )}

        {error && <p style={{ color: '#f87171', fontSize: '0.83rem', marginBottom: '0.75rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ fontSize: '0.85rem' }}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ fontSize: '0.85rem' }}>
            {loading ? 'Ingesting…' : 'Add & Index'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function KnowledgeBasePage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reindexing, setReindexing] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge/sources?tenantId=${DEMO_TENANT}`);
      if (res.ok) setSources(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  const handleReindex = async (sourceId: string) => {
    setReindexing(sourceId);
    try {
      await fetch('/api/knowledge/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: DEMO_TENANT, sourceId }),
      });
      await fetchSources();
    } finally {
      setReindexing(null);
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch('/api/knowledge/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: DEMO_TENANT, title: file.name, content: text }),
    });
    if (res.ok) fetchSources();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch('/api/knowledge/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: DEMO_TENANT, title: file.name, content: text }),
    });
    if (res.ok) fetchSources();
    e.target.value = '';
  };

  return (
    <div>
      {showModal && (
        <AddSourceModal
          onClose={() => setShowModal(false)}
          onAdded={fetchSources}
        />
      )}

      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Knowledge Base</h1>
          <p className="dash-page-sub">Manage the content sources that power your AI assistant's answers.</p>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.6rem 1.3rem' }} onClick={() => setShowModal(true)}>
          + Add Source
        </button>
      </div>

      {/* Drop zone */}
      <div
        className="dash-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <input ref={fileRef} type="file" accept=".txt,.md,.csv" style={{ display: 'none' }} onChange={handleFileInput} />
        <div className="dash-dropzone-icon">📄</div>
        <p className="dash-dropzone-title">Drop a file or click to browse</p>
        <p className="dash-dropzone-sub">.txt, .md, or .csv — max 10 MB. Use "Add Source" for URLs.</p>
        <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
          Browse Files
        </button>
      </div>

      {/* Sources table */}
      <div className="dash-section-label" style={{ marginTop: '2rem' }}>Indexed Sources</div>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      ) : sources.length === 0 ? (
        <div className="dash-empty-state" style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
          <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No sources yet</p>
          <p className="dash-empty-note">Add your first URL or paste text to get started.</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>URL</th>
                <th>Chunks</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sources.map((src) => (
                <tr key={src.id}>
                  <td className="dash-table-name">{src.title}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple-light)' }}>{src.url}</a>
                    ) : '—'}
                  </td>
                  <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{src.chunk_count || '—'}</td>
                  <td>
                    <span className="dash-status-badge" style={statusStyle[src.status] ?? statusStyle.pending}>
                      {src.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted2)', fontSize: '0.82rem' }}>
                    {new Date(src.updated_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                      disabled={reindexing === src.id}
                      onClick={() => handleReindex(src.id)}
                    >
                      {reindexing === src.id ? 'Re-indexing…' : 'Re-index'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
