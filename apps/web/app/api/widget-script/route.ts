/**
 * GET /api/widget-script
 * Serves the embeddable widget JavaScript bundle.
 * Usage on third-party sites:
 *   <script src="https://yourapp.com/api/widget-script"
 *           data-bot-id="TENANT_UUID"
 *           data-theme="dark"
 *   ></script>
 */
import { NextRequest } from 'next/server';

/* ── Widget JS (inlined as a template string) ─────────────── */
const WIDGET_JS = /* javascript */ `
(function () {
  var script  = document.currentScript;
  var botId   = script && script.getAttribute('data-bot-id');
  var theme   = (script && script.getAttribute('data-theme')) || 'dark';
  var origin  = script ? new URL(script.src).origin : window.location.origin;

  if (!botId) { console.warn('[Smart Realtor Agent] data-bot-id is required'); return; }

  /* ── Styles ──────────────────────────────────────────── */
  var css = \`
    #sra-launcher {
      position: fixed; bottom: 24px; right: 24px; z-index: 999998;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg,#7c3aed,#3b82f6);
      border: none; cursor: pointer; box-shadow: 0 4px 24px rgba(124,58,237,0.45);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #sra-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(124,58,237,0.6); }
    #sra-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 999999;
      width: 380px; height: 560px; max-height: calc(100vh - 120px);
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.1);
      display: none; flex-direction: column;
      transition: opacity 0.2s, transform 0.2s;
      opacity: 0; transform: translateY(16px) scale(0.97);
    }
    #sra-panel.sra-open {
      display: flex; opacity: 1; transform: translateY(0) scale(1);
    }
    #sra-panel iframe {
      width: 100%; height: 100%; border: none; flex: 1;
    }
    @media (max-width: 480px) {
      #sra-panel {
        bottom: 0; right: 0; left: 0; width: 100%;
        border-radius: 20px 20px 0 0; height: 70vh;
      }
    }
  \`;
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Launcher button ─────────────────────────────────── */
  var launcher = document.createElement('button');
  launcher.id = 'sra-launcher';
  launcher.setAttribute('aria-label', 'Open AI chat');
  launcher.innerHTML = '💬';
  document.body.appendChild(launcher);

  /* ── Panel + iframe ──────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = 'sra-panel';

  var iframe = document.createElement('iframe');
  iframe.src = origin + '/widget/' + encodeURIComponent(botId) + '?theme=' + encodeURIComponent(theme);
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('loading', 'lazy');
  iframe.title = 'Smart Realtor Agent Chat';
  panel.appendChild(iframe);
  document.body.appendChild(panel);

  /* ── Toggle open/close ───────────────────────────────── */
  var isOpen = false;
  function open() {
    isOpen = true;
    panel.classList.add('sra-open');
    launcher.innerHTML = '✕';
    launcher.setAttribute('aria-label', 'Close AI chat');
  }
  function close() {
    isOpen = false;
    panel.classList.remove('sra-open');
    launcher.innerHTML = '💬';
    launcher.setAttribute('aria-label', 'Open AI chat');
  }
  launcher.addEventListener('click', function () { isOpen ? close() : open(); });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });
})();
`;

export async function GET(request: NextRequest): Promise<Response> {
  // Optional: validate Origin header to restrict embedding domains
  void request;

  return new Response(WIDGET_JS, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
