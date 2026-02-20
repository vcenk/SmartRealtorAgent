'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/use-tenant';

type ConversationSummary = {
  conversationId: string;
  messageCount: number;
  firstUserMessage: string;
  lastActivity: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

/* ── Message Thread ───────────────────────────────────────── */
function MessageThread({ tenantId, conversationId, onClose }: {
  tenantId: string;
  conversationId: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/conversations?tenantId=${tenantId}&conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((data) => { setMessages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tenantId, conversationId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <span className="modal-title" style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono, monospace)' }}>
            {conversationId.slice(0, 8)}…
          </span>
          <button className="sra-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>Loading…</p>
          ) : messages.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No messages found.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: msg.role === 'user' ? 'rgba(124,58,237,0.2)' : 'rgba(59,130,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', color: msg.role === 'user' ? 'var(--purple-light)' : '#60a5fa',
                    fontWeight: 700,
                  }}
                >
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div
                  style={{
                    maxWidth: '80%',
                    background: msg.role === 'user' ? 'rgba(124,58,237,0.1)' : 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    color: 'var(--ink)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', marginTop: '0.3rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ConversationsPage() {
  const { tenantId, loading: tenantLoading } = useTenant();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (tenantLoading) return;
    fetch(`/api/conversations?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((data) => { setConversations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tenantLoading, tenantId]);

  return (
    <div>
      {selected && (
        <MessageThread
          tenantId={tenantId}
          conversationId={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Conversations</h1>
          <p className="dash-page-sub">All chat sessions handled by your AI assistant.</p>
        </div>
        <div className="dash-stats-row">
          <div className="dash-stat-pill">
            <span className="dash-stat-pill-num">{conversations.length}</span>
            <span className="dash-stat-pill-label">Total</span>
          </div>
          <div className="dash-stat-pill">
            <span className="dash-stat-pill-num">
              {conversations.reduce((s, c) => s + c.messageCount, 0)}
            </span>
            <span className="dash-stat-pill-label">Messages</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      ) : conversations.length === 0 ? (
        <div className="dash-empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No conversations yet</p>
          <p className="dash-empty-note">
            Conversations appear here once visitors start chatting with your widget.
          </p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Conversation</th>
                <th>First Message</th>
                <th style={{ textAlign: 'center' }}>Messages</th>
                <th>Last Activity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv) => (
                <tr key={conv.conversationId} style={{ cursor: 'pointer' }} onClick={() => setSelected(conv.conversationId)}>
                  <td className="dash-table-name" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>
                    {conv.conversationId.slice(0, 8)}…
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.firstUserMessage || '—'}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{conv.messageCount}</td>
                  <td style={{ color: 'var(--muted2)', fontSize: '0.82rem' }}>
                    {new Date(conv.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); setSelected(conv.conversationId); }}
                    >
                      View
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
