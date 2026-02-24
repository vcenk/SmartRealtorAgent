'use client';

import { useState, useEffect } from 'react';
import { useAgents } from '@/lib/agent-context';

/* ── Types ────────────────────────────────────────────────── */
type Lead = {
  id: string;
  payload: {
    name?: string;
    contact?: string;
    intent?: string;
    area?: string;
    budget?: string;
    timeline?: string;
    stage?: string;
  };
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: 'rgba(100,116,139,0.25)',
  engaged: 'rgba(59,130,246,0.2)',
  qualifying: 'rgba(245,158,11,0.2)',
  captured: 'rgba(34,197,94,0.2)',
};
const statusText: Record<string, string> = {
  new: '#94a3b8',
  engaged: '#60a5fa',
  qualifying: '#fbbf24',
  captured: '#4ade80',
};

function stageLabel(lead: Lead): string {
  return (lead.payload.stage ?? 'new').toLowerCase();
}

/* ── Page ─────────────────────────────────────────────────── */
export default function LeadsPage() {
  const { activeAgentId: tenantId, loading: agentLoading } = useAgents();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentLoading) return;

    async function fetchLeads() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leads?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          setLeads(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [tenantId, agentLoading]);

  const total = leads.length;
  const captured = leads.filter((l) => stageLabel(l) === 'captured').length;
  const qualifying = leads.filter((l) => stageLabel(l) === 'qualifying').length;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Leads</h1>
          <p className="dash-page-sub">Buyer and seller leads captured by your AI assistant.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-card-icon">🎯</div>
          <div className="dash-stat-card-content">
            <span className="dash-stat-card-value">{total}</span>
            <span className="dash-stat-card-label">Total Leads</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-card-icon">✅</div>
          <div className="dash-stat-card-content">
            <span className="dash-stat-card-value" style={{ color: '#4ade80' }}>{captured}</span>
            <span className="dash-stat-card-label">Captured</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-card-icon">⏳</div>
          <div className="dash-stat-card-content">
            <span className="dash-stat-card-value" style={{ color: '#fbbf24' }}>{qualifying}</span>
            <span className="dash-stat-card-label">Qualifying</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dash-loading-state">
          <div className="dash-loading-spinner"></div>
          <p>Loading leads...</p>
        </div>
      ) : leads.length > 0 ? (
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
              {leads.map((lead) => {
                const p = lead.payload;
                const stage = stageLabel(lead);
                return (
                  <tr key={lead.id}>
                    <td className="dash-table-name">{p.name ?? '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{p.contact ?? '—'}</td>
                    <td>
                      {p.intent ? (
                        <span className="dash-intent-badge" data-intent={p.intent}>{p.intent}</span>
                      ) : '—'}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{p.area ?? '—'}</td>
                    <td style={{ color: 'var(--ink)' }}>{p.budget ?? '—'}</td>
                    <td style={{ color: 'var(--muted)' }}>{p.timeline ?? '—'}</td>
                    <td>
                      <span
                        className="dash-status-badge"
                        style={{
                          background: statusColors[stage] ?? 'rgba(100,116,139,0.2)',
                          color: statusText[stage] ?? '#94a3b8',
                        }}
                      >
                        {stage.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted2)', fontSize: '0.82rem' }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dash-empty-card">
          <div className="dash-empty-card-icon">🎯</div>
          <h3 className="dash-empty-card-title">No leads yet</h3>
          <p className="dash-empty-card-desc">
            Live leads appear here automatically when your widget captures buyer or seller intent.
          </p>
        </div>
      )}
    </div>
  );
}
