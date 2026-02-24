'use client';

import { useState } from 'react';
import { useAgents, type Agent } from '@/lib/use-agents';

type Props = {
  onClose: () => void;
};

export function CreateAgentModal({ onClose }: Props) {
  const { addAgent } = useAgents();
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agent name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || data.error || 'Failed to create agent');
      }

      const newAgent: Agent = await res.json();
      addAgent(newAgent);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create New Agent</span>
          <button className="sra-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Create a new AI agent with its own knowledge base, leads, and conversations.
          </p>

          <div className="form-field">
            <label className="form-label">Agent Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coastal Homes Bot"
              disabled={loading}
              autoFocus
            />
            <p className="form-hint">This name will appear in the chat widget header.</p>
          </div>

          <div className="form-field">
            <label className="form-label">
              Website URL <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              className="form-input"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://youragency.com"
              disabled={loading}
            />
            <p className="form-hint">The website this agent will represent.</p>
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.83rem', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ fontSize: '0.85rem' }}
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
