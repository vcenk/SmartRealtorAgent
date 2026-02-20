const mockLeads = [
  {
    id: 'lead-001',
    name: 'Alex Johnson',
    contact: 'alex@email.com',
    intent: 'Buyer',
    area: 'Downtown, SF',
    budget: '$850k–$1.1M',
    timeline: '3 months',
    status: 'QUALIFYING',
    captured: '2026-02-18',
  },
  {
    id: 'lead-002',
    name: 'Maria Chen',
    contact: 'mchen@gmail.com',
    intent: 'Seller',
    area: 'Palo Alto',
    budget: 'Est. $2.4M',
    timeline: '6 months',
    status: 'CAPTURED',
    captured: '2026-02-19',
  },
  {
    id: 'lead-003',
    name: 'Derek Williams',
    contact: 'dwilliams@work.co',
    intent: 'Buyer',
    area: 'Oakland Hills',
    budget: '$600k–$750k',
    timeline: '1 month',
    status: 'ENGAGED',
    captured: '2026-02-20',
  },
];

const statusColors: Record<string, string> = {
  NEW: 'rgba(100,116,139,0.25)',
  ENGAGED: 'rgba(59,130,246,0.2)',
  QUALIFYING: 'rgba(245,158,11,0.2)',
  CAPTURED: 'rgba(34,197,94,0.2)',
};
const statusText: Record<string, string> = {
  NEW: '#94a3b8',
  ENGAGED: '#60a5fa',
  QUALIFYING: '#fbbf24',
  CAPTURED: '#4ade80',
};

export default function LeadsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Leads</h1>
          <p className="dash-page-sub">Buyer and seller leads captured by your AI assistant.</p>
        </div>
        <div className="dash-stats-row">
          <div className="dash-stat-pill">
            <span className="dash-stat-pill-num">3</span>
            <span className="dash-stat-pill-label">Total</span>
          </div>
          <div className="dash-stat-pill">
            <span className="dash-stat-pill-num" style={{ color: '#4ade80' }}>1</span>
            <span className="dash-stat-pill-label">Captured</span>
          </div>
          <div className="dash-stat-pill">
            <span className="dash-stat-pill-num" style={{ color: '#fbbf24' }}>1</span>
            <span className="dash-stat-pill-label">Qualifying</span>
          </div>
        </div>
      </div>

      {/* Leads table */}
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Intent</th>
              <th>Area</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Status</th>
              <th>Captured</th>
            </tr>
          </thead>
          <tbody>
            {mockLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="dash-table-name">{lead.name}</td>
                <td style={{ color: 'var(--muted)' }}>{lead.contact}</td>
                <td>
                  <span className="dash-intent-badge" data-intent={lead.intent}>
                    {lead.intent}
                  </span>
                </td>
                <td style={{ color: 'var(--muted)' }}>{lead.area}</td>
                <td style={{ color: 'var(--ink)' }}>{lead.budget}</td>
                <td style={{ color: 'var(--muted)' }}>{lead.timeline}</td>
                <td>
                  <span
                    className="dash-status-badge"
                    style={{
                      background: statusColors[lead.status] ?? 'rgba(100,116,139,0.2)',
                      color: statusText[lead.status] ?? '#94a3b8',
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
                <td style={{ color: 'var(--muted2)', fontSize: '0.82rem' }}>{lead.captured}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="dash-empty-note">
        Live leads arrive here automatically when your widget captures buyer or seller intent.
      </p>
    </div>
  );
}
