'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgents } from '@/lib/use-agents';

type Props = {
  onCreateClick: () => void;
};

export function AgentSwitcher({ onCreateClick }: Props) {
  const { agents, activeAgent, setActiveAgentId, loading } = useAgents();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  if (loading) {
    return (
      <div className="agent-switcher">
        <div className="agent-switcher-trigger" style={{ opacity: 0.5 }}>
          <span className="agent-switcher-name">Loading...</span>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="agent-switcher">
        <button
          className="agent-switcher-trigger agent-switcher-create"
          onClick={onCreateClick}
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(59, 130, 246, 0.15))',
            borderColor: 'rgba(124, 58, 237, 0.3)',
          }}
        >
          <span className="agent-switcher-icon" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>+</span>
          <span className="agent-switcher-name" style={{ color: '#a855f7' }}>Create Your First Agent</span>
        </button>
      </div>
    );
  }

  return (
    <div className="agent-switcher" ref={ref}>
      <button
        className="agent-switcher-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="agent-switcher-icon">
          {activeAgent?.name.slice(0, 1).toUpperCase() ?? '?'}
        </span>
        <span className="agent-switcher-name">
          {activeAgent?.name ?? 'Select Agent'}
        </span>
        <span className="agent-switcher-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="agent-switcher-dropdown">
          {agents.map((agent) => (
            <button
              key={agent.id}
              className={`agent-switcher-option${agent.id === activeAgent?.id ? ' active' : ''}`}
              onClick={() => {
                setActiveAgentId(agent.id);
                setOpen(false);
              }}
            >
              <span className="agent-switcher-option-icon">
                {agent.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="agent-switcher-option-name">{agent.name}</span>
              {agent.id === activeAgent?.id && (
                <span className="agent-switcher-check">✓</span>
              )}
            </button>
          ))}

          <div className="agent-switcher-divider" />

          <button
            className="agent-switcher-option agent-switcher-option-create"
            onClick={() => {
              setOpen(false);
              onCreateClick();
            }}
          >
            <span className="agent-switcher-option-icon">+</span>
            <span className="agent-switcher-option-name">Create New Agent</span>
          </button>
        </div>
      )}
    </div>
  );
}
