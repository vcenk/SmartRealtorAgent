'use client';

import { useState, useEffect, useRef } from 'react';
import { useTenant } from '@/lib/use-tenant';

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

/* ── Crawl Site Modal ─────────────────────────────────────── */
function CrawlSiteModal({
  tenantId,
  onClose,
  onAdded,
}: {
  tenantId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(20);
  const [pathPrefix, setPathPrefix] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState<{ page: number; total: number; url: string } | null>(null);
  const [done, setDone] = useState<{ sourcesCreated: number; chunksCreated: number } | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const start = async () => {
    if (!url.trim()) { setError('URL is required'); return; }
    setError('');
    setRunning(true);
    setStatus('Starting…');
    setProgress(null);
    setDone(null);

    try {
      const res = await fetch('/api/knowledge/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          url: url.trim(),
          maxPages,
          pathPrefix: pathPrefix.trim() || undefined,
        }),
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const evt = JSON.parse(line) as Record<string, unknown>;
            if (evt.type === 'status') setStatus(evt.message as string);
            if (evt.type === 'progress') setProgress(evt as { page: number; total: number; url: string });
            if (evt.type === 'done') {
              setDone({ sourcesCreated: evt.sourcesCreated as number, chunksCreated: evt.chunksCreated as number });
              setRunning(false);
              onAdded();
            }
            if (evt.type === 'error') {
              setError(evt.message as string);
              setRunning(false);
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setRunning(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={!running ? onClose : undefined}>
      <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">🕷 Crawl Entire Site</span>
          {!running && <button className="sra-close" onClick={onClose}>✕</button>}
        </div>

        {!done ? (
          <>
            <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Automatically discovers all pages on a website (via sitemap.xml or link following),
              scrapes content + listing data, and indexes everything into your knowledge base.
            </p>

            <div className="form-field">
              <label className="form-label">Website URL</label>
              <input className="form-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youragency.com" disabled={running} />
              <p className="form-hint">The root domain — we'll discover all pages automatically.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label">Max pages</label>
                <input className="form-input" type="number" min={1} max={50} value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))} disabled={running} />
              </div>
              <div className="form-field" style={{ flex: 2 }}>
                <label className="form-label">Path prefix <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>(optional)</span></label>
                <input className="form-input" value={pathPrefix} onChange={(e) => setPathPrefix(e.target.value)}
                  placeholder="/listings" disabled={running} />
                <p className="form-hint">Only crawl pages under this path.</p>
              </div>
            </div>

            {/* Progress */}
            {running && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{status}</p>
                {progress && (
                  <>
                    <div style={{ background: 'var(--line)', borderRadius: 999, height: 6, overflow: 'hidden', marginBottom: '0.4rem' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#3b82f6)', borderRadius: 999, width: `${(progress.page / progress.total) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted2)', wordBreak: 'break-all' }}>
                      {progress.page}/{progress.total} — {progress.url}
                    </p>
                  </>
                )}
              </div>
            )}

            {error && <p style={{ color: '#f87171', fontSize: '0.83rem', marginBottom: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {!running && <button className="btn btn-outline" onClick={onClose} style={{ fontSize: '0.85rem' }}>Cancel</button>}
              <button className="btn btn-primary" onClick={start} disabled={running} style={{ fontSize: '0.85rem' }}>
                {running ? 'Crawling…' : 'Start Crawl'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Crawl complete!</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              {done.sourcesCreated} pages indexed · {done.chunksCreated} chunks embedded
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ fontSize: '0.88rem' }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Add Source Modal ─────────────────────────────────────── */
function AddSourceModal({
  tenantId,
  onClose,
  onAdded,
}: {
  tenantId: string;
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
    if (mode === 'url' && !url.trim()) { setError('URL is required'); return; }
    if (mode === 'text' && content.trim().length < 10) { setError('Content must be at least 10 characters'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          title: title.trim() || undefined,
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
                fontSize: '0.82rem', padding: '0.4rem 1rem',
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
          <label className="form-label">Title <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>(auto-detected for URLs)</span></label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave blank to use page title" />
        </div>

        {mode === 'url' ? (
          <div className="form-field">
            <label className="form-label">URL</label>
            <input className="form-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://agency.com/listings/123" />
            <p className="form-hint">Page title is auto-detected. JSON-LD listing data is extracted automatically.</p>
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
  const { tenantId, loading: tenantLoading } = useTenant();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCrawlModal, setShowCrawlModal] = useState(false);
  const [reindexing, setReindexing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge/sources?tenantId=${tenantId}`);
      if (res.ok) setSources(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading) fetchSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantLoading, tenantId]);

  const handleReindex = async (sourceId: string) => {
    setReindexing(sourceId);
    try {
      await fetch('/api/knowledge/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, sourceId }),
      });
      await fetchSources();
    } finally {
      setReindexing(null);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Delete this source and all its chunks? This cannot be undone.')) return;
    setDeleting(sourceId);
    try {
      await fetch('/api/knowledge/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, sourceId }),
      });
      await fetchSources();
    } finally {
      setDeleting(null);
    }
  };

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') {
      // PDF must go via the upload route (binary → server-side pdf-parse)
      const form = new FormData();
      form.append('tenantId', tenantId);
      form.append('file', file);
      const res = await fetch('/api/knowledge/upload', { method: 'POST', body: form });
      if (res.ok) fetchSources();
    } else {
      // Text files can be read in-browser and sent as JSON content
      const text = await file.text();
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, title: file.name, content: text }),
      });
      if (res.ok) fetchSources();
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  return (
    <div>
      {showModal && (
        <AddSourceModal
          tenantId={tenantId}
          onClose={() => setShowModal(false)}
          onAdded={fetchSources}
        />
      )}
      {showCrawlModal && (
        <CrawlSiteModal
          tenantId={tenantId}
          onClose={() => setShowCrawlModal(false)}
          onAdded={fetchSources}
        />
      )}

      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Knowledge Base</h1>
          <p className="dash-page-sub">Manage the content sources that power your AI assistant's answers.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.88rem', padding: '0.6rem 1.3rem' }} onClick={() => setShowCrawlModal(true)}>
            🕷 Crawl Site
          </button>
          <button className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.6rem 1.3rem' }} onClick={() => setShowModal(true)}>
            + Add Source
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="dash-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <input ref={fileRef} type="file" accept=".txt,.md,.csv,.pdf" style={{ display: 'none' }} onChange={handleFileInput} />
        <div className="dash-dropzone-icon">📄</div>
        <p className="dash-dropzone-title">Drop a file or click to browse</p>
        <p className="dash-dropzone-sub">.txt, .md, .csv, or .pdf — max 10 MB. Use "Add Source" for URLs.</p>
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
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                        disabled={reindexing === src.id}
                        onClick={() => handleReindex(src.id)}
                      >
                        {reindexing === src.id ? 'Re-indexing…' : 'Re-index'}
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                        disabled={deleting === src.id}
                        onClick={() => handleDelete(src.id)}
                      >
                        {deleting === src.id ? '…' : 'Delete'}
                      </button>
                    </div>
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
