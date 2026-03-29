// ============================================================================
// VoiceDev 2.0 - Marketplace Search API Route
// Search across multiple sources: HuggingFace, npm, PyPI, Built-in, Smithery, ClawHub
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { BUILTIN_TOOLS, BUILTIN_SKILLS } from '@/lib/providers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MarketItem {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  stars: number;
  category: string;
  source: string;
  url: string;
  tags: string[];
}

interface MarketResponse {
  items: MarketItem[];
  total: number;
  source: string;
}

// ---------------------------------------------------------------------------
// Timeout helper
// ---------------------------------------------------------------------------

function withTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms),
    ),
  ]);
}

// ---------------------------------------------------------------------------
// HuggingFace search
// ---------------------------------------------------------------------------

async function searchHuggingFace(query: string): Promise<MarketResponse> {
  const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=20`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HuggingFace API error: ${res.status}`);

    const data = await res.json();
    const items: MarketItem[] = data.map((m: Record<string, unknown>) => ({
      id: m.id as string,
      name: m.id as string,
      description: (m.cardData?.description as string) || (m.pipeline_tag as string) || 'No description available',
      author: (m.author as string) || 'Unknown',
      downloads: (m.downloads as number) || 0,
      stars: (m.likes as number) || 0,
      category: (m.pipeline_tag as string) || 'other',
      source: 'huggingface',
      url: `https://huggingface.co/${m.id}`,
      tags: ((m.tags as string[]) || []).slice(0, 8),
    }));

    return { items, total: items.length, source: 'huggingface' };
  } catch (err) {
    clearTimeout(timeout);
    throw new Error(`HuggingFace search failed: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}

// ---------------------------------------------------------------------------
// npm search
// ---------------------------------------------------------------------------

async function searchNpm(query: string): Promise<MarketResponse> {
  const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=20`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`npm API error: ${res.status}`);

    const data = await res.json();
    const raw = data.objects || [];
    const items: MarketItem[] = raw.map((o: Record<string, unknown>) => {
      const pkg = o.package as Record<string, unknown>;
      return {
        id: pkg.name as string,
        name: pkg.name as string,
        description: (pkg.description as string) || 'No description available',
        author: ((pkg.author as Record<string, string>)?.name as string) || (pkg.publisher?.username as string) || 'Unknown',
        downloads: (o.score?.detail?.popularity as number) ? Math.round((o.score.detail.popularity as number) * 100000) : 0,
        stars: 0,
        category: (pkg.keywords as string[])?.[0] || 'package',
        source: 'npm',
        url: (pkg.links?.npm as string) || `https://www.npmjs.com/package/${pkg.name}`,
        tags: ((pkg.keywords as string[]) || []).slice(0, 8),
      };
    });

    return { items, total: data.total || items.length, source: 'npm' };
  } catch (err) {
    clearTimeout(timeout);
    throw new Error(`npm search failed: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}

// ---------------------------------------------------------------------------
// PyPI search
// ---------------------------------------------------------------------------

async function searchPyPI(query: string): Promise<MarketResponse> {
  const url = `https://pypi.org/pypi/${encodeURIComponent(query)}/json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      // If exact package not found, try search API
      const searchUrl = `https://pypi.org/pypi?name=${encodeURIComponent(query)}`;
      const searchRes = await withTimeout(fetch(searchUrl), 10_000);
      if (!searchRes.ok) throw new Error(`PyPI API error: ${searchRes.status}`);
      const searchData = await searchRes.json();
      const pkgs = searchData?.info || searchData || [];
      const items: MarketItem[] = (Array.isArray(pkgs) ? pkgs : [pkgs]).slice(0, 20).map((p: Record<string, unknown>) => ({
        id: (p.name as string) || query,
        name: (p.name as string) || query,
        description: (p.summary as string) || (p.description as string)?.substring(0, 200) || 'No description available',
        author: (p.author as string) || 'Unknown',
        downloads: 0,
        stars: 0,
        category: (p.classifiers as string[])?.find((c: string) => c.startsWith('Topic ::'))?.replace('Topic :: ', '') || 'package',
        source: 'pypi',
        url: (p.project_url as string) || (p.home_page as string) || `https://pypi.org/project/${query}`,
        tags: ((p.classifiers as string[]) || []).filter((c: string) => c.startsWith('Topic ::')).slice(0, 8),
      }));
      return { items, total: items.length, source: 'pypi' };
    }

    const data = await res.json();
    const info = data.info || {};
    const item: MarketItem = {
      id: info.name || query,
      name: info.name || query,
      description: info.summary || info.description?.substring(0, 200) || 'No description available',
      author: info.author || 'Unknown',
      downloads: (data.url?.download_url) ? 0 : 0,
      stars: 0,
      category: (info.classifiers || []).find((c: string) => c.startsWith('Topic ::'))?.replace('Topic :: ', '') || 'package',
      source: 'pypi',
      url: info.project_url || info.home_page || `https://pypi.org/project/${query}`,
      tags: (info.classifiers || []).filter((c: string) => c.startsWith('Topic ::')).slice(0, 8),
    };

    return { items: [item], total: 1, source: 'pypi' };
  } catch (err) {
    clearTimeout(timeout);
    throw new Error(`PyPI search failed: ${err instanceof Error ? err.message : 'Unknown'}`);
  }
}

