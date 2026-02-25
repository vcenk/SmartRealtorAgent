/* ============================================================
   Smart Realtor Agent Widget  –  v2
   Supports 4 selectable themes via data-theme attribute:
     dark | minimal | professional | glass
   ============================================================ */

type WidgetConfig = {
  botId: string;
  apiBaseUrl: string;
  theme: WidgetTheme;
  botName: string;
  welcomeMessage: string;
};

type WidgetTheme = 'dark' | 'minimal' | 'professional' | 'glass';

/* ── Theme definitions ───────────────────────────────────── */
type ThemeVars = {
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  headerBg: string;
  headerColor: string;
  headerBorder: string;
  bodyBg: string;
  userBubbleBg: string;
  userBubbleColor: string;
  aiBubbleBg: string;
  aiBubbleColor: string;
  aiBubbleBorder: string;
  inputWrapBg: string;
  inputWrapBorder: string;
  inputBg: string;
  inputBorder: string;
  inputColor: string;
  inputPlaceholder: string;
  sendBg: string;
  sendColor: string;
  launcherBg: string;
  launcherColor: string;
  launcherShadow: string;
  timestampColor: string;
  typingColor: string;
  backdropFilter: string;
  borderRadius: string;
  font: string;
};

const THEMES: Record<WidgetTheme, ThemeVars> = {
  /* ── 1. Modern Dark (Fluence-style) ────────────────────── */
  dark: {
    panelBg: '#0d0f1a',
    panelBorder: 'rgba(255,255,255,0.08)',
    panelShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)',
    headerBg: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    headerColor: '#ffffff',
    headerBorder: 'transparent',
    bodyBg: '#0d0f1a',
    userBubbleBg: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    userBubbleColor: '#ffffff',
    aiBubbleBg: 'rgba(255,255,255,0.06)',
    aiBubbleColor: '#e2e8f0',
    aiBubbleBorder: 'rgba(255,255,255,0.1)',
    inputWrapBg: '#0d0f1a',
    inputWrapBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputColor: '#f1f5f9',
    inputPlaceholder: '#64748b',
    sendBg: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
    sendColor: '#ffffff',
    launcherBg: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
    launcherColor: '#ffffff',
    launcherShadow: '0 8px 32px rgba(124,58,237,0.5)',
    timestampColor: '#475569',
    typingColor: '#7c3aed',
    backdropFilter: 'none',
    borderRadius: '20px',
    font: "'Inter', 'Segoe UI', sans-serif",
  },

  /* ── 2. Clean Minimal ──────────────────────────────────── */
  minimal: {
    panelBg: '#ffffff',
    panelBorder: '#e2e8f0',
    panelShadow: '0 20px 60px rgba(0,0,0,0.12)',
    headerBg: '#ffffff',
    headerColor: '#0f172a',
    headerBorder: '#e2e8f0',
    bodyBg: '#f8fafc',
    userBubbleBg: '#7c3aed',
    userBubbleColor: '#ffffff',
    aiBubbleBg: '#ffffff',
    aiBubbleColor: '#1e293b',
    aiBubbleBorder: '#e2e8f0',
    inputWrapBg: '#ffffff',
    inputWrapBorder: '#e2e8f0',
    inputBg: '#f8fafc',
    inputBorder: '#e2e8f0',
    inputColor: '#0f172a',
    inputPlaceholder: '#94a3b8',
    sendBg: '#7c3aed',
    sendColor: '#ffffff',
    launcherBg: '#7c3aed',
    launcherColor: '#ffffff',
    launcherShadow: '0 8px 24px rgba(124,58,237,0.35)',
    timestampColor: '#94a3b8',
    typingColor: '#7c3aed',
    backdropFilter: 'none',
    borderRadius: '16px',
    font: "'Inter', 'Segoe UI', sans-serif",
  },

  /* ── 3. Professional (Real Estate dark-blue) ──────────── */
  professional: {
    panelBg: '#0f172a',
    panelBorder: '#1e293b',
    panelShadow: '0 24px 60px rgba(0,0,0,0.5)',
    headerBg: '#1e293b',
    headerColor: '#f8fafc',
    headerBorder: '#334155',
    bodyBg: '#0f172a',
    userBubbleBg: '#0ea5e9',
    userBubbleColor: '#ffffff',
    aiBubbleBg: '#1e293b',
    aiBubbleColor: '#cbd5e1',
    aiBubbleBorder: '#334155',
    inputWrapBg: '#0f172a',
    inputWrapBorder: '#1e293b',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    inputColor: '#f1f5f9',
    inputPlaceholder: '#475569',
    sendBg: '#0ea5e9',
    sendColor: '#ffffff',
    launcherBg: '#0ea5e9',
    launcherColor: '#ffffff',
    launcherShadow: '0 8px 24px rgba(14,165,233,0.4)',
    timestampColor: '#334155',
    typingColor: '#0ea5e9',
    backdropFilter: 'none',
    borderRadius: '12px',
    font: "'Georgia', 'Times New Roman', serif",
  },

  /* ── 4. Glass / Glassmorphism ──────────────────────────── */
  glass: {
    panelBg: 'rgba(15,15,30,0.55)',
    panelBorder: 'rgba(255,255,255,0.12)',
    panelShadow: '0 24px 64px rgba(0,0,0,0.5)',
    headerBg: 'rgba(255,255,255,0.08)',
    headerColor: '#ffffff',
    headerBorder: 'rgba(255,255,255,0.1)',
    bodyBg: 'transparent',
    userBubbleBg: 'rgba(168,85,247,0.75)',
    userBubbleColor: '#ffffff',
    aiBubbleBg: 'rgba(255,255,255,0.1)',
    aiBubbleColor: '#f1f5f9',
    aiBubbleBorder: 'rgba(255,255,255,0.15)',
    inputWrapBg: 'rgba(255,255,255,0.05)',
    inputWrapBorder: 'rgba(255,255,255,0.1)',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputColor: '#ffffff',
    inputPlaceholder: 'rgba(255,255,255,0.4)',
    sendBg: 'rgba(168,85,247,0.8)',
    sendColor: '#ffffff',
    launcherBg: 'rgba(124,58,237,0.7)',
    launcherColor: '#ffffff',
    launcherShadow: '0 8px 32px rgba(124,58,237,0.4)',
    timestampColor: 'rgba(255,255,255,0.4)',
    typingColor: '#a855f7',
    backdropFilter: 'blur(20px)',
    borderRadius: '22px',
    font: "'Inter', 'Segoe UI', sans-serif",
  },
};

