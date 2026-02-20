/**
 * lib/scraper.ts
 *
 * Shared website scraping utilities used by /api/knowledge/ingest and
 * /api/knowledge/crawl.
 *
 * Features:
 *  - Proper HTML parsing via node-html-parser (not regex tag stripping)
 *  - Boilerplate removal (nav, header, footer, sidebar, ads)
 *  - JSON-LD / schema.org extraction (prices, addresses, listing details)
 *  - Sitemap.xml discovery for crawl seeding
 *  - Robots.txt basic check
 *  - Multi-page crawl with depth + page limits
 */
import { parse as parseHtml, type HTMLElement } from 'node-html-parser';

/* ── Constants ────────────────────────────────────────────── */
const BOT_UA = 'SmartRealtorAI-Indexer/1.0 (compatible; +https://smartrealtoriai.com/bot)';
const FETCH_TIMEOUT_MS = 15_000;
const MAX_CRAWL_PAGES = 50;
const MAX_CONTENT_CHARS = 100_000;

/** Tags to remove entirely before text extraction. */
const NOISE_TAGS = [
  'script', 'style', 'noscript', 'iframe', 'svg', 'canvas',
  'nav', 'header', 'footer', 'aside',
  'form', 'button', 'select', 'input', 'textarea',
];

/** Class/id fragments that usually indicate boilerplate. */
const NOISE_SELECTORS = [
  '[class*="nav"]', '[class*="menu"]', '[class*="header"]', '[class*="footer"]',
  '[class*="sidebar"]', '[class*="cookie"]', '[class*="banner"]', '[class*="popup"]',
  '[class*="modal"]', '[class*="overlay"]', '[class*="ad-"]', '[class*="ads-"]',
  '[id*="nav"]', '[id*="menu"]', '[id*="header"]', '[id*="footer"]', '[id*="sidebar"]',
];

/* ── Types ────────────────────────────────────────────────── */
export type ScrapedPage = {
  url: string;
  title: string;
  text: string;                 // clean prose text
  structuredText: string;       // text + JSON-LD facts merged
  jsonLd: unknown[];            // raw schema.org objects
  links: string[];              // absolute internal links found on page
};

/* ── Helpers ──────────────────────────────────────────────── */
function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, {
    headers: { 'User-Agent': BOT_UA, Accept: 'text/html,application/xhtml+xml,*/*' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
}

/** Extract and remove all <script type="application/ld+json"> blocks. */
function extractJsonLd(root: HTMLElement): unknown[] {
  const results: unknown[] = [];
  root.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    try {
      const data = JSON.parse(el.text);
      results.push(...(Array.isArray(data) ? data : [data]));
    } catch { /* skip malformed */ }
    el.remove();
  });
  return results;
}

/**
 * Flatten a schema.org graph (JSON-LD) into readable key: value lines.
 * Handles @graph arrays, nested objects, and common real-estate types.
 */
function jsonLdToText(items: unknown[]): string {
  const lines: string[] = [];

  function flatten(obj: unknown, prefix = ''): void {
    if (!obj || typeof obj !== 'object') return;
    const o = obj as Record<string, unknown>;

    // Real estate listing fields we care most about
    const interestingKeys = [
      'name', 'description', 'price', 'priceCurrency', 'priceRange',
      'numberOfRooms', 'numberOfBedrooms', 'numberOfBathroomsTotal',
      'floorSize', 'address', 'streetAddress', 'addressLocality',
      'addressRegion', 'postalCode', 'geo', 'latitude', 'longitude',
      'url', 'telephone', 'openingHours', 'amenityFeature',
      'offers', 'itemListElement',
    ];

    for (const key of interestingKeys) {
      if (!(key in o)) continue;
      const val = o[key];
      if (typeof val === 'string' || typeof val === 'number') {
        lines.push(`${prefix}${key}: ${val}`);
      } else if (Array.isArray(val)) {
        val.forEach((v, i) => flatten(v, `${prefix}${key}[${i}].`));
      } else if (typeof val === 'object') {
        flatten(val, `${prefix}${key}.`);
      }
    }

    // Handle @graph arrays
    if (Array.isArray(o['@graph'])) {
      (o['@graph'] as unknown[]).forEach((item) => flatten(item, prefix));
    }
  }

  items.forEach((item) => flatten(item));
  return lines.join('\n');
}