// ---------------------------------------------------------------------------
// Built-in tools & skills
// ---------------------------------------------------------------------------

function searchBuiltin(query: string, category?: string): MarketResponse {
  const q = query.toLowerCase();

  // Combine tools and skills
  const allItems = [
    ...BUILTIN_TOOLS.map(t => ({
      id: `tool-${t.id}`,
      name: t.name,
      description: t.description,
      author: 'VoiceDev',
      downloads: 0,
      stars: 5,
      category: t.category,
      icon: t.icon,
      type: 'tool' as const,
    })),
    ...BUILTIN_SKILLS.map(s => ({
      id: `skill-${s.id}`,
      name: s.name,
      description: s.description,
      author: 'VoiceDev',
      downloads: 0,
      stars: 5,
      category: s.category,
      icon: s.icon,
      type: 'skill' as const,
    })),
  ];

  let filtered = allItems;

  if (category && category !== 'all') {
    filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    );
  }

  const items: MarketItem[] = filtered.map(i => ({
    id: i.id,
    name: i.name,
    description: i.description,
    author: i.author,
    downloads: i.downloads,
    stars: i.stars,
    category: i.category,
    source: 'builtin',
    url: '#',
    tags: [i.type, i.category, i.icon],
  }));

  return { items, total: items.length, source: 'builtin' };
}

// ---------------------------------------------------------------------------
// Smithery curated list
// ---------------------------------------------------------------------------

