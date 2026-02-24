'use client';

import { useState, useEffect, useRef, use } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

type TenantSettings = {
  bot_name?: string;
  welcome_message?: string;
  widget_theme?: string;
  brand_color?: string;
};

const THEMES: Record<string, React.CSSProperties & { userBubble: string; aiBubble: string; aiBubbleColor: string; border: string; inputBg: string; headerBg: string; headerColor: string }> = {
  dark: {
    background: '#0d0f1a', color: '#e2e8f0', borderRadius: 0,
    userBubble: 'linear-gradient(135deg,#7c3aed,#3b82f6)', aiBubble: 'rgba(255,255,255,0.07)',
    aiBubbleColor: '#e2e8f0', border: 'rgba(255,255,255,0.08)', inputBg: 'rgba(255,255,255,0.05)',
    headerBg: 'linear-gradient(135deg,#7c3aed,#3b82f6)', headerColor: '#fff',
  },
  minimal: {
    background: '#ffffff', color: '#0f172a', borderRadius: 0,
    userBubble: '#7c3aed', aiBubble: '#f1f5f9', aiBubbleColor: '#1e293b',
    border: '#e2e8f0', inputBg: '#f8fafc', headerBg: '#ffffff', headerColor: '#0f172a',
  },
  professional: {
    background: '#0f172a', color: '#f8fafc', borderRadius: 0,
    userBubble: '#0ea5e9', aiBubble: '#1e293b', aiBubbleColor: '#cbd5e1',
    border: '#334155', inputBg: '#1e293b', headerBg: '#1e293b', headerColor: '#f8fafc',
  },
  glass: {
    background: 'rgba(15,15,30,0.85)', color: '#f1f5f9', borderRadius: 0,
    userBubble: 'rgba(168,85,247,0.75)', aiBubble: 'rgba(255,255,255,0.1)',
    aiBubbleColor: '#f1f5f9', border: 'rgba(255,255,255,0.12)', inputBg: 'rgba(255,255,255,0.08)',
    headerBg: 'rgba(255,255,255,0.08)', headerColor: '#fff',
  },
};

function generateConversationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function WidgetPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = use(params);

  const [settings, setSettings] = useState<TenantSettings>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [convId] = useState(() => {
    if (typeof window === 'undefined') return generateConversationId();
    const stored = localStorage.getItem(`sra-conv-${botId}`);
    if (stored) return stored;
    const id = generateConversationId();
    localStorage.setItem(`sra-conv-${botId}`, id);
    return id;
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load tenant settings + conversation history on mount
  useEffect(() => {
    fetch(`/api/settings?tenantId=${botId}`)
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => {});

    fetch(`/api/widget/history?tenantId=${botId}&conversationId=${convId}`)
      .then((r) => r.json())
      .then((msgs: Array<{ role: string; content: string }>) => {
        if (msgs.length > 0) {
          setMessages(msgs.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })));
        }
      })
      .catch(() => {});
  }, [botId, convId]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: botId, conversationId: convId, userMessage: text }),
      });
      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        streamDone = done;
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: updated[updated.length - 1].content + chunk };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: "I'm having trouble connecting. Please try again." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const theme = THEMES[settings.widget_theme ?? 'dark'] ?? THEMES.dark;
  const botName = settings.bot_name ?? 'Smart Realtor Agent';
  const welcomeMsg = settings.welcome_message ?? "Hi! I'm your AI real estate assistant. Ask me anything!";
  const accent = settings.brand_color ?? '#7c3aed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: theme.background as string, color: theme.color as string, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: theme.headerBg, color: theme.headerColor, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏡</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{botName}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>● Online</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Welcome message */}
        {messages.length === 0 && (
          <div style={{ background: theme.aiBubble, color: theme.aiBubbleColor, border: `1px solid ${theme.border}`, borderRadius: '12px 12px 12px 2px', padding: '10px 14px', maxWidth: '85%', fontSize: 14, lineHeight: 1.5 }}>
            {welcomeMsg}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                background: msg.role === 'user' ? theme.userBubble : theme.aiBubble,
                color: msg.role === 'user' ? '#fff' : theme.aiBubbleColor,
                border: msg.role === 'assistant' ? `1px solid ${theme.border}` : 'none',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '10px 14px', maxWidth: '85%', fontSize: 14, lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}
            >
              {msg.content || (streaming && i === messages.length - 1 ? '▊' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          style={{ flex: 1, background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: 999, padding: '10px 16px', fontSize: 14, color: theme.color as string, outline: 'none' }}
          placeholder="Ask a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={streaming}
        />
        <button
          style={{ width: 40, height: 40, borderRadius: '50%', background: accent, border: 'none', color: '#fff', fontSize: 16, cursor: streaming ? 'default' : 'pointer', opacity: streaming ? 0.5 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={sendMessage}
          disabled={streaming}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
