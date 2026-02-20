type WidgetConfig = {
  botId: string;
  apiBaseUrl: string;
};

const defaultApiBase =
  (document.currentScript as HTMLScriptElement | null)?.dataset.apiBaseUrl ||
  (window as unknown as { SMART_REALTOR_API_BASE?: string }).SMART_REALTOR_API_BASE ||
  'http://localhost:3000';

const script = document.currentScript as HTMLScriptElement | null;
const botId = script?.dataset.botId;

const style = `
  .sra-launcher { position: fixed; right: 20px; bottom: 20px; z-index: 99999; border: 0; border-radius: 999px; padding: 12px 16px; background: #005f73; color: #fff; font-weight: 700; cursor: pointer; }
  .sra-panel { position: fixed; right: 20px; bottom: 80px; width: 320px; max-width: calc(100vw - 40px); height: 440px; background: #fff; border: 1px solid #d7dce0; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,.15); display: none; z-index: 99999; overflow: hidden; font-family: 'Segoe UI', sans-serif; }
  .sra-panel.open { display: grid; grid-template-rows: auto 1fr auto; }
  .sra-head { background: #0d1a1e; color: #fff; padding: 10px 12px; font-weight: 700; }
  .sra-messages { padding: 12px; overflow-y: auto; display: grid; gap: 8px; }
  .sra-msg { padding: 8px 10px; border-radius: 10px; max-width: 90%; }
  .sra-user { background: #e7f2f5; justify-self: end; }
  .sra-assistant { background: #f6f7f8; }
  .sra-input-wrap { display: grid; grid-template-columns: 1fr auto; gap: 6px; padding: 10px; border-top: 1px solid #e7ecef; }
  .sra-input { border: 1px solid #d7dce0; border-radius: 10px; padding: 8px; }
  .sra-send { border: 0; border-radius: 10px; padding: 8px 12px; background: #ee9b00; cursor: pointer; font-weight: 700; }
`;

const addStyle = (): void => {
  const el = document.createElement('style');
  el.textContent = style;
  document.head.appendChild(el);
};

const createEl = <T extends keyof HTMLElementTagNameMap>(tag: T, className?: string) => {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  return el;
};

const appendMessage = (
  container: HTMLElement,
  text: string,
  role: 'user' | 'assistant',
): HTMLElement => {
  const msg = createEl('div', `sra-msg ${role === 'user' ? 'sra-user' : 'sra-assistant'}`);
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return msg;
};

const streamReply = async (
  config: WidgetConfig,
  message: string,
  assistantNode: HTMLElement,
): Promise<void> => {
  const response = await fetch(`${config.apiBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: config.botId,
      conversationId: `web-${Date.now()}`,
      userMessage: message,
    }),
  });

  if (!response.body) {
    assistantNode.textContent = 'No response stream available.';
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assembled = '';

  let complete = false;
  while (!complete) {
    const { value, done } = await reader.read();
    if (done) {
      complete = true;
      continue;
    }
    assembled += decoder.decode(value, { stream: true });
    assistantNode.textContent = assembled;
  }
};

export const initWidget = (config: WidgetConfig): void => {
  addStyle();

  const launcher = createEl('button', 'sra-launcher');
  launcher.textContent = 'Chat';

  const panel = createEl('div', 'sra-panel');
  const head = createEl('div', 'sra-head');
  head.textContent = 'SmartRealtorAgent';
  const messages = createEl('div', 'sra-messages');
  const inputWrap = createEl('div', 'sra-input-wrap');
  const input = createEl('input', 'sra-input') as HTMLInputElement;
  input.placeholder = 'Ask about this property...';
  const send = createEl('button', 'sra-send');
  send.textContent = 'Send';

  inputWrap.append(input, send);
  panel.append(head, messages, inputWrap);
  document.body.append(launcher, panel);

  launcher.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  send.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) {
      return;
    }

    appendMessage(messages, message, 'user');
    input.value = '';
    const assistantNode = appendMessage(messages, '...', 'assistant');
    await streamReply(config, message, assistantNode);
  });
};

if (botId) {
  initWidget({
    botId,
    apiBaseUrl: defaultApiBase,
  });
} else {
  // eslint-disable-next-line no-console
  console.warn('[SmartRealtorWidget] Missing data-bot-id attribute.');
}