/** Remove boilerplate tags + selectors from root (mutates root). */
function stripNoise(root: HTMLElement): void {
  NOISE_TAGS.forEach((tag) => root.querySelectorAll(tag).forEach((el) => el.remove()));
  NOISE_SELECTORS.forEach((sel) => {
    try { root.querySelectorAll(sel).forEach((el) => el.remove()); } catch { /* ignore */ }
  });
}

/** Convert an HTML element tree to clean readable text with structure hints. */
function toReadableText(root: HTMLElement): string {
  // Replace headings with newline + text so context is preserved
  ['h1', 'h2', 'h3', 'h4'].forEach((tag) => {
    root.querySelectorAll(tag).forEach((el) => {
      const text = el.text.trim();
      if (text) el.replaceWith(parseHtml(`\n\n## ${text}\n`));
    });
  });

  // Replace list items with bullet lines
  root.querySelectorAll('li').forEach((el) => {
    const text = el.text.trim();
    if (text) el.replaceWith(parseHtml(`\n• ${text}`));
  });

  // Add paragraph breaks
  root.querySelectorAll('p, div, br').forEach((el) => {
    const text = el.text.trim();
    if (text.length > 20) el.prepend(parseHtml('\n'));
  });

  return (root.text ?? '')
    .replace(/[ \t]{2,}/g, ' ')      // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')      // max 2 consecutive newlines
    .trim();
}

/** Collect all internal links from a page. */
function extractInternalLinks(root: HTMLElement, pageUrl: string): string[] {
  const origin = new URL(pageUrl).origin;
  const seen = new Set<string>();
  const links: string[] = [];

  root.querySelectorAll('a[href]').forEach((el) => {
    try {
      const href = el.getAttribute('href')!;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const abs = new URL(href, pageUrl).href;
      const clean = abs.split('#')[0]; // strip fragments
      if (new URL(clean).origin === origin && !seen.has(clean)) {
        seen.add(clean);
        links.push(clean);
      }
    } catch { /* ignore unparseable hrefs */ }
  });

  return links;
}

/* ── Core scrape function ─────────────────────────────────── */
export async function scrapePage(url: string): Promise<ScrapedPage> {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('html')) throw new Error(`Not HTML: ${contentType}`);

  const html = await res.text();
  const root = parseHtml(html, { blockTextElements: { script: false, style: false } });

  const title = root.querySelector('title')?.text?.trim()
    ?? root.querySelector('h1')?.text?.trim()
    ?? url;

  const jsonLd = extractJsonLd(root);         // extracts + removes ld+json tags
  const links = extractInternalLinks(root, url); // collect links before stripping
  stripNoise(root);

  const mainEl = root.querySelector('main, article, [role="main"]') ?? root;
  const text = toReadableText(mainEl).slice(0, MAX_CONTENT_CHARS);

  const ldText = jsonLdToText(jsonLd);
  const structuredText = ldText
    ? `${text}\n\n--- Structured Data ---\n${ldText}`.slice(0, MAX_CONTENT_CHARS)
    : text;

  return { url, title, text, structuredText, jsonLd, links };
}

/* ── Robots.txt check ─────────────────────────────────────── */
async function isAllowedByRobots(url: string): Promise<boolean> {
  try {
    const { origin } = new URL(url);
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { 'User-Agent': BOT_UA },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return true; // no robots.txt → allow

    const text = await res.text();
    let inOurBlock = false;
    const disallowed: string[] = [];

    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (/^user-agent:\s*\*/i.test(line) || /^user-agent:\s*SmartRealtorAI/i.test(line)) {
        inOurBlock = true;
      } else if (/^user-agent:/i.test(line)) {
        inOurBlock = false;
      } else if (inOurBlock && /^disallow:/i.test(line)) {
        const path = line.replace(/^disallow:\s*/i, '').trim();
        if (path) disallowed.push(path);
      }
    }

    const { pathname } = new URL(url);
    return !disallowed.some((d) => pathname.startsWith(d));
  } catch {
    return true; // on error, allow
  }
}

