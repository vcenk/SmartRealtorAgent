'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Agent = {
  id: string;
  name: string;
  website_url: string | null;
  bot_name: string | null;
  widget_theme: string;
  brand_color: string;
  created_at: string;
  updated_at: string;
};

type AgentContextValue = {
  agents: Agent[];
  activeAgentId: string;
  activeAgent: Agent | null;
  loading: boolean;
  userId: string | null;
  email: string | null;
  setActiveAgentId: (id: string) => void;
  refreshAgents: () => Promise<void>;
  addAgent: (agent: Agent) => void;
};

const DEMO_AGENT = '11111111-1111-1111-1111-111111111111';
const STORAGE_KEY = 'sra_active_agent_id';

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgentId, setActiveAgentIdState] = useState<string>(DEMO_AGENT);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();

      setUserId(data.userId ?? null);
      setEmail(data.email ?? null);
      setAgents(data.agents ?? []);

      // Restore active agent from localStorage or use first agent
      const storedId = localStorage.getItem(STORAGE_KEY);
      const agentIds = (data.agents ?? []).map((a: Agent) => a.id);

      if (storedId && agentIds.includes(storedId)) {
        setActiveAgentIdState(storedId);
      } else if (agentIds.length > 0) {
        setActiveAgentIdState(agentIds[0]);
        localStorage.setItem(STORAGE_KEY, agentIds[0]);
      } else {
        // No agents, use demo
        setActiveAgentIdState(DEMO_AGENT);
      }
    } catch {
      // Keep demo agent on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const setActiveAgentId = useCallback((id: string) => {
    setActiveAgentIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const addAgent = useCallback((agent: Agent) => {
    setAgents((prev) => [agent, ...prev]);
    setActiveAgentId(agent.id);
  }, [setActiveAgentId]);

  const activeAgent = agents.find((a) => a.id === activeAgentId) ?? null;

  return (
    <AgentContext.Provider
      value={{
        agents,
        activeAgentId,
        activeAgent,
        loading,
        userId,
        email,
        setActiveAgentId,
        refreshAgents: fetchAgents,
        addAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents(): AgentContextValue {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
}

// For backwards compatibility - returns the active agent ID
export function useActiveAgentId(): { agentId: string; loading: boolean } {
  const { activeAgentId, loading } = useAgents();
  return { agentId: activeAgentId, loading };
}
