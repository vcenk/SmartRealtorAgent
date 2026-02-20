const snippet = `<script
  src="https://cdn.smartrealtoriai.com/widget.js"
  data-bot-id="YOUR_BOT_ID"
  data-api-base-url="https://api.smartrealtoriai.com"
></script>`;

const steps = [
  {
    num: '01',
    title: 'Copy the snippet',
    desc: 'Copy the script tag below and replace YOUR_BOT_ID with your tenant bot ID from Settings.',
  },
  {
    num: '02',
    title: 'Paste before </body>',
    desc: 'Add the snippet to any page where you want the AI chat widget to appear.',
  },
  {
    num: '03',
    title: 'Go live',
    desc: 'Save and deploy. The widget will appear as a floating button in the bottom-right corner.',
  },
];

export default function WidgetInstallPage() {
  return (
    <div>
      {/* Page header */}
      <div className="dash-page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="dash-page-title">Widget Install</h1>
          <p className="dash-page-sub">Embed the AI chatbot on your agency website in minutes.</p>
        </div>
        <div className="badge">🔌 One script tag</div>
      </div>

      {/* Steps */}
      <div className="widget-steps">
        {steps.map((s) => (
          <div key={s.num} className="widget-step">
            <div className="widget-step-num">{s.num}</div>
            <div>
              <div className="widget-step-title">{s.title}</div>
              <p className="widget-step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Code snippet */}
      <div className="dash-code-block-wrap">
        <div className="dash-code-header">
          <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>HTML — paste before &lt;/body&gt;</span>
          <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.9rem' }}>
            Copy
          </button>
        </div>
        <pre className="dash-code-block">{snippet}</pre>
      </div>

      {/* Preview card */}
      <div className="dash-info-card" style={{ marginTop: '2rem' }}>
        <span style={{ fontSize: '1.5rem' }}>💡</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Your bot ID</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            Find your bot ID in the{' '}
            <a href="/settings" style={{ color: 'var(--purple-light)' }}>Settings page</a>.
            Each tenant has a unique bot ID that scopes the widget to your knowledge base and lead pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
