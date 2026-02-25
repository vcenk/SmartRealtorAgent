import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import type { Metadata } from 'next';
import { readSeoJsonLd, readSeoMarkdownSafe } from '@/lib/seo-content';
import agentsLogo from '@/content/asset/agents.png';
import ChatDemo from '@/components/ChatDemo';
import Reveal from '@/components/Reveal';

const navItems = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
];

const partners = ['Zillow', 'Realtor.com', 'HubSpot', 'Follow Up Boss', 'Salesforce'];
const marqueePartners = [...partners, ...partners, ...partners];

const steps = [
  {
    title: 'Connect your data',
    description:
      'Upload listing documents, neighborhood guides, and FAQs so the assistant can answer with your source of truth.',
  },
  {
    title: 'Customize behavior',
    description:
      'Set qualification flows, brand tone, and escalation rules to keep every response compliant and useful.',
  },
  {
    title: 'Go live in minutes',
    description:
      'Embed one script and start converting web traffic into qualified buyer and seller leads around the clock.',
  },
];

const features = [
  {
    title: 'Citation-backed answers',
    description: 'Every factual response references your own documents to reduce hallucinations and build trust.',
    icon: '📚',
  },
  {
    title: 'Lead qualification flows',
    description: 'Capture budget, timeline, location, and motivation before your team ever picks up the conversation.',
    icon: '🎯',
  },
  {
    title: 'Multi-tenant control',
    description: 'Isolate each office or team with secure tenant boundaries and clear access controls.',
    icon: '🏢',
  },
  {
    title: 'Analytics and insights',
    description: 'Track questions, handoff points, and conversion trends to optimize your web funnel.',
    icon: '📈',
  },
];

const pricing = [
  {
    plan: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Build and test your AI agent in the dashboard — upgrade to go live.',
    cta: 'Start free',
    href: '/signup',
    highlights: [
      '1 agent — dashboard testing only',
      'Knowledge base upload',
      'Test chat in dashboard',
      'Email support',
    ],
  },
  {
    plan: 'Growth',
    price: '$49',
    period: '/month',
    description: 'Publish widgets on your websites with full lead capture.',
    cta: 'Start trial',
    href: '/signup',
    featured: true,
    highlights: [
      'Up to 10 published widgets',
      'Advanced lead qualification',
      'Citation enforcement',
      'Priority support',
    ],
  },
  {
    plan: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For brokerages needing custom workflows and controls.',
    cta: 'Talk to sales',
    href: '/contact',
    highlights: [
      'Unlimited published widgets',
      'Custom integrations',
      'Compliance controls',
      'Dedicated success manager',
    ],
  },
];

const faqs = [
  {
    q: 'How fast can we launch?',
    a: 'Most teams go live in under a day: upload content, configure qualification prompts, and paste the embed script.',
  },
  {
    q: 'Can this work across multiple agents or offices?',
    a: 'Yes. Smart Realtor Agent supports tenant-isolated deployments so each team can run independent data and workflows.',
  },
  {
    q: 'Will the assistant make up answers?',
    a: 'It is designed to prioritize source-grounded replies. When data is missing, it can ask follow-up questions or escalate.',
  },
  {
    q: 'Do you integrate with CRMs?',
    a: 'Yes. You can connect lead capture to your existing stack, and enterprise plans support custom integration flows.',
  },
];

const defaultTitle = 'Smart Realtor Agent - AI Chatbot for Real Estate Teams';
const defaultDescription =
  'Deploy an embeddable AI assistant for real estate websites with citation-backed responses and lead qualification.';

export async function generateMetadata(): Promise<Metadata> {
  const homepage = readSeoMarkdownSafe('homepage.md');
  const title = homepage?.meta.metaTitle || homepage?.meta.title || defaultTitle;
  const description = homepage?.meta.metaDescription || defaultDescription;
  const keywords =
    homepage?.meta.secondaryKeywords?.length
      ? homepage.meta.secondaryKeywords.join(', ')
      : 'real estate ai chatbot, real estate lead qualification, embeddable real estate assistant';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://smartrealtoragent.com',
      siteName: 'Smart Realtor Agent',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: 'https://smartrealtoragent.com/',
    },
  };
}

