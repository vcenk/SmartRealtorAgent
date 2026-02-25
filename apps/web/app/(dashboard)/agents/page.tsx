'use client';

import { useState } from 'react';
import { useAgents, type Agent } from '@/lib/agent-context';
import { CreateAgentModal } from '@/components/CreateAgentModal';

export default function AgentsPage() {
  const { agents, activeAgent, activeAgentId, setActiveAgentId, loading } = useAgents();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (agentId: string) => {
    if (!confirm('Delete this agent and all its data? This cannot be undone.')) return;
    setDeletingId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSwitchAgent = (agent: Agent) => {
    setActiveAgentId(agent.id);
  };

  return (
    <div className="dash-page">
      {showCreateModal && <CreateAgentModal onClose={() => setShowCreateModal(false)} />}

      {/* Page Header */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Agents</h1>
          <p className="dash-page-sub">Manage your AI agents. Each agent has its own knowledge base, leads, and conversations.</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: '0.9rem', padding: '0.7rem 1.5rem' }}
          onClick={() => setShowCreateModal(true)}
        >
          + Create Agent
        </button>
      </div>

      {/* Stats Row */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-card-icon">🤖</div>
          <div className="dash-stat-card-content">
            <span className="dash-stat-card-value">{agents.length}</span>
            <span className="dash-stat-card-label">Total Agents</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-card-icon">✅</div>
          <div className="dash-stat-card-content">
            <span className="dash-stat-card-value" style={{ color: '#4ade80' }}>
              {activeAgent ? 1 : 0}
            </span>
            <span className="dash-stat-card-label">Active Agent</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-card-icon">📊</div>
          <div className="dash-stat-card-content">
            <span className="dash-stat-card-value" style={{ color: '#60a5fa' }}>∞</span>
            <span className="dash-stat-card-label">Unlimited Chats</span>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="dash-loading-state">
          <div className="dash-loading-spinner"></div>
          <p>Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="dash-empty-card">
          <div className="dash-empty-card-icon">🤖</div>
          <h3 className="dash-empty-card-title">No agents yet</h3>
          <p className="dash-empty-card-desc">
            Create your first AI agent to start capturing leads and handling conversations on your website.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="dash-agents-grid">
          {agents.map((agent) => {
            const isActive = agent.id === activeAgentId;
            return (
              <div
                key={agent.id}
                className={`dash-agent-card${isActive ? ' dash-agent-card-active' : ''}`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="dash-agent-active-badge">Active</div>
                )}

                {/* Agent Header */}
                <div className="dash-agent-card-header">
                  <div className="dash-agent-avatar">
                    {agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="dash-agent-info">
                    <h3 className="dash-agent-name">{agent.name}</h3>
                    <p className="dash-agent-url">
                      {agent.website_url || 'No website configured'}
                    </p>
                  </div>
                </div>

                {/* Agent Meta */}
                <div className="dash-agent-meta">
                  <div className="dash-agent-meta-item">
                    <span className="dash-agent-meta-label">Theme</span>
                    <span className="dash-agent-meta-value">{agent.widget_theme || 'dark'}</span>
                  </div>
                  <div className="dash-agent-meta-item">
                    <span className="dash-agent-meta-label">Created</span>
                    <span className="dash-agent-meta-value">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Agent ID */}
                <div className="dash-agent-id">
                  <span className="dash-agent-id-label">Agent ID</span>
                  <code className="dash-agent-id-value">{agent.id.slice(0, 8)}...</code>
                  <button
                    className="dash-agent-id-copy"
                    onClick={() => navigator.clipboard?.writeText(agent.id)}
                    title="Copy ID"
                  >
                    📋
                  </button>
                </div>

                {/* Agent Actions */}
                <div className="dash-agent-actions">
                  {!isActive && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                      onClick={() => handleSwitchAgent(agent)}
                    >
                      Switch to Agent
                    </button>
                  )}
                  {isActive && (
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, fontSize: '0.85rem', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}
                      disabled
                    >
                      ✓ Currently Active
                    </button>
                  )}
                  <button
                    className="btn btn-danger-outline"
                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                    onClick={() => handleDelete(agent.id)}
                    disabled={deletingId === agent.id}
                    title="Delete Agent"
                  >
                    {deletingId === agent.id ? '...' : '🗑'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Create New Agent Card */}
          <button
            className="dash-agent-card dash-agent-card-new"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="dash-agent-new-icon">+</div>
            <span className="dash-agent-new-text">Create New Agent</span>
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="dash-info-card" style={{ marginTop: '2rem' }}>
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Multi-Tenant Architecture</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--dash-muted)' }}>
            Each agent is a separate tenant with isolated data. This allows you to manage multiple
            real estate brands, offices, or websites from a single dashboard. Switch between agents
            using the dropdown in the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
