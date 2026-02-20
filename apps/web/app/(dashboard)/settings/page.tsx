export default function SettingsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="dash-page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="dash-page-title">Settings</h1>
          <p className="dash-page-sub">Manage your tenant profile, branding, and policy configuration.</p>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.6rem 1.3rem' }}>
          Save Changes
        </button>
      </div>

      <div className="settings-grid">
        {/* Tenant profile */}
        <section className="dash-settings-card">
          <div className="dash-settings-card-title">Tenant Profile</div>
          <div className="form-field">
            <label className="form-label">Agency name</label>
            <input className="form-input" defaultValue="Demo Realty" />
          </div>
          <div className="form-field">
            <label className="form-label">Website URL</label>
            <input className="form-input" type="url" placeholder="https://yoursite.com" />
          </div>
          <div className="form-field">
            <label className="form-label">Bot ID</label>
            <div className="settings-bot-id">
              <code className="settings-code">11111111-1111-1111-1111-111111111111</code>
              <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem', flexShrink: 0 }}>
                Copy
              </button>
            </div>
            <p className="form-hint">Use this ID in your widget script tag.</p>
          </div>
        </section>

        {/* Policy config */}
        <section className="dash-settings-card">
          <div className="dash-settings-card-title">Policy Configuration</div>
          <div className="form-field">
            <label className="form-label">Citation enforcement</label>
            <div className="settings-toggle-row">
              <div className="settings-toggle active" />
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Require citations for all factual responses
              </span>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Off-topic guard</label>
            <div className="settings-toggle-row">
              <div className="settings-toggle active" />
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Block questions unrelated to real estate
              </span>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Max tokens per response</label>
            <input className="form-input" type="number" defaultValue={512} min={128} max={2048} />
          </div>
        </section>

        {/* Branding */}
        <section className="dash-settings-card">
          <div className="dash-settings-card-title">Widget Branding</div>
          <div className="form-field">
            <label className="form-label">Bot display name</label>
            <input className="form-input" defaultValue="SmartRealtorAI" />
          </div>
          <div className="form-field">
            <label className="form-label">Welcome message</label>
            <textarea
              className="form-input"
              rows={3}
              defaultValue="Hi! I'm your real estate assistant. Ask me about listings, neighborhoods, or how to get started."
            />
          </div>
          <div className="form-field">
            <label className="form-label">Brand color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="color" defaultValue="#7c3aed" style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer' }} />
              <input className="form-input" defaultValue="#7c3aed" style={{ fontFamily: 'monospace' }} />
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="dash-settings-card dash-danger-card">
          <div className="dash-settings-card-title" style={{ color: '#f87171' }}>Danger Zone</div>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            These actions are irreversible. Proceed with caution.
          </p>
          <button className="btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.88rem' }}>
            Delete Tenant & All Data
          </button>
        </section>
      </div>
    </div>
  );
}
