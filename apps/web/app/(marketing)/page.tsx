import Link from 'next/link';

/* ──────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────── */
const features = [
  {
    icon: '📚',
    title: 'Citation-Backed Answers',
    desc: 'Every factual response cites your knowledge base — no hallucinated facts, ever.',
  },
  {
    icon: '🎯',
    title: 'Lead Qualification',
    desc: 'Buyer and seller intent is detected automatically, with timeline and budget captured.',
  },
  {
    icon: '🏢',
    title: 'Multi-Tenant Dashboard',
    desc: 'Supabase row-level security keeps every agency's data fully isolated.',
  },
  {
    icon: '🔌',
    title: 'Embeddable Widget',
    desc: 'One script tag — embed the chat on any website in under 5 minutes.',
  },
  {
    icon: '⚙️',
    title: 'Deterministic Orchestration',
    desc: 'Auditable skill calls with a policy engine that never goes off-script.',
  },
  {
    icon: '🛡️',
    title: 'Policy Guardrails',
    desc: 'Prevent off-topic responses, enforce disclosure rules, and cap token spend.',
  },
];

const stats = [
  { num: '3 min', label: 'Avg. widget setup time' },
  { num: '100%', label: 'Citation-enforced responses' },
  { num: '0', label: 'Cross-tenant data leaks' },
  { num: '3×', label: 'Higher lead quality score' },
];

const steps = [
  {
    num: '01',
    title: 'Connect',
    desc: 'Set up your tenant, configure auth, and paste one script tag on your agency site.',
  },
  {
    num: '02',
    title: 'Upload',
    desc: 'Ingest listing guides, neighborhood pages, FAQs, and any property PDFs.',
  },
  {
    num: '03',
    title: 'Convert',
    desc: 'The bot answers with citations and routes qualified leads straight to your dashboard.',
  },
];

const testimonials = [
  {
    quote:
      'Our website chat finally gives trustworthy answers with real citations. Buyers trust the bot because it shows exactly where the info comes from.',
    name: 'Sarah M.',
    role: 'Principal Agent · Coastal Homes Team',
    initials: 'SM',
  },
  {
    quote:
      'Lead quality is dramatically higher because the bot qualifies timeline and budget before the handoff. Our closers love it.',
    name: 'James R.',
    role: 'Broker · Northline Realty',
    initials: 'JR',
  },
  {
    quote:
      'Setup took less than an afternoon. We embedded it on three listing pages and saw leads come in the same day.',
    name: 'Priya K.',
    role: 'Marketing Director · Emerald Properties',
    initials: 'PK',
  },
];

const pricingPlans = [
  {
    tier: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'Perfect for independent agents launching their first AI chatbot.',
    features: [
      '1 tenant / 1 widget',
      'Knowledge base ingestion',
      'Lead capture dashboard',
      'Citation-backed responses',
      'Email support',
    ],
    featured: false,
    cta: 'Start Free Trial',
    ctaHref: '/login',
  },
  {
    tier: 'Growth',
    price: '$149',
    period: '/month',
    desc: 'Designed for broker teams scaling across multiple listings and agents.',
    features: [
      'Up to 10 tenants',
      'Multi-agent dashboard',
      'Audit logs & policy config',
      'Priority knowledge updates',
      'Slack & email support',
    ],
    featured: true,
    badge: 'Most Popular',
    cta: 'Get Growth',
    ctaHref: '/login',
  },
  {
    tier: 'Broker Pro',
    price: 'Custom',
    period: '',
    desc: 'Enterprise-grade controls for large brokerages and franchise networks.',
    features: [
      'Unlimited tenants',
      'MLS & CRM integration stubs',
      'Advanced policy guardrails',
      'SLA & dedicated support',
      'Custom onboarding',
    ],
    featured: false,
    cta: 'Talk to Sales',
    ctaHref: '/login',
  },
];

const faqs = [
  {
    q: 'Can I run multiple agents under one account?',
    a: 'Yes. Each tenant can isolate agents, knowledge bases, and policies with strict Supabase row-level security — there is no cross-tenant data access.',
  },
  {
    q: 'Does the chatbot cite its sources?',
    a: 'Yes. The policy engine enforces citations on every factual response. If the answer isn't in your KB, the bot says so rather than making something up.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most agents are live within an afternoon — create a tenant, upload KB documents, and paste the widget script tag on your site.',
  },
  {
    q: 'Do you support MLS or CRM sync?',
    a: 'Not in v1. We ship with integration stubs for MLS, CRM, and SMS — full connections are on the roadmap.',
  },
  {
    q: 'What happens when the bot doesn't know the answer?',
    a: 'The policy engine detects low-confidence retrieval and redirects the visitor to contact you directly — it never fabricates a response.',
  },
];

/* ──────────────────────────────────────────────────────────
   Components
   ────────────────────────────────────────────────────────── */

function StarRow() {
  return (
    <div className="testimonial-stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </div>
  );
}

function CheckIcon() {
  return <span className="check">✓</span>;
}