const SMITHERY_SKILLS: MarketItem[] = [
  { id: 'smithery-file-system', name: 'File System', description: 'Read, write, search, and manage files on disk', author: 'Smithery', downloads: 12400, stars: 48, category: 'File System', source: 'smithery', url: 'https://smithery.ai', tags: ['files', 'disk', 'io', 'read', 'write'] },
  { id: 'smithery-web-search', name: 'Web Search', description: 'Search the web for real-time information', author: 'Smithery', downloads: 9800, stars: 42, category: 'Network', source: 'smithery', url: 'https://smithery.ai', tags: ['search', 'web', 'google', 'bing'] },
  { id: 'smithery-code-exec', name: 'Code Execution', description: 'Execute Python, JavaScript, and shell code', author: 'Smithery', downloads: 11200, stars: 55, category: 'System', source: 'smithery', url: 'https://smithery.ai', tags: ['code', 'python', 'javascript', 'shell'] },
  { id: 'smithery-database', name: 'Database Query', description: 'Query SQLite, PostgreSQL, and MySQL databases', author: 'Smithery', downloads: 7600, stars: 38, category: 'Database', source: 'smithery', url: 'https://smithery.ai', tags: ['sql', 'database', 'postgres', 'mysql'] },
  { id: 'smithery-git', name: 'Git Operations', description: 'Git status, commit, push, and branch management', author: 'Smithery', downloads: 8900, stars: 41, category: 'Git', source: 'smithery', url: 'https://smithery.ai', tags: ['git', 'version-control', 'commit'] },
  { id: 'smithery-browser', name: 'Browser Automation', description: 'Navigate, click, and interact with web pages', author: 'Smithery', downloads: 6700, stars: 35, category: 'Browser', source: 'smithery', url: 'https://smithery.ai', tags: ['browser', 'puppeteer', 'selenium', 'scraping'] },
  { id: 'smithery-image-gen', name: 'Image Generation', description: 'Generate images with DALL-E, SDXL, and more', author: 'Smithery', downloads: 14300, stars: 62, category: 'AI', source: 'smithery', url: 'https://smithery.ai', tags: ['image', 'ai', 'generation', 'dalle', 'sdxl'] },
  { id: 'smithery-tts', name: 'Text to Speech', description: 'Convert text to natural speech', author: 'Smithery', downloads: 5400, stars: 30, category: 'Voice', source: 'smithery', url: 'https://smithery.ai', tags: ['tts', 'speech', 'audio', 'voice'] },
  { id: 'smithery-pdf', name: 'PDF Processing', description: 'Read, create, and manipulate PDF documents', author: 'Smithery', downloads: 8100, stars: 44, category: 'Data', source: 'smithery', url: 'https://smithery.ai', tags: ['pdf', 'document', 'read', 'create'] },
  { id: 'smithery-email', name: 'Email Sender', description: 'Send emails via SMTP and REST APIs', author: 'Smithery', downloads: 4200, stars: 28, category: 'Network', source: 'smithery', url: 'https://smithery.ai', tags: ['email', 'smtp', 'send'] },
];

function searchSmithery(query: string, category?: string): MarketResponse {
  const q = query.toLowerCase();
  let filtered = SMITHERY_SKILLS;

  if (category && category !== 'all') {
    filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)),
    );
  }

  return { items: filtered, total: filtered.length, source: 'smithery' };
}

// ---------------------------------------------------------------------------
// ClawHub curated list
// ---------------------------------------------------------------------------

const CLAWHUB_SKILLS: MarketItem[] = [
  { id: 'clawhub-super-agent', name: 'Super Agent', description: 'Autonomous multi-step agent with memory and planning', author: 'ClawHub', downloads: 18500, stars: 72, category: 'Automation', source: 'clawhub', url: 'https://clawhub.com', tags: ['agent', 'autonomous', 'planning', 'memory'] },
  { id: 'clawhub-code-review', name: 'AI Code Review', description: 'Intelligent code review with best practices', author: 'ClawHub', downloads: 15200, stars: 65, category: 'Development', source: 'clawhub', url: 'https://clawhub.com', tags: ['code-review', 'best-practices', 'quality'] },
  { id: 'clawhub-data-analyzer', name: 'Data Analyzer Pro', description: 'Advanced data analysis with statistical insights', author: 'ClawHub', downloads: 11800, stars: 58, category: 'Data', source: 'clawhub', url: 'https://clawhub.com', tags: ['data', 'analytics', 'statistics', 'insights'] },
  { id: 'clawhub-doc-writer', name: 'Documentation Writer', description: 'Auto-generate documentation from code', author: 'ClawHub', downloads: 9400, stars: 45, category: 'Development', source: 'clawhub', url: 'https://clawhub.com', tags: ['documentation', 'writing', 'auto-generate'] },
  { id: 'clawhub-seo-toolkit', name: 'SEO Toolkit', description: 'SEO analysis, keyword research, and optimization', author: 'ClawHub', downloads: 7300, stars: 39, category: 'Research', source: 'clawhub', url: 'https://clawhub.com', tags: ['seo', 'keywords', 'optimization'] },
  { id: 'clawhub-ci-cd', name: 'CI/CD Pipeline', description: 'Build, test, and deploy automation', author: 'ClawHub', downloads: 8600, stars: 43, category: 'Automation', source: 'clawhub', url: 'https://clawhub.com', tags: ['ci-cd', 'deploy', 'pipeline', 'automation'] },
  { id: 'clawhub-api-builder', name: 'REST API Builder', description: 'Auto-generate REST APIs from schemas', author: 'ClawHub', downloads: 10200, stars: 51, category: 'Development', source: 'clawhub', url: 'https://clawhub.com', tags: ['api', 'rest', 'builder', 'schema'] },
  { id: 'clawhub-translator', name: 'Universal Translator', description: 'Translate text across 100+ languages', author: 'ClawHub', downloads: 13700, stars: 60, category: 'AI', source: 'clawhub', url: 'https://clawhub.com', tags: ['translation', 'languages', 'i18n'] },
  { id: 'clawhub-security', name: 'Security Scanner', description: 'Scan code for vulnerabilities and best practices', author: 'ClawHub', downloads: 6900, stars: 47, category: 'Security', source: 'clawhub', url: 'https://clawhub.com', tags: ['security', 'vulnerability', 'scan'] },
  { id: 'clawhub-charts', name: 'Chart Generator', description: 'Create beautiful charts and visualizations', author: 'ClawHub', downloads: 5800, stars: 33, category: 'Data', source: 'clawhub', url: 'https://clawhub.com', tags: ['charts', 'visualization', 'graph', 'plot'] },
  { id: 'clawhub-testing', name: 'Test Generator', description: 'Auto-generate unit and integration tests', author: 'ClawHub', downloads: 8100, stars: 44, category: 'Development', source: 'clawhub', url: 'https://clawhub.com', tags: ['testing', 'unit-test', 'integration-test'] },
  { id: 'clawhub-workflow', name: 'Workflow Engine', description: 'Build and execute multi-step workflows', author: 'ClawHub', downloads: 7600, stars: 40, category: 'Automation', source: 'clawhub', url: 'https://clawhub.com', tags: ['workflow', 'automation', 'steps'] },
];

