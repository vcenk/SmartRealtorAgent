const mockSources = [
  {
    id: 'src-001',
    title: 'Downtown SF Neighborhood Guide',
    url: 'https://agency.com/guides/downtown-sf',
    chunks: 24,
    status: 'indexed',
    updated: '2026-02-15',
  },
  {
    id: 'src-002',
    title: '2026 Buyer FAQ',
    url: 'https://agency.com/faq/buyers',
    chunks: 11,
    status: 'indexed',
    updated: '2026-02-10',
  },
  {
    id: 'src-003',
    title: 'Listing Disclosure Requirements',
    url: 'https://agency.com/legal/disclosures',
    chunks: 0,
    status: 'pending',
    updated: '2026-02-20',
  },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  indexed: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  error: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
};

export default function KnowledgeBasePage() {
  return (
    <div>
      {/* Page header */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Knowledge Base</h1>
          <p className="dash-page-sub">Manage the content sources that power your AI assistant's answers.</p>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.6rem 1.3rem' }}>
          + Add Source
        </button>
      </div>

      {/* Upload drop zone */}
      <div className="dash-dropzone">
        <div className="dash-dropzone-icon">📄</div>
        <p className="dash-dropzone-title">Upload a document</p>
        <p className="dash-dropzone-sub">PDF, DOCX, or paste a URL — max 10 MB</p>
        <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
          Browse Files
        </button>
      </div>

      {/* Sources table */}
      <div className="dash-section-label" style={{ marginTop: '2rem' }}>Indexed Sources</div>
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
            {mockSources.map((src) => (
              <tr key={src.id}>
                <td className="dash-table-name">{src.title}</td>
                <td style={{ color: 'var(--muted)', fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {src.url}
                </td>
                <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{src.chunks || '—'}</td>
                <td>
                  <span
                    className="dash-status-badge"
                    style={statusStyle[src.status]}
                  >
                    {src.status}
                  </span>
                </td>
                <td style={{ color: 'var(--muted2)', fontSize: '0.82rem' }}>{src.updated}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                  >
                    Re-index
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
