import Link from 'next/link';

const features = [
  'Citation-backed answers from your own knowledge base',
  'Buyer and seller lead qualification workflow',
  'Multi-tenant dashboard with Supabase-backed security',
  'Embeddable chat widget for any marketing site',
  'Deterministic orchestration and auditable skill calls',
  'Policy guardrails to prevent hallucinated facts',
];

const steps = [
  { title: '1. Connect', text: 'Set up your tenant, auth, and website widget.' },
  { title: '2. Upload', text: 'Ingest listing guides, neighborhood pages, and FAQs.' },
  { title: '3. Convert', text: 'Let the bot answer with citations and capture leads.' },
];

const faqs = [
  {
    q: 'Can I run multiple agents under one account?',
    a: 'Yes. Each tenant can isolate agents, data, and policies with strict row-level security.',
  },
  {
    q: 'Does the chatbot cite sources?',
    a: 'Yes. Factual responses are policy-enforced to include KB citations.',
  },
  {
    q: 'Do you support MLS or CRM sync?',
    a: 'Not in v1. We include integration stubs for MLS, CRM, and SMS.',
  },
];

export default function MarketingPage() {
  return (
    <main>
      <header className="nav">
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}
        >
          <strong>SmartRealtorAgent</strong>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/login">Sign In</Link>
            <Link className="btn btn-primary" href="/leads">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="hero container">
        <h1>Real estate chat that cites sources and captures leads.</h1>
        <p>
          Launch a tenant-safe RAG assistant for your agency site in minutes. SmartRealtorAgent
          answers listing and market questions from your KB, never invents facts, and routes
          qualified buyer/seller leads to your dashboard.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <Link className="btn btn-primary" href="/login">
            Start Free Trial
          </Link>
          <a className="btn btn-accent" href="#pricing">
            See Pricing
          </a>
        </div>
      </section>

      <section className="section container">
        <h2>Features and Services</h2>
        <div className="grid grid-3">
          {features.map((feature) => (
            <article className="card" key={feature}>
              {feature}
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <h2>How It Works</h2>
        <div className="grid grid-3">
          {steps.map((step) => (
            <article className="card" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <h2>Testimonials</h2>
        <div className="grid grid-2">
          <article className="card">
            "Our website chat finally gives trustworthy answers with real citations." - Coastal
            Homes Team
          </article>
          <article className="card">
            "Lead quality is higher because the bot qualifies timeline and budget before handoff." -
            Northline Realty
          </article>
        </div>
      </section>

      <section id="pricing" className="section container">
        <h2>Pricing</h2>
        <div className="pricing">
          <article className="card">
            <h3>Starter</h3>
            <p>$49/mo</p>
            <p>1 tenant, widget + KB + leads</p>
          </article>
          <article className="card">
            <h3>Growth</h3>
            <p>$149/mo</p>
            <p>Multi-agent dashboard and audit logs</p>
          </article>
          <article className="card">
            <h3>Broker Pro</h3>
            <p>Custom</p>
            <p>Advanced controls and priority support</p>
          </article>
        </div>
      </section>

      <section className="section container">
        <h2>FAQ</h2>
        <div className="grid">
          {faqs.map((item) => (
            <article className="card" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container" style={{ paddingBottom: '5rem' }}>
        <div className="card" style={{ background: '#0f3441', color: 'white' }}>
          <h2>Ready to deploy your own real-estate AI assistant?</h2>
          <p>Spin up your tenant and embed the widget in one afternoon.</p>
          <Link className="btn btn-accent" href="/login">
            Launch Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
