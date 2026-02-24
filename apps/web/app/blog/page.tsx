import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogSlugs, readBlogPost } from '@/lib/seo-content';
import agentsLogo from '@/content/asset/agents.png';

export const metadata: Metadata = {
  title: 'Blog | Smart Realtor Agent - AI Chatbot for Real Estate',
  description: 'Learn about AI chatbots for real estate agents, lead generation strategies, and how to deploy embeddable AI assistants on your website.',
  alternates: {
    canonical: 'https://smartrealtoragent.com/blog',
  },
  openGraph: {
    title: 'Smart Realtor Agent Blog',
    description: 'Insights on AI chatbots for real estate professionals.',
    type: 'website',
  },
};

type BlogPostPreview = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword?: string;
  publishedAt?: string;
};

function getBlogPosts(): BlogPostPreview[] {
  const slugs = getBlogSlugs();

  const posts: BlogPostPreview[] = [];

  for (const slug of slugs) {
    const post = readBlogPost(slug);
    if (!post) continue;

    posts.push({
      slug,
      title: post.meta.title || slug,
      description: post.meta.metaDescription || '',
      primaryKeyword: post.meta.primaryKeyword,
      publishedAt: post.meta.publishedAt,
    });
  }

  // Sort by date descending if available
  posts.sort((a, b) => {
    if (a.publishedAt && b.publishedAt) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    return 0;
  });

  return posts;
}

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <main className="seo-page">
      {/* Navigation */}
      <header className="nav">
        <div className="container">
          <nav className="nav-inner">
            <Link href="/" className="nav-logo">
              <Image src={agentsLogo} alt="Smart Realtor Agent" width={28} height={28} style={{ borderRadius: 8 }} />
              Smart Realtor Agent
            </Link>

            <ul className="nav-links">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/blog">Blog</Link></li>
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

      {/* Blog Header */}
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="section-head">
            <p className="section-label">Blog</p>
            <h1 className="section-title">
              Insights for{' '}
              <span className="gradient-text">Real Estate Professionals</span>
            </h1>
            <p className="section-body">
              Learn how AI chatbots can transform your real estate website into a lead generation machine.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {posts.length === 0 ? (
            <div className="dash-empty-state">
              <p>No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                  <article>
                    {post.primaryKeyword && (
                      <span className="blog-card-category">{post.primaryKeyword}</span>
                    )}
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.description && (
                      <p className="blog-card-excerpt">{post.description}</p>
                    )}
                    <span className="blog-card-link">Read more &rarr;</span>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

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
