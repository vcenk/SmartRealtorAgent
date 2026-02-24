import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Script from 'next/script';
import { readSeoMarkdownSafe, readSeoJsonLd } from '@/lib/seo-content';

/**
 * Map URL slugs to markdown files.
 * This controls which pages are statically generated.
 */
const PAGE_MAP: Record<string, string> = {
  features: 'features.md',
  'how-it-works': 'how-it-works.md',
  pricing: 'pricing.md',
  faq: 'faq.md',
  security: 'security.md',
  'use-cases': 'use-cases.md',
  'vs-generic-ai-chatbot': 'vs-generic-ai-chatbot.md',
  'technical-architecture': 'technical-whitepaper.md',
};

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate static paths for all marketing pages.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return Object.keys(PAGE_MAP).map((slug) => ({ slug }));
}

/**
 * Generate metadata from frontmatter.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = 'https://smartrealtoragent.com';
  const { slug } = await params;
  const filename = PAGE_MAP[slug];

  if (!filename) {
    return { title: 'Not Found' };
  }

  const doc = readSeoMarkdownSafe(filename);

  if (!doc) {
    return { title: 'Not Found' };
  }

  const { meta } = doc;

  return {
    title: meta.metaTitle || meta.title || 'Smart Realtor Agent',
    description: meta.metaDescription,
    keywords: meta.secondaryKeywords?.join(', '),
    alternates: {
      canonical: `${baseUrl}/${slug}`,
    },
    openGraph: {
      title: meta.metaTitle || meta.title,
      description: meta.metaDescription,
      type: 'website',
    },
  };
}

/**
 * Marketing page component.
 */
export default async function MarketingSlugPage({ params }: Props) {
  const { slug } = await params;
  const filename = PAGE_MAP[slug];

  if (!filename) {
    notFound();
  }

  const doc = readSeoMarkdownSafe(filename);

  if (!doc) {
    notFound();
  }

  const { meta, content } = doc;

  const hasMarkdownH1 = /^#\s+/m.test(content);
  const jsonLd =
    slug === 'faq'
      ? readSeoJsonLd('faq.jsonld.md') || readSeoJsonLd('homepage-faq.jsonld.md')
      : null;

  return (
    <main className="seo-page">
      {/* JSON-LD Schema */}
      {jsonLd && (
        <Script
          id={`jsonld-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Navigation */}
      <header className="nav">
        <div className="container">
          <nav className="nav-inner">
            <Link href="/" className="nav-logo">
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
              Smart Realtor Agent
            </Link>

            <ul className="nav-links">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>

            <div className="nav-ctas">
              <Link href="/login" className="btn btn-outline" style={{ fontSize: '0.88rem', padding: '0.55rem 1.2rem' }}>
                Sign In
              </Link>
              <Link href="/login" className="btn btn-primary" style={{ fontSize: '0.88rem', padding: '0.55rem 1.2rem' }}>
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Content */}
      <article className="seo-content section">
        <div className="container">
          <div className="seo-content-inner">
            {!hasMarkdownH1 && meta.title && <h1 className="seo-page-title">{meta.title}</h1>}
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <span>&copy; 2026 Smart Realtor Agent. All rights reserved.</span>
            <Link href="/" style={{ color: 'var(--purple-light)' }}>Back to Home</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