/* ── Sitemap.xml discovery ────────────────────────────────── */
export async function discoverSitemapUrls(siteUrl: string, limit = MAX_CRAWL_PAGES): Promise<string[]> {
  try {
    const { origin } = new URL(siteUrl);
    const res = await fetch(`${origin}/sitemap.xml`, {
      headers: { 'User-Agent': BOT_UA },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const root = parseHtml(xml);

    // Handle sitemap index (<sitemapindex>) vs regular sitemap (<urlset>)
    const sitemapLocs = root.querySelectorAll('sitemap > loc').map((el) => el.text.trim());
    let urls: string[] = [];

    if (sitemapLocs.length > 0) {
      // Sitemap index — fetch the first sub-sitemap (usually the most recent)
      for (const subLoc of sitemapLocs.slice(0, 3)) {
        try {
          const subRes = await fetch(subLoc, { headers: { 'User-Agent': BOT_UA }, signal: AbortSignal.timeout(10_000) });
          if (!subRes.ok) continue;
          const subXml = await subRes.text();
          const subRoot = parseHtml(subXml);
          urls.push(...subRoot.querySelectorAll('url > loc').map((el) => el.text.trim()));
          if (urls.length >= limit) break;
        } catch { /* skip broken sub-sitemaps */ }
      }
    } else {
      urls = root.querySelectorAll('url > loc').map((el) => el.text.trim());
    }

    return urls.slice(0, limit);
  } catch {
    return [];
  }
}

/* ── Multi-page crawler ───────────────────────────────────── */
export type CrawlOptions = {
  maxPages?: number;       // default 20, max MAX_CRAWL_PAGES
  useSitemap?: boolean;    // try sitemap.xml first (default true)
  allowedPathPrefix?: string; // only crawl URLs matching this prefix
};

export type CrawlResult = {
  pages: ScrapedPage[];
  skipped: number;
  errors: Array<{ url: string; reason: string }>;
};

export async function crawlSite(startUrl: string, opts: CrawlOptions = {}): Promise<CrawlResult> {
  const maxPages = Math.min(opts.maxPages ?? 20, MAX_CRAWL_PAGES);
  const useSitemap = opts.useSitemap !== false;
  const { origin } = new URL(startUrl);
  const allowedPrefix = opts.allowedPathPrefix
    ? `${origin}${opts.allowedPathPrefix}`
    : origin;

  const allowed = await isAllowedByRobots(startUrl);
  if (!allowed) {
    return { pages: [], skipped: 0, errors: [{ url: startUrl, reason: 'Blocked by robots.txt' }] };
  }

  // Seed queue from sitemap or starting URL
  let queue: string[] = [];
  if (useSitemap) {
    queue = await discoverSitemapUrls(startUrl, maxPages);
  }
  if (queue.length === 0) {
    queue = [startUrl];
  }

  const visited = new Set<string>();
  const pages: ScrapedPage[] = [];
  const errors: Array<{ url: string; reason: string }> = [];
  let skipped = 0;

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) { skipped++; continue; }
    if (!url.startsWith(allowedPrefix)) { skipped++; continue; }

    visited.add(url);

    // Skip obviously non-content URLs
    if (/\.(css|js|jpg|jpeg|png|gif|svg|pdf|zip|xml|json)(\?|$)/i.test(url)) {
      skipped++;
      continue;
    }

    try {
      const page = await scrapePage(url);

      // Skip pages with almost no text (login walls, redirects, etc.)
      if (page.text.length < 80) { skipped++; continue; }

      pages.push(page);

      // Enqueue new internal links (if we didn't use sitemap)
      if (!useSitemap || queue.length === 0) {
        for (const link of page.links) {
          if (!visited.has(link)) queue.push(link);
        }
      }
    } catch (err) {
      errors.push({ url, reason: err instanceof Error ? err.message : 'Unknown' });
    }

    // Small delay to be polite
    if (pages.length % 5 === 0) await new Promise((r) => setTimeout(r, 300));
  }

  return { pages, skipped, errors };
}