export default function MarketingPage() {
  const homepageSchema = readSeoJsonLd('homepage.jsonld.md');

  return (
    <div className="assistia-shell">
      {homepageSchema && (
        <Script
          id="jsonld-homepage"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
        />
      )}

      <header className="assistia-header">
        <div className="assistia-container">
          <nav className="assistia-nav" aria-label="Main navigation">
            <Link href="/" className="assistia-brand">
              <Image src={agentsLogo} alt="Smart Realtor Agent logo" width={28} height={28} className="assistia-brand-logo" />
              Smart Realtor Agent
            </Link>
            <ul className="assistia-nav-links">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className="assistia-nav-cta">
              <Link href="/login" className="assistia-btn assistia-btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="assistia-btn assistia-btn-solid">
                Get started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="assistia-hero">
          <div className="assistia-container">
            <div className="assistia-hero-grid">
              <div className="assistia-hero-main">
                <p className="assistia-kicker">AI assistant for real estate websites</p>
                <h1>Turn every listing visitor into a qualified lead</h1>
                <p className="assistia-hero-copy">
                  Smart Realtor Agent gives clients instant answers, qualifies opportunities, and routes high-intent leads
                  to your team without increasing headcount.
                </p>
                <div className="assistia-hero-cta">
                  <Link href="/signup" className="assistia-btn assistia-btn-solid">
                    Start free
                  </Link>
                  <Link href="/demo" className="assistia-btn assistia-btn-outline">
                    Watch demo
                  </Link>
                </div>
              </div>
              <ChatDemo />
            </div>
          </div>
        </section>

        <Reveal className="assistia-trust">
          <div className="assistia-container">
            <p>Trusted by growth-focused real estate teams</p>
            <div className="assistia-logos-marquee">
              <div className="assistia-logos-track">
                {marqueePartners.map((partner, index) => (
                  <span key={`${partner}-${index}`}>{partner}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <section id="how-it-works" className="assistia-section">
          <div className="assistia-container">
            <Reveal className="assistia-section-head">
              <h2>How it works</h2>
              <p>Launch a branded assistant in three steps.</p>
            </Reveal>
            <div className="assistia-steps">
              {steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 200}>
                  <article className="assistia-card">
                    <span className="assistia-step-index">0{index + 1}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="assistia-section assistia-section-soft">
          <div className="assistia-container">
            <Reveal className="assistia-section-head">
              <h2>Core capabilities</h2>
              <p>Built for real estate teams that care about speed, trust, and conversion.</p>
            </Reveal>
            <div className="assistia-feature-grid">
              {features.map((feature, index) => (
                <Reveal key={feature.title} delay={index * 150}>
                  <article className="assistia-card assistia-feature-card">
                    <div className="assistia-feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="assistia-section">
          <div className="assistia-container">
            <Reveal className="assistia-section-head">
              <h2>Pricing</h2>
              <p>Simple plans for solo agents through enterprise brokerages.</p>
            </Reveal>
            <div className="assistia-pricing-grid">
              {pricing.map((item, index) => (
                <Reveal key={item.plan} delay={index * 150} className="assistia-pricing-reveal">
                  <article
                    className={`assistia-pricing-card${item.featured ? ' assistia-pricing-featured' : ''}`}
                  >
                    {item.featured && <span className="assistia-pricing-badge">Most Popular</span>}
                    <div className="assistia-pricing-content">
                      <h3>{item.plan}</h3>
                      <p className="assistia-price">
                        {item.price}
                        {item.period && <span>{item.period}</span>}
                      </p>
                      <p className="assistia-pricing-desc">{item.description}</p>
                      <ul className="assistia-pricing-features">
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>
                            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={item.href}
                        className={`assistia-btn ${item.featured ? 'assistia-btn-solid' : 'assistia-btn-outline'}`}
                      >
                        {item.cta}
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="assistia-cta">
          <div className="assistia-container">
            <div>
              <h2>Deploy your real estate AI assistant this week</h2>
              <p>
                Stop losing inbound visitors after business hours. Capture and qualify demand continuously with one
                embed.
              </p>
            </div>
            <Link href="/signup" className="assistia-btn assistia-btn-solid">
              Get started
            </Link>
          </div>
        </section>

        <Reveal id="faq" className="assistia-section">
          <div className="assistia-container">
            <div className="assistia-section-head">
              <h2>Frequently asked questions</h2>
            </div>
            <div className="assistia-faq">
              {faqs.map((faq) => (
                <details key={faq.q} className="assistia-card">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </main>

      <footer className="assistia-footer">
        <div className="assistia-container">
          <p className="assistia-footer-brand">
            <Image src={agentsLogo} alt="Smart Realtor Agent logo" width={20} height={20} className="assistia-brand-logo" />
            2026 Smart Realtor Agent. All rights reserved.
          </p>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </div>
      </footer>

      <style>{`
        .assistia-shell {
          color: #12284b;
          background:
            radial-gradient(circle at 90% -10%, rgba(55, 154, 255, 0.22), transparent 36%),
            radial-gradient(circle at 10% 10%, rgba(28, 210, 188, 0.2), transparent 28%),
            #f4f8ff;
        }
        .assistia-container {
          width: min(1120px, calc(100vw - 48px));
          margin: 0 auto;
        }
        .assistia-header {
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(18, 40, 75, 0.08);
          background: rgba(244, 248, 255, 0.76);
        }
        .assistia-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 74px;
          gap: 16px;
        }
        .assistia-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          text-decoration: none;
          color: inherit;
        }
        .assistia-brand-logo {
          border-radius: 8px;
          object-fit: cover;
        }
        .assistia-nav-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 20px;
        }
        .assistia-nav-links a {
          text-decoration: none;
          color: #35527e;
          font-weight: 500;
        }
        .assistia-nav-cta {
          display: flex;
          gap: 10px;
        }
        .assistia-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 11px 18px;
          border: 1px solid transparent;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .assistia-btn:hover {
          transform: translateY(-1px);
        }
        .assistia-btn-solid {
          background: linear-gradient(135deg, #0f7cff, #1bc3ad);
          color: #ffffff;
          box-shadow: 0 14px 28px rgba(15, 124, 255, 0.22);
        }
        .assistia-btn-ghost {
          background: transparent;
          color: #35527e;
        }
        .assistia-btn-outline {
          border-color: rgba(18, 40, 75, 0.2);
          color: #12284b;
          background: #ffffff;
        }
        .assistia-hero {
          padding: 92px 0 64px;
        }
        .assistia-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
          gap: 24px;
          align-items: center;
        }
        .assistia-kicker {
          display: inline-block;
          margin-bottom: 14px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(15, 124, 255, 0.12);
          color: #1759a6;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .assistia-hero h1 {
          margin: 0;
          max-width: 900px;
          font-size: clamp(2rem, 4.8vw, 4rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }
        .assistia-hero-copy {
          margin: 22px 0 0;
          max-width: 690px;
          color: #3b5988;
          font-size: clamp(1rem, 2vw, 1.24rem);
          line-height: 1.65;
        }
        .assistia-hero-cta {
          margin-top: 28px;
          display: flex;
          gap: 12px;
        }
        .assistia-hero-main .assistia-kicker {
          animation: heroRise 0.6s ease-out both, heroFloat 4.5s ease-in-out infinite;
        }
        .assistia-hero-main h1 {
          animation: heroRise 0.8s ease-out both;
        }
        .assistia-hero-main .assistia-hero-copy {
          animation: heroRise 1s ease-out both;
        }
        .assistia-hero-main .assistia-hero-cta {
          animation: heroRise 1.2s ease-out both;
        }
        .assistia-chat-demo {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 18px 38px rgba(18, 40, 75, 0.12);
          background: linear-gradient(135deg, #0f172a, #1e3a8a);
          color: #f1f5f9;
          animation: chatFloat 4s ease-in-out infinite, chatGlow 5.5s ease-in-out infinite;
        }
        .assistia-chat-container {
          min-height: 430px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(8px);
        }
        .assistia-chat-header {
          min-height: 52px;
          padding: 0 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.25);
        }
        .assistia-chat-header h3 {
          margin: 0;
          font-size: 1rem;
          letter-spacing: 0.01em;
          color: #f8fafc;
        }
        .assistia-chat-header button {
          border: 0;
          background: transparent;
          color: #e2e8f0;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          animation: controlPulse 2.4s ease-in-out infinite;
        }
        .assistia-chat-box {
          flex: 1;
          padding: 12px;
          overflow: hidden;
          display: grid;
          gap: 10px;
          align-content: start;
        }
        .assistia-message {
          max-width: 92%;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 0.92rem;
          line-height: 1.45;
          animation: chatFadeIn 0.45s ease-out both;
        }
        .assistia-message-ai {
          justify-self: start;
          background: rgba(56, 189, 248, 0.24);
          border: 1px solid rgba(125, 211, 252, 0.35);
          color: #e0f2fe;
          animation: chatFadeIn 0.45s ease-out both, messageBob 3.8s ease-in-out infinite;
        }
        .assistia-message-user {
          justify-self: end;
          background: rgba(16, 185, 129, 0.25);
          border: 1px solid rgba(110, 231, 183, 0.32);
          color: #ecfdf5;
          animation: chatFadeIn 0.45s ease-out 0.2s both, messageBob 3.8s ease-in-out 0.7s infinite;
        }
        .assistia-typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 20px;
        }
        .assistia-typing-dots span {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          opacity: 0.4;
          animation: assistia-dot-blink 1.4s infinite both;
        }
        .assistia-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .assistia-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes assistia-dot-blink {
          0%, 80%, 100% { opacity: 0.4; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }

        .assistia-typing-cursor {
          display: inline-block;
          margin-left: 2px;
          animation: assistia-cursor-blink 1s step-end infinite;
        }

        @keyframes assistia-cursor-blink {
          from, to { opacity: 1; }
          50% { opacity: 0; }
        }
        .assistia-input-area {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.2);
        }
        .assistia-input-area input {
          flex: 1;
          border: 0;
          border-radius: 8px;
          padding: 10px;
          font-size: 0.9rem;
          background: rgba(241, 245, 249, 0.95);
          color: #0f172a;
          animation: inputBreathe 2.8s ease-in-out infinite;
        }
        .assistia-input-area button {
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 8px;
          padding: 10px 14px;
          color: #ffffff;
          font-weight: 600;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          animation: sendPulse 2.6s ease-in-out infinite;
        }
        .assistia-input-area button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.3) 50%, transparent 80%);
          transform: translateX(-120%);
          animation: sendShine 2.6s ease-in-out infinite;
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroRise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes chatFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes chatGlow {
          0%, 100% { box-shadow: 0 18px 38px rgba(18, 40, 75, 0.12); }
          50% { box-shadow: 0 22px 46px rgba(56, 189, 248, 0.22); }
        }
        @keyframes controlPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes messageBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes inputBreathe {
          0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12); }
        }
        @keyframes sendPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes sendShine {
          0%, 20% { transform: translateX(-120%); }
          60%, 100% { transform: translateX(120%); }
        }
        .assistia-trust {
          padding: 24px 0 14px;
          text-align: center;
        }
        .assistia-trust p {
          margin: 0 0 12px;
          color: #4e6a93;
          font-size: 0.95rem;
          text-align: center;
        }
        .assistia-logos-marquee {
          overflow: hidden;
          max-width: 860px;
          margin: 0 auto;
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .assistia-logos-track {
          width: max-content;
          display: flex;
          gap: 10px;
          animation: slideLogos 30s linear infinite;
        }
        .assistia-logos-track:hover {
          animation-play-state: paused;
        }
        .assistia-logos-track span {
          border: 1px solid rgba(18, 40, 75, 0.12);
          background: rgba(255, 255, 255, 0.72);
          color: #35527e;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 0.9rem;
        }
        @keyframes slideLogos {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% / 3)); }
        }
        .assistia-section {
          padding: 72px 0;
        }
        .assistia-section-soft {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0));
        }
        .assistia-section-head h2 {
          margin: 0;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          letter-spacing: -0.02em;
        }
        .assistia-section-head p {
          margin: 12px 0 0;
          color: #4c6893;
        }
        .assistia-steps,
        .assistia-pricing-grid {
          margin-top: 28px;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .assistia-feature-grid {
          margin-top: 28px;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .assistia-steps .reveal {
          position: relative;
          height: 100%;
        }
        @media (min-width: 961px) {
          .assistia-steps .reveal:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 50px;
            right: -24px;
            width: 24px;
            height: 2px;
            background: linear-gradient(90deg, #1bc3ad, #0f7cff);
            opacity: 0;
            transform: scaleX(0);
            transform-origin: left;
            transition: opacity 0.8s ease, transform 0.8s ease;
            transition-delay: 0.6s;
            z-index: 1;
          }
          .assistia-steps .reveal.visible:not(:last-child)::after {
            opacity: 0.6;
            transform: scaleX(1);
          }
        }
        @media (max-width: 960px) {
          .assistia-steps,
          .assistia-pricing-grid,
          .assistia-feature-grid {
            grid-template-columns: 1fr;
          }
          .assistia-steps .reveal:not(:last-child)::after {
            content: '';
            position: absolute;
            bottom: -24px;
            left: 50px;
            width: 2px;
            height: 24px;
            background: linear-gradient(180deg, #1bc3ad, #0f7cff);
            opacity: 0;
            transform: scaleY(0);
            transform-origin: top;
            transition: opacity 0.8s ease, transform 0.8s ease;
            transition-delay: 0.6s;
            z-index: 1;
          }
          .assistia-steps .reveal.visible:not(:last-child)::after {
            opacity: 0.6;
            transform: scaleY(1);
          }
        }
        .assistia-feature-card {
          padding: 40px;
        }
        .assistia-feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: rgba(15, 124, 255, 0.05);
          font-size: 1.5rem;
          margin-bottom: 24px;
          border: 1px solid rgba(15, 124, 255, 0.1);
          transition: transform 0.3s ease;
        }
        .assistia-card:hover .assistia-feature-icon {
          transform: scale(1.1) rotate(5deg);
          background: rgba(15, 124, 255, 0.1);
        }
        .assistia-card {
          position: relative;
          border: 1px solid rgba(18, 40, 75, 0.08);
          background: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          padding: 32px;
          height: 100%;
          box-shadow: 0 4px 12px rgba(18, 40, 75, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .assistia-card:hover {
          transform: translateY(-8px);
          background: #ffffff;
          box-shadow: 0 24px 48px rgba(18, 40, 75, 0.08);
          border-color: rgba(15, 124, 255, 0.2);
        }
        .assistia-card h3 {
          margin: 0 0 12px;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .assistia-card p {
          margin: 0;
          color: #44608c;
          line-height: 1.62;
          font-size: 0.96rem;
        }
        .assistia-step-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #0f7cff, #1bc3ad);
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(15, 124, 255, 0.25);
        }
        .assistia-pricing-card {
          position: relative;
          border: 1px solid rgba(18, 40, 75, 0.08);
          background: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          padding: 32px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(18, 40, 75, 0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .assistia-pricing-card:hover {
          transform: translateY(-8px);
          background: #ffffff;
          box-shadow: 0 24px 48px rgba(18, 40, 75, 0.08);
        }
        .assistia-pricing-featured {
          border-color: #0f7cff;
          background: #ffffff;
          box-shadow: 0 20px 40px rgba(15, 124, 255, 0.12);
        }
        .assistia-pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #0f7cff, #1bc3ad);
          color: #ffffff;
          padding: 4px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 12px rgba(15, 124, 255, 0.2);
        }
        .assistia-pricing-card .assistia-price {
          margin: 16px 0 8px;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #12284b;
        }
        .assistia-pricing-card .assistia-price span {
          margin-left: 4px;
          font-size: 1rem;
          color: #55709a;
          font-weight: 500;
          letter-spacing: 0;
        }
        .assistia-pricing-desc {
          font-size: 0.94rem;
          color: #4f6a92;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .assistia-pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .assistia-pricing-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.92rem;
          color: #35527e;
          line-height: 1.4;
        }
        .assistia-pricing-features svg {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          color: #1bc3ad;
          margin-top: 1px;
        }
        .assistia-pricing-card .assistia-btn {
          width: 100%;
        }
        .assistia-cta {
          padding: 28px 0 68px;
        }
        .assistia-cta .assistia-container {
          border: 1px solid rgba(18, 40, 75, 0.12);
          border-radius: 22px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: linear-gradient(135deg, #113267, #0f7cff);
          color: #ffffff;
        }
        .assistia-cta h2 {
          margin: 0 0 10px;
          font-size: clamp(1.4rem, 3vw, 2rem);
        }
        .assistia-cta p {
          margin: 0;
          max-width: 720px;
          color: rgba(255, 255, 255, 0.88);
        }
        .assistia-faq {
          margin-top: 22px;
          display: grid;
          gap: 12px;
        }
        .assistia-faq summary {
          cursor: pointer;
          font-weight: 600;
        }
        .assistia-faq p {
          margin-top: 10px;
        }
        .assistia-footer {
          border-top: 1px solid rgba(18, 40, 75, 0.1);
          background: rgba(255, 255, 255, 0.58);
        }
        .assistia-footer .assistia-container {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .assistia-footer p {
          margin: 0;
          color: #4f6a92;
        }
        .assistia-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .assistia-footer div {
          display: flex;
          gap: 14px;
        }
        .assistia-footer a {
          text-decoration: none;
          color: #2d4f84;
        }
        @media (max-width: 960px) {
          .assistia-nav-links {
            display: none;
          }
          .assistia-hero-grid {
            grid-template-columns: 1fr;
          }
          .assistia-steps,
          .assistia-pricing-grid,
          .assistia-feature-grid {
            grid-template-columns: 1fr;
          }
          .assistia-cta .assistia-container {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        @media (max-width: 640px) {
          .assistia-container {
            width: min(1120px, calc(100vw - 28px));
          }
          .assistia-nav {
            min-height: 66px;
          }
          .assistia-nav-cta {
            gap: 8px;
          }
          .assistia-btn {
            padding: 10px 14px;
            font-size: 0.9rem;
          }
          .assistia-hero {
            padding-top: 72px;
          }
          .assistia-hero-cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