/* ──────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────── */
export default function MarketingPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      {/* ── Navigation ───────────────────────────────────── */}
      <header className="nav">
        <div className="container">
          <nav className="nav-inner">
            {/* Logo */}
            <div className="nav-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#lg)" />
                <path d="M8 20V12l6-5 6 5v8h-4v-5h-4v5H8Z" fill="white" fillOpacity="0.9" />
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c3aed" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              SmartRealtor
              <span className="gradient-text">AI</span>
            </div>

            {/* Links */}
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>

            {/* CTAs */}
            <div className="nav-ctas">
              <Link href="/login" className="btn btn-outline" style={{ fontSize: '0.88rem', padding: '0.55rem 1.2rem' }}>
                Sign In
              </Link>
              <Link href="/login" className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.55rem 1.2rem' }}>
                Get Started →
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="badge fade-up">
              ✦ AI-Powered Real Estate Assistant
            </div>
            <h1 className="fade-up delay-1">
              Real estate chat that{' '}
              <span className="gradient-text">cites sources</span>{' '}
              and captures leads.
            </h1>
            <p className="hero-sub fade-up delay-2">
              Launch a tenant-safe RAG assistant for your agency site in minutes.
              SmartRealtorAI answers listing and market questions from your knowledge
              base, never invents facts, and routes qualified buyer/seller leads to
              your dashboard.
            </p>
            <div className="hero-ctas fade-up delay-3">
              <Link href="/login" className="btn btn-primary">
                Start Free Trial →
              </Link>
              <a href="#pricing" className="btn btn-outline">
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────── */}
      <div className="trust-bar">
        <div className="container">
          <p>Trusted by real estate teams across the country</p>
          <div className="trust-logos">
            {['Coastal Homes', 'Northline Realty', 'Emerald Properties', 'Summit Brokers', 'Pacific Agents'].map(
              (name) => (
                <span key={name} className="trust-logo">{name}</span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <p className="section-label">Features</p>
            <h2 className="section-title">
              Everything your agency needs{' '}
              <span className="gradient-text">in one platform</span>
            </h2>
            <p className="section-body">
              From citation-enforced answers to automatic lead qualification — every
              capability is built for real estate workflows.
            </p>
          </div>

          <div className="grid grid-3" style={{ gap: '1.25rem' }}>
            {features.map((f) => (
              <article className="card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="stats-section">
        <div className="container" style={{ padding: 0 }}>
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div className="section-head">
            <p className="section-label">How It Works</p>
            <h2 className="section-title">
              Live in three{' '}
              <span className="gradient-text">simple steps</span>
            </h2>
            <p className="section-body">
              No engineering team required. Set up your tenant, upload your content,
              and your AI assistant is ready to convert visitors.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((s) => (
              <div className="step-card" key={s.num}>
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-alt)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head">
            <p className="section-label">Testimonials</p>
            <h2 className="section-title">
              Loved by agents{' '}
              <span className="gradient-text">who close deals</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <StarRow />
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.initials}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="section">
        <div className="container">
          <div className="section-head">
            <p className="section-label">Pricing</p>
            <h2 className="section-title">
              Plans for every{' '}
              <span className="gradient-text">stage of growth</span>
            </h2>
            <p className="section-body">
              Start free, upgrade when you're ready. No hidden fees, cancel any time.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article className={`pricing-card${plan.featured ? ' featured' : ''}`} key={plan.tier}>
                {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
                <div className="pricing-tier">{plan.tier}</div>
                <div className="pricing-price">{plan.price}</div>
                {plan.period && <div className="pricing-period">{plan.period}</div>}
                <p className="pricing-desc">{plan.desc}</p>
                <hr className="pricing-divider" />
                <ul className="pricing-features">
                  {plan.features.map((feat) => (
                    <li key={feat}>
                      <CheckIcon />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="pricing-cta">
                  <Link
                    href={plan.ctaHref}
                    className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="section" style={{ background: 'var(--bg-alt)', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head">
            <p className="section-label">FAQ</p>
            <h2 className="section-title">
              Common <span className="gradient-text">questions</span>
            </h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <div className="faq-item" key={item.q}>
                <div className="faq-q">
                  {item.q}
                  <span style={{ color: 'var(--muted2)', fontSize: '1.1rem', flexShrink: 0 }}>+</span>
                </div>
                <p className="faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <h2>
              Ready to deploy your own{' '}
              <span className="gradient-text">real-estate AI assistant?</span>
            </h2>
            <p>
              Spin up your tenant, upload your knowledge base, and embed the widget — all in one afternoon.
            </p>
            <div className="hero-ctas">
              <Link href="/login" className="btn btn-primary">
                Launch Your Dashboard →
              </Link>
              <a href="#pricing" className="btn btn-outline">
                Compare Plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            {/* Brand */}
            <div className="footer-brand">
              <div className="nav-logo" style={{ fontSize: '1rem' }}>
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="8" fill="url(#lg2)" />
                  <path d="M8 20V12l6-5 6 5v8h-4v-5h-4v5H8Z" fill="white" fillOpacity="0.9" />
                  <defs>
                    <linearGradient id="lg2" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7c3aed" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                SmartRealtor<span className="gradient-text">AI</span>
              </div>
              <p>
                Multi-tenant RAG chatbot platform built for real estate agents who need
                accurate, citation-backed AI on their websites.
              </p>
            </div>

            {/* Links */}
            <div className="footer-links">
              <div className="footer-col">
                <div className="footer-col-title">Product</div>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Platform</div>
                <Link href="/login">Dashboard</Link>
                <Link href="/login">Sign In</Link>
                <Link href="/login">Get Started</Link>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Legal</div>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <span>© 2026 SmartRealtorAI. All rights reserved.</span>
            <span style={{ color: 'var(--muted2)' }}>Built with ❤ for real estate professionals</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
