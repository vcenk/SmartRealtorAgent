import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogSlugs, readBlogPost } from '@/lib/seo-content';
import agentsLogo from '@/content/asset/agents.png';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate static paths for all blog posts.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata from blog post frontmatter.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = 'https://smartrealtoragent.com';
  const { slug } = await params;
  const post = readBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const { meta } = post;

  return {
    title: meta.metaTitle || meta.title || 'Smart Realtor Agent Blog',
    description: meta.metaDescription,
    keywords: meta.secondaryKeywords?.join(', '),
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
    openGraph: {
      title: meta.metaTitle || meta.title,
      description: meta.metaDescription,
      type: 'article',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      authors: meta.author ? [meta.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.metaTitle || meta.title,
      description: meta.metaDescription,
    },
  };
}

/**
 * Blog post page component.
 */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = readBlogPost(slug);

  if (!post) {
    notFound();
  }

  const { meta, content } = post;
  const hasMarkdownH1 = /^#\s+/m.test(content);

  return (
    <main className="seo-page blog-page">
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

      {/* Blog Post Content */}
      <article className="seo-content section">
        <div className="container">
          <div className="seo-content-inner blog-post">
            {/* Breadcrumb */}
            <nav className="blog-breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <Link href="/blog">Blog</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">{meta.title}</span>
            </nav>

            {/* Post Header */}
            <header className="blog-header">
              {meta.primaryKeyword && (
                <span className="blog-category">{meta.primaryKeyword}</span>
              )}
              {!hasMarkdownH1 && <h1 className="seo-page-title">{meta.title}</h1>}
              {meta.metaDescription && (
                <p className="blog-excerpt">{meta.metaDescription}</p>
              )}
              <div className="blog-meta">
                {meta.author && <span className="blog-author">By {meta.author}</span>}
                {meta.publishedAt && (
                  <time className="blog-date" dateTime={meta.publishedAt}>
                    {new Date(meta.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
              </div>
            </header>

            {/* Post Body */}
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>

            {/* Back to Blog */}
            <div className="blog-footer">
              <Link href="/blog" className="btn btn-outline">
                &larr; Back to Blog
              </Link>
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
