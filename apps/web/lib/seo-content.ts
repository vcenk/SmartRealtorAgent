import 'server-only';
/**
 * Server-side SEO content utilities.
 * Reads markdown and JSON-LD files from content/seo directory.
 * For use in Next.js App Router server components only.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Internal files that should never be exposed publicly
const INTERNAL_FILES = new Set([
  'INTERNAL_LINK_MAP.md',
  'blog-strategy.md',
  'homepage_strategy.md',
  'hompage_strategy.md',
]);

export type SeoFrontmatter = {
  slug?: string;
  pageType?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
};

export type SeoDoc = {
  meta: SeoFrontmatter;
  content: string;
  filePath: string;
};

// Determine SEO directory based on cwd
function getSeoDir(): string {
  const cwd = process.cwd();
  // If running from monorepo root
  if (fs.existsSync(path.join(cwd, 'apps', 'web', 'content', 'seo'))) {
    return path.join(cwd, 'apps', 'web', 'content', 'seo');
  }
  // If running from apps/web
  return path.join(cwd, 'content', 'seo');
}

const SEO_DIR = getSeoDir();

/**
 * Check if a file is internal and should not be exposed
 */
function isInternalFile(filename: string): boolean {
  return INTERNAL_FILES.has(path.basename(filename));
}

/**
 * Reads a markdown file from the SEO content directory.
 * @param relPath - Relative path from content/seo (e.g., 'pricing.md')
 * @returns Parsed frontmatter and content
 * @throws if file not found or is internal
 */
export function readSeoMarkdown(relPath: string): SeoDoc {
  if (isInternalFile(relPath)) {
    throw new Error(`Access denied: ${relPath} is an internal file`);
  }

  const filePath = path.join(SEO_DIR, relPath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${relPath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return { meta: data as SeoFrontmatter, content, filePath };
}

/**
 * Safely reads a markdown file, returning null if not found.
 */
export function readSeoMarkdownSafe(relPath: string): SeoDoc | null {
  try {
    return readSeoMarkdown(relPath);
  } catch {
    return null;
  }
}

/**
 * Reads a JSON-LD schema file from content/seo/schema.
 * @param relPath - Relative path from content/seo/schema (e.g., 'homepage.jsonld.md')
 * @returns Parsed JSON object
 */
export function readSeoJsonLd(relPath: string): Record<string, unknown> | null {
  const filePath = path.join(SEO_DIR, 'schema', relPath);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, 'utf8').trim();
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Lists markdown files in a subdirectory (non-recursive by default).
 * @param subDir - Subdirectory relative to content/seo
 * @returns Array of filenames excluding internal files
 */
export function listSeoFiles(subDir = ''): string[] {
  const dir = path.join(SEO_DIR, subDir);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md') && !isInternalFile(e.name))
    .map((e) => e.name);
}

/**
 * Gets all blog post slugs for static generation.
 * @returns Array of slug strings (filename without .md extension)
 */
export function getBlogSlugs(): string[] {
  const files = listSeoFiles('blog');
  return files.map((file) => file.replace(/\.md$/, ''));
}

/**
 * Reads a blog post by slug.
 * @param slug - Blog post slug (filename without .md)
 */
export function readBlogPost(slug: string): SeoDoc | null {
  return readSeoMarkdownSafe(`blog/${slug}.md`);
}
