'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAgents } from '@/lib/agent-context';

type ThemeId = 'dark' | 'minimal' | 'professional' | 'glass';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type ThemeVars = {
  panelBg: string;
  panelBorder: string;
  headerBg: string;
  headerColor: string;
  bodyBg: string;
  userBubbleBg: string;
  userBubbleColor: string;
  aiBubbleBg: string;
  aiBubbleColor: string;
  aiBubbleBorder: string;
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  inputPlaceholder: string;
  sendBg: string;
  sendColor: string;
  timestampColor: string;
  typingColor: string;
  borderRadius: string;
  backdropFilter?: string;
};

const THEMES: Record<ThemeId, ThemeVars> = {
  dark: {
    panelBg: '#0d0f1a',
    panelBorder: 'rgba(255,255,255,0.08)',
    headerBg: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    headerColor: '#ffffff',
    bodyBg: '#0d0f1a',
    userBubbleBg: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    userBubbleColor: '#ffffff',
    aiBubbleBg: 'rgba(255,255,255,0.06)',
    aiBubbleColor: '#e2e8f0',
    aiBubbleBorder: 'rgba(255,255,255,0.1)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputColor: '#f1f5f9',
    inputPlaceholder: '#64748b',
    sendBg: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    sendColor: '#ffffff',
    timestampColor: '#475569',
    typingColor: '#7c3aed',
    borderRadius: '20px',
  },
  minimal: {
    panelBg: '#ffffff',
    panelBorder: '#e2e8f0',
    headerBg: '#ffffff',
    headerColor: '#0f172a',
    bodyBg: '#f8fafc',
    userBubbleBg: '#7c3aed',
    userBubbleColor: '#ffffff',
    aiBubbleBg: '#ffffff',
    aiBubbleColor: '#1e293b',
    aiBubbleBorder: '#e2e8f0',
    inputBg: '#f8fafc',
    inputBorder: '#e2e8f0',
    inputColor: '#0f172a',
    inputPlaceholder: '#94a3b8',
    sendBg: '#7c3aed',
    sendColor: '#ffffff',
    timestampColor: '#94a3b8',
    typingColor: '#7c3aed',
    borderRadius: '16px',
  },
  professional: {
    panelBg: '#0f172a',
    panelBorder: '#1e293b',
    headerBg: '#1e293b',
    headerColor: '#f8fafc',
    bodyBg: '#0f172a',
    userBubbleBg: '#0ea5e9',
    userBubbleColor: '#ffffff',
    aiBubbleBg: '#1e293b',
    aiBubbleColor: '#cbd5e1',
    aiBubbleBorder: '#334155',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    inputColor: '#f1f5f9',
    inputPlaceholder: '#475569',
    sendBg: '#0ea5e9',
    sendColor: '#ffffff',
    timestampColor: '#334155',
    typingColor: '#0ea5e9',
    borderRadius: '12px',
  },
  glass: {
    panelBg: 'rgba(15,15,30,0.55)',
    panelBorder: 'rgba(255,255,255,0.12)',
    headerBg: 'rgba(255,255,255,0.08)',
    headerColor: '#ffffff',
    bodyBg: 'transparent',
    userBubbleBg: 'rgba(168,85,247,0.75)',
    userBubbleColor: '#ffffff',
    aiBubbleBg: 'rgba(255,255,255,0.1)',
    aiBubbleColor: '#f1f5f9',
    aiBubbleBorder: 'rgba(255,255,255,0.15)',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputColor: '#ffffff',
    inputPlaceholder: 'rgba(255,255,255,0.4)',
    sendBg: 'rgba(168,85,247,0.8)',
    sendColor: '#ffffff',
    timestampColor: 'rgba(255,255,255,0.4)',
    typingColor: '#a855f7',
    borderRadius: '22px',
    backdropFilter: 'blur(20px)',
  },
};