function searchClawHub(query: string, category?: string): MarketResponse {
  const q = query.toLowerCase();
  let filtered = CLAWHUB_SKILLS;

  if (category && category !== 'all') {
    filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    filtered = filtered.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)),
    );
  }

  return { items: filtered, total: filtered.length, source: 'clawhub' };
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || '';
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const action = searchParams.get('action') || '';

  try {
    // Action: list all sources
    if (action === 'sources') {
      return NextResponse.json({
        sources: [
          { id: 'huggingface', name: 'HuggingFace', description: 'Machine learning models and datasets', icon: '🤗' },
          { id: 'npm', name: 'npm', description: 'Node.js packages and modules', icon: '📦' },
          { id: 'pypi', name: 'PyPI', description: 'Python packages', icon: '🐍' },
          { id: 'builtin', name: 'VoiceDev Built-in', description: 'Built-in tools and skills', icon: '⚡' },
          { id: 'smithery', name: 'Smithery', description: 'Community MCP tools', icon: '🔧' },
          { id: 'clawhub', name: 'ClawHub', description: 'AI agent skills marketplace', icon: '🦀' },
        ],
      });
    }

    if (!source) {
      return NextResponse.json(
        { error: 'Missing required parameter: source' },
        { status: 400 },
      );
    }

    let result: MarketResponse;

    switch (source) {
      case 'huggingface':
        if (!query) return NextResponse.json({ error: 'Query is required for HuggingFace search' }, { status: 400 });
        result = await withTimeout(searchHuggingFace(query));
        break;

      case 'npm':
        if (!query) return NextResponse.json({ error: 'Query is required for npm search' }, { status: 400 });
        result = await withTimeout(searchNpm(query));
        break;

      case 'pypi':
        if (!query) return NextResponse.json({ error: 'Query is required for PyPI search' }, { status: 400 });
        result = await withTimeout(searchPyPI(query));
        break;

      case 'builtin':
        result = searchBuiltin(query, category);
        break;

      case 'smithery':
        result = searchSmithery(query, category);
        break;

      case 'clawhub':
        result = searchClawHub(query, category);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown source: ${source}. Valid sources: huggingface, npm, pypi, builtin, smithery, clawhub` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Marketplace search failed: ${message}` },
      { status: 500 },
    );
  }
}