/* ── CSS generation ─────────────────────────────────────── */
const buildCSS = (t: ThemeVars): string => `
  .sra-launcher {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 2147483646;
    border: 0;
    border-radius: 999px;
    padding: 14px 22px;
    background: ${t.launcherBg};
    color: ${t.launcherColor};
    font-weight: 700;
    font-size: 14px;
    font-family: ${t.font};
    cursor: pointer;
    box-shadow: ${t.launcherShadow};
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .sra-launcher:hover { transform: translateY(-2px); }

  .sra-panel {
    position: fixed;
    right: 24px;
    bottom: 90px;
    width: 360px;
    max-width: calc(100vw - 48px);
    height: 520px;
    max-height: calc(100vh - 120px);
    background: ${t.panelBg};
    border: 1px solid ${t.panelBorder};
    border-radius: ${t.borderRadius};
    box-shadow: ${t.panelShadow};
    backdrop-filter: ${t.backdropFilter};
    -webkit-backdrop-filter: ${t.backdropFilter};
    display: none;
    flex-direction: column;
    z-index: 2147483645;
    font-family: ${t.font};
    overflow: hidden;
    transition: opacity 0.2s ease, transform 0.2s ease;
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  .sra-panel.open {
    display: flex;
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .sra-head {
    background: ${t.headerBg};
    color: ${t.headerColor};
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-bottom: 1px solid ${t.headerBorder};
    flex-shrink: 0;
  }
  .sra-head-left { display: flex; align-items: center; gap: 10px; }
  .sra-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .sra-head-title { font-weight: 700; font-size: 14px; }
  .sra-head-status {
    font-size: 11px;
    opacity: 0.75;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .sra-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    display: inline-block;
  }
  .sra-close {
    background: transparent;
    border: 0;
    color: ${t.headerColor};
    opacity: 0.7;
    cursor: pointer;
    font-size: 18px;
    padding: 2px 6px;
    border-radius: 6px;
    line-height: 1;
    transition: opacity 0.15s;
  }
  .sra-close:hover { opacity: 1; }

  .sra-messages {
    flex: 1;
    padding: 16px 14px;
    overflow-y: auto;
    background: ${t.bodyBg};
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
  }
  .sra-messages::-webkit-scrollbar { width: 4px; }
  .sra-messages::-webkit-scrollbar-track { background: transparent; }
  .sra-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

  .sra-msg-wrap { display: flex; flex-direction: column; gap: 3px; }
  .sra-msg-wrap.user { align-items: flex-end; }
  .sra-msg-wrap.assistant { align-items: flex-start; }

  .sra-msg {
    padding: 10px 14px;
    border-radius: 14px;
    max-width: 85%;
    font-size: 14px;
    line-height: 1.55;
    word-break: break-word;
  }
  .sra-msg.user {
    background: ${t.userBubbleBg};
    color: ${t.userBubbleColor};
    border-bottom-right-radius: 4px;
  }
  .sra-msg.assistant {
    background: ${t.aiBubbleBg};
    color: ${t.aiBubbleColor};
    border: 1px solid ${t.aiBubbleBorder};
    border-bottom-left-radius: 4px;
  }

  .sra-timestamp {
    font-size: 10px;
    color: ${t.timestampColor};
    padding: 0 4px;
  }

  .sra-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    background: ${t.aiBubbleBg};
    border: 1px solid ${t.aiBubbleBorder};
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    width: fit-content;
  }
  .sra-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${t.typingColor};
    animation: sraBounce 1.2s infinite ease-in-out;
  }
  .sra-dot:nth-child(2) { animation-delay: 0.15s; }
  .sra-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes sraBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-5px); opacity: 1; }
  }

  .sra-citations {
    margin-top: 8px;
    font-size: 11px;
    color: ${t.timestampColor};
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sra-citation-link {
    color: ${t.typingColor};
    text-decoration: none;
    opacity: 0.85;
  }
  .sra-citation-link:hover { opacity: 1; text-decoration: underline; }

  .sra-input-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: ${t.inputWrapBg};
    border-top: 1px solid ${t.inputWrapBorder};
    flex-shrink: 0;
  }
  .sra-input {
    flex: 1;
    border: 1px solid ${t.inputBorder};
    border-radius: 999px;
    padding: 9px 14px;
    font-size: 14px;
    font-family: ${t.font};
    background: ${t.inputBg};
    color: ${t.inputColor};
    outline: none;
    transition: border-color 0.15s;
    line-height: 1.4;
  }
  .sra-input::placeholder { color: ${t.inputPlaceholder}; }
  .sra-input:focus { border-color: ${t.typingColor}; }
  .sra-send {
    border: 0;
    border-radius: 999px;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${t.sendBg};
    color: ${t.sendColor};
    cursor: pointer;
    font-size: 16px;
    flex-shrink: 0;
    transition: transform 0.15s, opacity 0.15s;
  }
  .sra-send:hover { transform: scale(1.08); }
  .sra-send:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Helpers ─────────────────────────────────────────────── */
const defaultApiBase =
  (document.currentScript as HTMLScriptElement | null)?.dataset.apiBaseUrl ||
  (window as unknown as { SMART_REALTOR_API_BASE?: string }).SMART_REALTOR_API_BASE ||
  'http://localhost:3000';

const script = document.currentScript as HTMLScriptElement | null;
const botId = script?.dataset.botId ?? '';
const rawTheme = (script?.dataset.theme ?? 'dark') as WidgetTheme;
const theme: WidgetTheme = rawTheme in THEMES ? rawTheme : 'dark';
const botName = script?.dataset.botName ?? 'Smart Realtor Agent';
const welcomeMessage =
  script?.dataset.welcomeMessage ??
  'Hi! I\'m your AI real estate assistant. Ask me anything about listings, neighborhoods, or getting started.';

const createEl = <T extends keyof HTMLElementTagNameMap>(tag: T, cls?: string): HTMLElementTagNameMap[T] => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
};

const formatTime = (): string =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ── Widget init ─────────────────────────────────────────── */
export const initWidget = (config: WidgetConfig): void => {
  /* inject styles */
  const styleEl = createEl('style');
  styleEl.textContent = buildCSS(THEMES[config.theme]);
  document.head.appendChild(styleEl);

  /* launcher button */
  const launcher = createEl('button', 'sra-launcher');
  launcher.innerHTML = '🏠 Chat with us';

  /* panel */
  const panel = createEl('div', 'sra-panel');

  /* header */
  const head = createEl('div', 'sra-head');
  head.innerHTML = `
    <div class="sra-head-left">
      <div class="sra-avatar">🏡</div>
      <div>
        <div class="sra-head-title">${config.botName}</div>
        <div class="sra-head-status"><span class="sra-status-dot"></span>Online · Replies instantly</div>
      </div>
    </div>
    <button class="sra-close" aria-label="Close chat">✕</button>
  `;

  /* messages area */
  const messages = createEl('div', 'sra-messages');

  /* input row */
  const inputWrap = createEl('div', 'sra-input-wrap');
  const input = createEl('input', 'sra-input') as HTMLInputElement;
  input.placeholder = 'Ask about listings, areas, pricing…';
  input.setAttribute('autocomplete', 'off');
  const send = createEl('button', 'sra-send') as HTMLButtonElement;
  send.innerHTML = '➤';
  send.setAttribute('aria-label', 'Send');
  inputWrap.append(input, send);

  panel.append(head, messages, inputWrap);
  document.body.append(launcher, panel);

  /* welcome message */
  const addMessage = (
    text: string,
    role: 'user' | 'assistant',
    citations?: Array<{ title: string; url?: string }>,
  ): HTMLElement => {
    const wrap = createEl('div', `sra-msg-wrap ${role}`);
    const bubble = createEl('div', `sra-msg ${role}`);
    bubble.textContent = text;
    const ts = createEl('span', 'sra-timestamp');
    ts.textContent = formatTime();
    wrap.append(bubble, ts);

    if (citations && citations.length > 0) {
      const citationBox = createEl('div', 'sra-citations');
      citationBox.innerHTML =
        '📎 Sources: ' +
        citations
          .map((c) =>
            c.url
              ? `<a class="sra-citation-link" href="${c.url}" target="_blank" rel="noopener">${c.title}</a>`
              : `<span>${c.title}</span>`,
          )
          .join(', ');
      wrap.appendChild(citationBox);
    }

    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  const showTyping = (): HTMLElement => {
    const wrap = createEl('div', 'sra-msg-wrap assistant');
    const dots = createEl('div', 'sra-typing');
    dots.innerHTML = '<div class="sra-dot"></div><div class="sra-dot"></div><div class="sra-dot"></div>';
    wrap.appendChild(dots);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  };

  /* initial greeting */
  addMessage(config.welcomeMessage, 'assistant');

  /* open/close */
  let isOpen = false;
  const togglePanel = () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    launcher.innerHTML = isOpen ? '✕ Close' : '🏠 Chat with us';
    if (isOpen) {
      requestAnimationFrame(() => input.focus());
    }
  };

  launcher.addEventListener('click', togglePanel);
  head.querySelector('.sra-close')?.addEventListener('click', togglePanel);

  /* send message */
  const sendMessage = async () => {
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    send.disabled = true;

    addMessage(message, 'user');
    const typingWrap = showTyping();

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: config.botId,
          conversationId: `web-${Date.now()}`,
          userMessage: message,
        }),
      });

      typingWrap.remove();

      if (!response.body) {
        addMessage('Sorry, I couldn\'t get a response right now. Please try again.', 'assistant');
        return;
      }

      /* parse citations from header */
      let citations: Array<{ title: string; url?: string }> = [];
      try {
        const raw = response.headers.get('X-Citations');
        if (raw) citations = JSON.parse(raw);
      } catch {
        // non-critical
      }

      /* stream response */
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembled = '';

      const wrap = createEl('div', 'sra-msg-wrap assistant');
      const bubble = createEl('div', 'sra-msg assistant');
      const ts = createEl('span', 'sra-timestamp');
      ts.textContent = formatTime();
      wrap.append(bubble, ts);
      messages.appendChild(wrap);

      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          assembled += decoder.decode(value, { stream: true });
          bubble.textContent = assembled;
          messages.scrollTop = messages.scrollHeight;
        }
      }

      /* append citations after streaming */
      if (citations.length > 0) {
        const citationBox = createEl('div', 'sra-citations');
        citationBox.innerHTML =
          '📎 Sources: ' +
          citations
            .map((c) =>
              c.url
                ? `<a class="sra-citation-link" href="${c.url}" target="_blank" rel="noopener">${c.title}</a>`
                : `<span>${c.title}</span>`,
            )
            .join(', ');
        wrap.appendChild(citationBox);
      }
    } catch {
      typingWrap.remove();
      addMessage('Network error. Please check your connection and try again.', 'assistant');
    } finally {
      send.disabled = false;
      input.focus();
    }
  };

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
};

/* ── Bootstrap ───────────────────────────────────────────── */
if (botId) {
  initWidget({ botId, apiBaseUrl: defaultApiBase, theme, botName, welcomeMessage });
} else {
  // eslint-disable-next-line no-console
  console.warn('[Smart Realtor Agent Widget] Missing data-bot-id attribute.');
}