export default function TestChatPage() {
  const { activeAgentId, loading: agentLoading } = useAgents();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId] = useState(() => `test-${Date.now()}`);

  // Settings loaded from API
  const [botName, setBotName] = useState('Smart Realtor Agent');
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi! I'm your AI real estate assistant. Ask me anything about listings, neighborhoods, or getting started."
  );
  const [theme, setTheme] = useState<ThemeId>('dark');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load settings from API
  useEffect(() => {
    if (agentLoading) return;
    fetch(`/api/settings?tenantId=${activeAgentId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.bot_name) setBotName(d.bot_name);
        if (d.welcome_message) setWelcomeMessage(d.welcome_message);
        if (d.widget_theme) setTheme(d.widget_theme as ThemeId);
      })
      .catch(() => {
        // Use defaults
      });
  }, [agentLoading, activeAgentId]);

  // Add welcome message on mount/reset
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [welcomeMessage, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // Create placeholder for assistant response
    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeAgentId,
          conversationId,
          userMessage: text,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembled = '';
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          assembled += decoder.decode(result.value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assembled } : m
            )
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I'm having trouble connecting right now. Please try again in a moment.",
              }
            : m
        )
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const t = THEMES[theme];
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="dash-page">
      {/* Page Header */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Test Chatbot</h1>
          <p className="dash-page-sub">
            Preview your chatbot with current theme and settings. Messages are
            saved to conversations.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
            onClick={handleClearChat}
          >
            Clear Chat
          </button>
          <Link
            href="/widget-install"
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            Install Widget
          </Link>
        </div>
      </div>

      {/* Test Mode Banner */}
      <div
        style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🧪</span>
        <span style={{ fontSize: '0.88rem', color: '#fbbf24' }}>
          <strong>Test Mode</strong> — This preview uses your actual agent
          settings. Conversations are saved and visible in the Conversations
          page.
        </span>
      </div>

      {/* Chat Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1rem 0',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            height: '600px',
            background: t.panelBg,
            border: `1px solid ${t.panelBorder}`,
            borderRadius: t.borderRadius,
            backdropFilter: t.backdropFilter ?? 'none',
            WebkitBackdropFilter: t.backdropFilter ?? 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: t.headerBg,
              color: t.headerColor,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderBottom: `1px solid ${t.panelBorder}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              🏡
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{botName}</div>
              <div
                style={{
                  fontSize: '11px',
                  opacity: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#4ade80',
                    display: 'inline-block',
                  }}
                />
                Online (Test Mode)
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '16px 14px',
              overflowY: 'auto',
              background: t.bodyBg,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    maxWidth: '85%',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    wordBreak: 'break-word',
                    background:
                      msg.role === 'user' ? t.userBubbleBg : t.aiBubbleBg,
                    color:
                      msg.role === 'user' ? t.userBubbleColor : t.aiBubbleColor,
                    border:
                      msg.role === 'assistant'
                        ? `1px solid ${t.aiBubbleBorder}`
                        : 'none',
                    borderBottomRightRadius:
                      msg.role === 'user' ? '4px' : '14px',
                    borderBottomLeftRadius:
                      msg.role === 'assistant' ? '4px' : '14px',
                  }}
                >
                  {msg.content ||
                    (sending && msg.role === 'assistant' ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span
                          className="typing-dot"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: t.typingColor,
                            animation: 'typingBounce 1.2s infinite ease-in-out',
                          }}
                        />
                        <span
                          className="typing-dot"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: t.typingColor,
                            animation:
                              'typingBounce 1.2s infinite ease-in-out 0.15s',
                          }}
                        />
                        <span
                          className="typing-dot"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: t.typingColor,
                            animation:
                              'typingBounce 1.2s infinite ease-in-out 0.3s',
                          }}
                        />
                      </span>
                    ) : null)}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: t.timestampColor,
                    padding: '0 4px',
                  }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              background: t.panelBg,
              borderTop: `1px solid ${t.panelBorder}`,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about listings, areas, pricing..."
              disabled={sending}
              style={{
                flex: 1,
                border: `1px solid ${t.inputBorder}`,
                borderRadius: '999px',
                padding: '10px 14px',
                fontSize: '14px',
                background: t.inputBg,
                color: t.inputColor,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              style={{
                border: 0,
                borderRadius: '999px',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: t.sendBg,
                color: t.sendColor,
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !input.trim() ? 0.5 : 1,
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="dash-info-card" style={{ marginTop: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            Testing Tips
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--dash-muted)' }}>
            Try asking about listings, neighborhoods, schools, or pricing. The
            bot uses your knowledge base to answer questions. If you haven&apos;t
            added any content yet, visit the{' '}
            <Link
              href="/knowledge-base"
              style={{ color: 'var(--primary)', textDecoration: 'underline' }}
            >
              Knowledge Base
            </Link>{' '}
            to add URLs or documents.
          </p>
        </div>
      </div>

      {/* Typing animation styles */}
      <style jsx>{`
        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
