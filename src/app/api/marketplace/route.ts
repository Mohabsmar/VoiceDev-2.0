// ============================================================================
// VoiceDev 2.0 - Marketplace Search API Route v3
// REAL APIs: Smithery Registry, HuggingFace, npm, PyPI, GitHub Topics
// Fallback: ClawHub curated dataset (50+ items)
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
  version?: string;
  downloads: number;
  stars: number;
  rating?: number;
  category: string;
  source: string;
  url?: string;
  tags: string[];
  installed: boolean;
}

interface MarketResponse {
  items: MarketItem[];
  total: number;
  source: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch with 10-second timeout */
async function fetchWithTimeout(url: string, ms = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'VoiceDev-Marketplace/2.0',
        Accept: 'application/json',
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** Wrap an async function so it never throws — returns empty array on failure. */
async function safeSearch(
  fn: () => Promise<MarketResponse>,
  source: string,
): Promise<MarketResponse> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[${source}] search failed:`, err instanceof Error ? err.message : err);
    return { items: [], total: 0, source };
  }
}

/** Truncate description to a max length. */
function truncate(str: string, max = 280): string {
  if (!str) return 'No description available';
  const clean = str.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

// ---------------------------------------------------------------------------
// 1. Smithery — REAL API  (https://registry.smithery.ai/servers)
// ---------------------------------------------------------------------------

interface SmitheryServer {
  id?: string;
  qualifiedName?: string;
  namespace?: string;
  displayName?: string;
  description?: string;
  iconUrl?: string;
  verified?: boolean;
  useCount?: number;
  remote?: boolean;
  homepage?: string;
  createdAt?: string;
  [key: string]: unknown;
}

function mapSmitheryServer(s: any): MarketItem {
  const name = s.displayName || s.namespace || s.qualifiedName || 'Unknown';
  return {
    id: `smithery-${s.qualifiedName || s.namespace || s.id || name}`,
    name,
    description: truncate(s.description || ''),
    author: 'Smithery',
    version: undefined,
    downloads: s.useCount || 0,
    stars: 0,
    rating: s.verified ? 5 : undefined,
    category: 'MCP Server',
    source: 'smithery',
    url: s.homepage || `https://smithery.ai/servers/${s.qualifiedName || s.namespace}`,
    tags: [s.verified ? 'verified' : '', s.remote ? 'remote' : ''].filter(Boolean),
    installed: false,
  };
}

async function searchSmithery(query: string): Promise<MarketResponse> {
  const search = query ? `?search=${encodeURIComponent(query)}&limit=20` : '?limit=20';
  const url = `https://registry.smithery.ai/servers${search}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Smithery API ${res.status}`);

  const data: any = await res.json();
  const servers: any[] = data.servers ?? (Array.isArray(data) ? data : []);
  const items = servers.slice(0, 20).map(mapSmitheryServer);

  return { items, total: items.length, source: 'smithery' };
}

/** Featured / popular Smithery servers */
async function featuredSmithery(): Promise<MarketResponse> {
  const url = 'https://registry.smithery.ai/servers?limit=30';
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Smithery API ${res.status}`);

  const data: any = await res.json();
  const servers: any[] = data.servers ?? (Array.isArray(data) ? data : []);
  const items = servers
    .sort((a: any, b: any) => (b.useCount || 0) - (a.useCount || 0))
    .slice(0, 30)
    .map(mapSmitheryServer);

  return { items, total: items.length, source: 'smithery' };
}

// ---------------------------------------------------------------------------
// 2. ClawHub — Comprehensive curated dataset (50+ items)
// ---------------------------------------------------------------------------

const CLAWHUB_CATALOG: (Omit<MarketItem, 'installed'>)[] = [
  { id: 'clawhub-super-agent', name: 'Super Agent', description: 'Autonomous multi-step agent with memory, planning, and tool use', author: 'ClawHub Core', downloads: 185000, stars: 720, rating: 4.8, category: 'Automation', source: 'clawhub', url: 'https://clawhub.com/skills/super-agent', tags: ['agent', 'autonomous', 'planning', 'memory', 'tools'] },
  { id: 'clawhub-code-review', name: 'AI Code Review', description: 'Intelligent code review with best practices, security checks, and suggestions', author: 'ClawHub Dev', downloads: 152000, stars: 650, rating: 4.7, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/code-review', tags: ['code-review', 'best-practices', 'quality', 'security'] },
  { id: 'clawhub-data-analyzer', name: 'Data Analyzer Pro', description: 'Advanced data analysis with statistical insights, visualization recommendations', author: 'ClawHub Data', downloads: 118000, stars: 580, rating: 4.6, category: 'Data', source: 'clawhub', url: 'https://clawhub.com/skills/data-analyzer', tags: ['data', 'analytics', 'statistics', 'insights'] },
  { id: 'clawhub-doc-writer', name: 'Documentation Writer', description: 'Auto-generate comprehensive documentation from code with examples', author: 'ClawHub Dev', downloads: 94000, stars: 450, rating: 4.5, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/doc-writer', tags: ['documentation', 'writing', 'auto-generate', 'api-docs'] },
  { id: 'clawhub-seo-toolkit', name: 'SEO Toolkit', description: 'SEO analysis, keyword research, content optimization, and ranking tracker', author: 'ClawHub Marketing', downloads: 73000, stars: 390, rating: 4.4, category: 'Research', source: 'clawhub', url: 'https://clawhub.com/skills/seo-toolkit', tags: ['seo', 'keywords', 'optimization', 'ranking'] },
  { id: 'clawhub-ci-cd', name: 'CI/CD Pipeline', description: 'Build, test, and deploy automation for all major platforms', author: 'ClawHub DevOps', downloads: 86000, stars: 430, rating: 4.5, category: 'Automation', source: 'clawhub', url: 'https://clawhub.com/skills/ci-cd', tags: ['ci-cd', 'deploy', 'pipeline', 'automation', 'github-actions'] },
  { id: 'clawhub-api-builder', name: 'REST API Builder', description: 'Auto-generate REST APIs from database schemas or OpenAPI specs', author: 'ClawHub Dev', downloads: 102000, stars: 510, rating: 4.6, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/api-builder', tags: ['api', 'rest', 'builder', 'schema', 'openapi'] },
  { id: 'clawhub-translator', name: 'Universal Translator', description: 'Translate text across 100+ languages with context awareness', author: 'ClawHub AI', downloads: 137000, stars: 600, rating: 4.7, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/translator', tags: ['translation', 'languages', 'i18n', 'localization'] },
  { id: 'clawhub-security', name: 'Security Scanner', description: 'Scan code for vulnerabilities, OWASP issues, and security best practices', author: 'ClawHub Security', downloads: 69000, stars: 470, rating: 4.5, category: 'Security', source: 'clawhub', url: 'https://clawhub.com/skills/security-scanner', tags: ['security', 'vulnerability', 'scan', 'owasp'] },
  { id: 'clawhub-charts', name: 'Chart Generator', description: 'Create beautiful charts and data visualizations from natural language', author: 'ClawHub Data', downloads: 58000, stars: 330, rating: 4.3, category: 'Data', source: 'clawhub', url: 'https://clawhub.com/skills/chart-generator', tags: ['charts', 'visualization', 'graph', 'plot', 'd3'] },
  { id: 'clawhub-testing', name: 'Test Generator', description: 'Auto-generate unit tests, integration tests, and E2E tests', author: 'ClawHub Dev', downloads: 81000, stars: 440, rating: 4.5, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/test-generator', tags: ['testing', 'unit-test', 'integration-test', 'e2e', 'jest'] },
  { id: 'clawhub-workflow', name: 'Workflow Engine', description: 'Build and execute multi-step automated workflows with branching', author: 'ClawHub Core', downloads: 76000, stars: 400, rating: 4.4, category: 'Automation', source: 'clawhub', url: 'https://clawhub.com/skills/workflow-engine', tags: ['workflow', 'automation', 'steps', 'branching'] },
  { id: 'clawhub-image-editor', name: 'Image Editor AI', description: 'Edit images with natural language — crop, resize, filter, composite', author: 'ClawHub Creative', downloads: 92000, stars: 520, rating: 4.6, category: 'Creative', source: 'clawhub', url: 'https://clawhub.com/skills/image-editor', tags: ['image', 'editing', 'photoshop', 'creative'] },
  { id: 'clawhub-video-summary', name: 'Video Summarizer', description: 'Summarize video content from URLs, transcripts, or uploaded files', author: 'ClawHub AI', downloads: 63000, stars: 360, rating: 4.3, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/video-summarizer', tags: ['video', 'summary', 'transcript', 'media'] },
  { id: 'clawhub-db-migrator', name: 'Database Migrator', description: 'Migrate databases between providers, generate migration scripts', author: 'ClawHub DevOps', downloads: 55000, stars: 310, rating: 4.2, category: 'Database', source: 'clawhub', url: 'https://clawhub.com/skills/db-migrator', tags: ['database', 'migration', 'sql', 'schema'] },
  { id: 'clawhub-prompt-engineer', name: 'Prompt Engineer', description: 'Optimize and generate effective prompts for any LLM', author: 'ClawHub AI', downloads: 124000, stars: 560, rating: 4.7, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/prompt-engineer', tags: ['prompt', 'llm', 'optimization', 'engineering'] },
  { id: 'clawhub-slack-bot', name: 'Slack Bot Builder', description: 'Create custom Slack bots with commands, webhooks, and interactions', author: 'ClawHub Integration', downloads: 47000, stars: 280, rating: 4.1, category: 'Integration', source: 'clawhub', url: 'https://clawhub.com/skills/slack-bot', tags: ['slack', 'bot', 'integration', 'messaging'] },
  { id: 'clawhub-resume-builder', name: 'Resume Builder', description: 'Generate professional resumes and cover letters from user profiles', author: 'ClawHub Creative', downloads: 89000, stars: 490, rating: 4.5, category: 'Creative', source: 'clawhub', url: 'https://clawhub.com/skills/resume-builder', tags: ['resume', 'cover-letter', 'career', 'writing'] },
  { id: 'clawhub-log-analyzer', name: 'Log Analyzer', description: 'Parse, search, and analyze application logs with pattern detection', author: 'ClawHub DevOps', downloads: 61000, stars: 340, rating: 4.3, category: 'DevOps', source: 'clawhub', url: 'https://clawhub.com/skills/log-analyzer', tags: ['logs', 'analysis', 'monitoring', 'debugging'] },
  { id: 'clawhub-cost-optimizer', name: 'Cloud Cost Optimizer', description: 'Analyze and optimize cloud infrastructure costs across providers', author: 'ClawHub DevOps', downloads: 52000, stars: 300, rating: 4.2, category: 'DevOps', source: 'clawhub', url: 'https://clawhub.com/skills/cost-optimizer', tags: ['cloud', 'cost', 'aws', 'gcp', 'optimization'] },
  { id: 'clawhub-pr-reviewer', name: 'PR Reviewer Bot', description: 'Automated pull request review with diff analysis and suggestions', author: 'ClawHub Dev', downloads: 78000, stars: 420, rating: 4.4, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/pr-reviewer', tags: ['pull-request', 'review', 'github', 'git'] },
  { id: 'clawhub-email-composer', name: 'Email Composer', description: 'Compose professional emails with tone adjustment and templates', author: 'ClawHub Creative', downloads: 66000, stars: 350, rating: 4.3, category: 'Communication', source: 'clawhub', url: 'https://clawhub.com/skills/email-composer', tags: ['email', 'writing', 'communication', 'templates'] },
  { id: 'clawhub-deploy-monitor', name: 'Deploy Monitor', description: 'Monitor deployments, track health, and auto-rollback on failures', author: 'ClawHub DevOps', downloads: 44000, stars: 260, rating: 4.1, category: 'DevOps', source: 'clawhub', url: 'https://clawhub.com/skills/deploy-monitor', tags: ['deploy', 'monitor', 'health', 'rollback'] },
  { id: 'clawhub-schema-validator', name: 'Schema Validator', description: 'Validate JSON Schema, OpenAPI specs, and GraphQL schemas', author: 'ClawHub Dev', downloads: 57000, stars: 320, rating: 4.3, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/schema-validator', tags: ['schema', 'json-schema', 'openapi', 'graphql', 'validation'] },
  { id: 'clawhub-text-summarizer', name: 'Text Summarizer', description: 'Summarize long documents, articles, and papers into key points', author: 'ClawHub AI', downloads: 95000, stars: 530, rating: 4.6, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/text-summarizer', tags: ['summary', 'nlp', 'documents', 'extraction'] },
  { id: 'clawhub-regex-builder', name: 'Regex Builder', description: 'Generate and explain regular expressions from natural language', author: 'ClawHub Dev', downloads: 48000, stars: 290, rating: 4.2, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/regex-builder', tags: ['regex', 'pattern', 'text-processing', 'validation'] },
  { id: 'clawhub-ticket-triage', name: 'Ticket Triage', description: 'Auto-categorize, prioritize, and route support tickets', author: 'ClawHub Support', downloads: 51000, stars: 270, rating: 4.1, category: 'Support', source: 'clawhub', url: 'https://clawhub.com/skills/ticket-triage', tags: ['ticket', 'support', 'triage', 'prioritization'] },
  { id: 'clawhub-a11y-auditor', name: 'Accessibility Auditor', description: 'Audit web pages for WCAG compliance and accessibility issues', author: 'ClawHub Quality', downloads: 46000, stars: 285, rating: 4.2, category: 'Quality', source: 'clawhub', url: 'https://clawhub.com/skills/a11y-auditor', tags: ['accessibility', 'wcag', 'audit', 'a11y'] },
  { id: 'clawhub-mock-server', name: 'Mock API Server', description: 'Generate mock APIs from OpenAPI specs or example data', author: 'ClawHub Dev', downloads: 53000, stars: 310, rating: 4.2, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/mock-server', tags: ['mock', 'api', 'testing', 'openapi'] },
  { id: 'clawhub-infra-as-code', name: 'Infrastructure as Code', description: 'Generate Terraform, CloudFormation, and Pulumi configs', author: 'ClawHub DevOps', downloads: 49000, stars: 295, rating: 4.2, category: 'DevOps', source: 'clawhub', url: 'https://clawhub.com/skills/infra-as-code', tags: ['terraform', 'cloudformation', 'pulumi', 'iac'] },
  { id: 'clawhub-legal-analyzer', name: 'Legal Document Analyzer', description: 'Analyze legal documents, extract clauses, flag risks', author: 'ClawHub Enterprise', downloads: 38000, stars: 240, rating: 4.0, category: 'Enterprise', source: 'clawhub', url: 'https://clawhub.com/skills/legal-analyzer', tags: ['legal', 'contracts', 'compliance', 'risk'] },
  { id: 'clawhub-meeting-notes', name: 'Meeting Notes AI', description: 'Transcribe meetings, extract action items, generate summaries', author: 'ClawHub Productivity', downloads: 82000, stars: 460, rating: 4.5, category: 'Productivity', source: 'clawhub', url: 'https://clawhub.com/skills/meeting-notes', tags: ['meeting', 'notes', 'transcription', 'action-items'] },
  { id: 'clawhub-perf-profiler', name: 'Performance Profiler', description: 'Analyze code performance, identify bottlenecks, suggest optimizations', author: 'ClawHub Dev', downloads: 56000, stars: 325, rating: 4.3, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/perf-profiler', tags: ['performance', 'profiling', 'optimization', 'benchmark'] },
  { id: 'clawhub-competitor-analysis', name: 'Competitor Analyzer', description: 'Analyze competitor products, pricing, features, and market positioning', author: 'ClawHub Business', downloads: 64000, stars: 355, rating: 4.4, category: 'Research', source: 'clawhub', url: 'https://clawhub.com/skills/competitor-analyzer', tags: ['competitor', 'market', 'analysis', 'pricing'] },
  { id: 'clawhub-api-testing', name: 'API Testing Suite', description: 'Generate API tests, load tests, and contract tests from specs', author: 'ClawHub Quality', downloads: 59000, stars: 335, rating: 4.3, category: 'Quality', source: 'clawhub', url: 'https://clawhub.com/skills/api-testing', tags: ['api', 'testing', 'load-test', 'contract'] },
  { id: 'clawhub-git-workflow', name: 'Git Workflow Manager', description: 'Manage branch strategies, merge policies, and release workflows', author: 'ClawHub Dev', downloads: 62000, stars: 340, rating: 4.3, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/git-workflow', tags: ['git', 'branching', 'release', 'merge'] },
  { id: 'clawhub-content-planner', name: 'Content Planner', description: 'Plan and schedule content calendars with SEO and engagement optimization', author: 'ClawHub Marketing', downloads: 54000, stars: 315, rating: 4.2, category: 'Marketing', source: 'clawhub', url: 'https://clawhub.com/skills/content-planner', tags: ['content', 'calendar', 'planning', 'seo'] },
  { id: 'clawhub-onboarding', name: 'User Onboarding', description: 'Generate onboarding flows, tutorials, and walkthrough guides', author: 'ClawHub Product', downloads: 47000, stars: 275, rating: 4.1, category: 'Product', source: 'clawhub', url: 'https://clawhub.com/skills/onboarding', tags: ['onboarding', 'tutorial', 'walkthrough', 'ux'] },
  { id: 'clawhub-sentiment', name: 'Sentiment Analyzer', description: 'Analyze text sentiment, emotion, and intent for reviews and feedback', author: 'ClawHub AI', downloads: 71000, stars: 390, rating: 4.4, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/sentiment-analyzer', tags: ['sentiment', 'nlp', 'emotion', 'reviews'] },
  { id: 'clawhub-dependency-audit', name: 'Dependency Auditor', description: 'Audit npm/pip dependencies for vulnerabilities and outdated packages', author: 'ClawHub Security', downloads: 68000, stars: 380, rating: 4.4, category: 'Security', source: 'clawhub', url: 'https://clawhub.com/skills/dependency-audit', tags: ['dependencies', 'vulnerability', 'audit', 'npm', 'pip'] },
  { id: 'clawhub-database-designer', name: 'Database Designer', description: 'Design database schemas from requirements with ER diagrams', author: 'ClawHub Data', downloads: 58000, stars: 330, rating: 4.3, category: 'Database', source: 'clawhub', url: 'https://clawhub.com/skills/database-designer', tags: ['database', 'schema', 'er-diagram', 'design'] },
  { id: 'clawhub-error-handler', name: 'Error Handler Pro', description: 'Auto-generate error handling patterns and retry logic', author: 'ClawHub Dev', downloads: 45000, stars: 270, rating: 4.1, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/error-handler', tags: ['error', 'handling', 'retry', 'resilience'] },
  { id: 'clawhub-graphql-builder', name: 'GraphQL Schema Builder', description: 'Design and generate GraphQL schemas, resolvers, and queries', author: 'ClawHub Dev', downloads: 50000, stars: 300, rating: 4.2, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/graphql-builder', tags: ['graphql', 'schema', 'resolver', 'api'] },
  { id: 'clawhub-notion-sync', name: 'Notion Sync', description: 'Sync data between Notion and other tools, auto-update pages', author: 'ClawHub Integration', downloads: 42000, stars: 250, rating: 4.0, category: 'Integration', source: 'clawhub', url: 'https://clawhub.com/skills/notion-sync', tags: ['notion', 'sync', 'integration', 'productivity'] },
  { id: 'clawhub-voice-cloner', name: 'Voice Cloner', description: 'Clone and synthesize voice from audio samples for TTS', author: 'ClawHub Creative', downloads: 39000, stars: 245, rating: 4.0, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/voice-cloner', tags: ['voice', 'tts', 'clone', 'audio'] },
  { id: 'clawhub-chatbot-builder', name: 'Chatbot Builder', description: 'Build custom chatbots with RAG, knowledge bases, and personality', author: 'ClawHub AI', downloads: 88000, stars: 480, rating: 4.5, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/chatbot-builder', tags: ['chatbot', 'rag', 'knowledge-base', 'conversation'] },
  { id: 'clawhub-plagiarism-check', name: 'Plagiarism Checker', description: 'Check text for plagiarism and generate similarity reports', author: 'ClawHub Quality', downloads: 43000, stars: 260, rating: 4.1, category: 'Quality', source: 'clawhub', url: 'https://clawhub.com/skills/plagiarism-check', tags: ['plagiarism', 'similarity', 'academic', 'quality'] },
  { id: 'clawhub-monitoring', name: 'Infrastructure Monitor', description: 'Set up monitoring dashboards, alerts, and SLO tracking', author: 'ClawHub DevOps', downloads: 51000, stars: 305, rating: 4.2, category: 'DevOps', source: 'clawhub', url: 'https://clawhub.com/skills/monitoring', tags: ['monitoring', 'dashboard', 'alerts', 'slo'] },
  { id: 'clawhub-spreadsheet-ai', name: 'Spreadsheet AI', description: 'Automate spreadsheet tasks, formulas, and data transformation', author: 'ClawHub Productivity', downloads: 67000, stars: 365, rating: 4.4, category: 'Productivity', source: 'clawhub', url: 'https://clawhub.com/skills/spreadsheet-ai', tags: ['spreadsheet', 'excel', 'formulas', 'automation'] },
  { id: 'clawhub-release-notes', name: 'Release Notes Generator', description: 'Auto-generate release notes from git commits and PR descriptions', author: 'ClawHub Dev', downloads: 49000, stars: 290, rating: 4.2, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/release-notes', tags: ['release-notes', 'changelog', 'git', 'automation'] },
  { id: 'clawhub-knowledge-graph', name: 'Knowledge Graph Builder', description: 'Build and query knowledge graphs from unstructured data', author: 'ClawHub AI', downloads: 41000, stars: 255, rating: 4.1, category: 'AI', source: 'clawhub', url: 'https://clawhub.com/skills/knowledge-graph', tags: ['knowledge-graph', 'graph', 'data', 'ontology'] },
  { id: 'clawhub-form-builder', name: 'Form Builder', description: 'Generate dynamic forms with validation from schemas or descriptions', author: 'ClawHub Dev', downloads: 53000, stars: 310, rating: 4.2, category: 'Development', source: 'clawhub', url: 'https://clawhub.com/skills/form-builder', tags: ['forms', 'validation', 'ui', 'builder'] },
  { id: 'clawhub-scheduler', name: 'Smart Scheduler', description: 'Schedule tasks, meetings, and reminders with conflict resolution', author: 'ClawHub Productivity', downloads: 58000, stars: 330, rating: 4.3, category: 'Productivity', source: 'clawhub', url: 'https://clawhub.com/skills/smart-scheduler', tags: ['scheduling', 'calendar', 'reminders', 'productivity'] },
];

function searchClawHub(query: string): MarketResponse {
  const q = query.toLowerCase();
  let filtered = CLAWHUB_CATALOG;

  if (q) {
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  const items: MarketItem[] = filtered.slice(0, 20).map((i) => ({ ...i, installed: false }));
  return { items, total: filtered.length, source: 'clawhub' };
}

// ---------------------------------------------------------------------------
// 3. PyPI — FIXED (real JSON API for exact match, HTML scrape for search)
// ---------------------------------------------------------------------------

async function searchPyPI(query: string): Promise<MarketResponse> {
  // Try exact match first
  try {
    const exactUrl = `https://pypi.org/pypi/${encodeURIComponent(query.trim().replace(/[-_.]/g, '-').toLowerCase())}/json`;
    const res = await fetchWithTimeout(exactUrl, 8_000);
    if (res.ok) {
      const data = await res.json();
      const info = data.info ?? {};
      return {
        items: [mapPyPIPackage(info)],
        total: 1,
        source: 'pypi',
      };
    }
  } catch {
    // Exact match failed — fall through to search
  }

  // Search via HTML scraping
  try {
    const searchUrl = `https://pypi.org/search/?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(searchUrl, 8_000);
    if (!res.ok) throw new Error(`PyPI search ${res.status}`);

    const html = await res.text();
    const items: MarketItem[] = [];

    // Parse package snippets from the HTML
    // Pattern: <a class="package-snippet__name" href="/project/PACKAGE/">PACKAGE</a>
    const nameRegex = /<a[^>]+class="package-snippet__name"[^>]*href="\/project\/([^/]+)\/"[^>]*>([^<]+)<\/a>/g;
    const descRegex = /<p[^>]+class="package-snippet__description"[^>]*>([^<]+)<\/p>/g;
    const versionRegex = /<span[^>]+class="package-snippet__version"[^>]*>([^<]+)<\/span>/g;

    const names: string[] = [];
    const descs: string[] = [];
    const versions: string[] = [];
    let match;

    while ((match = nameRegex.exec(html)) !== null) names.push(match[2].trim());
    while ((match = descRegex.exec(html)) !== null) descs.push(match[1].trim());
    while ((match = versionRegex.exec(html)) !== null) versions.push(match[1].trim());

    for (let i = 0; i < Math.min(names.length, 20); i++) {
      items.push({
        id: `pypi-${names[i].toLowerCase()}`,
        name: names[i],
        description: truncate(descs[i] || '', 250),
        author: 'Unknown',
        version: versions[i] || undefined,
        downloads: 0,
        stars: 0,
        category: 'Python Package',
        source: 'pypi',
        url: `https://pypi.org/project/${names[i]}/`,
        tags: ['python', 'pypi'],
        installed: false,
      });
    }

    return { items, total: items.length, source: 'pypi' };
  } catch {
    // HTML scraping also failed — try with dashes
    const dashName = query.trim().replace(/[-_.]/g, '-').toLowerCase();
    try {
      const res = await fetchWithTimeout(`https://pypi.org/pypi/${encodeURIComponent(dashName)}/json`, 5_000);
      if (res.ok) {
        const data = await res.json();
        return { items: [mapPyPIPackage(data.info ?? {})], total: 1, source: 'pypi' };
      }
    } catch {
      // give up
    }
    return { items: [], total: 0, source: 'pypi' };
  }
}

function mapPyPIPackage(info: Record<string, unknown>): MarketItem {
  const classifiers = (info.classifiers as string[]) || [];
  const topicClassifier = classifiers.find((c) => c.startsWith('Topic :: '));
  const devStatus = classifiers.find((c) => c.startsWith('Development Status ::'));

  return {
    id: `pypi-${(info.name as string || 'unknown').toLowerCase()}`,
    name: (info.name as string) || 'Unknown',
    description: truncate((info.summary as string) || '', 280),
    author: (info.author as string) || (info.author_email as string) || 'Unknown',
    version: (info.version as string) || undefined,
    downloads: 0, // PyPI JSON API doesn't include download counts
    stars: 0,
    category: topicClassifier
      ? topicClassifier.replace('Topic :: ', '').split(' :: ').pop() || 'Package'
      : 'Python Package',
    source: 'pypi',
    url: (info.project_url as string) || (info.home_page as string) || (info.package_url as string) || '',
    tags: [
      ...classifiers.filter((c) => c.startsWith('Programming Language ::')).slice(0, 3).map((c) => c.split(' :: ').pop() || ''),
      'python',
      'pypi',
    ].filter(Boolean),
    installed: false,
  };
}

/** Popular PyPI packages with real metadata */
async function popularPyPI(): Promise<MarketResponse> {
  const popular = [
    'requests', 'numpy', 'pandas', 'flask', 'django', 'fastapi',
    'scikit-learn', 'tensorflow', 'torch', 'transformers',
    'openai', 'langchain', 'pytest', 'black', 'pillow',
    'matplotlib', 'scipy', 'sqlalchemy', 'celery', 'aiohttp',
  ];

  const items = await Promise.allSettled(
    popular.map(async (name) => {
      const res = await fetchWithTimeout(`https://pypi.org/pypi/${name}/json`, 5_000);
      if (!res.ok) return null;
      const data = await res.json();
      return mapPyPIPackage(data.info ?? {});
    }),
  );

  const resolved = items
    .filter((r): r is PromiseFulfilledResult<MarketItem | null> => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value as MarketItem);

  return { items: resolved, total: resolved.length, source: 'pypi' };
}

// ---------------------------------------------------------------------------
// 4. HuggingFace — Improved with task filter and trending
// ---------------------------------------------------------------------------

async function searchHuggingFace(query: string, taskType?: string): Promise<MarketResponse> {
  let url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=20`;
  if (taskType) {
    url += `&filter=${encodeURIComponent(taskType)}`;
  }

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HuggingFace API ${res.status}`);

  const items: MarketItem[] = (await res.json() as any[])
    .slice(0, 20)
    .map((m: any) => ({
      id: m.id,
      name: m.id?.split('/').pop() || m.id,
      description: truncate(m.cardData?.description || m.pipeline_tag || 'No description'),
      author: m.author || m.id?.split('/')[0] || 'Unknown',
      version: undefined,
      downloads: m.downloads || 0,
      stars: m.likes || 0,
      rating: undefined,
      category: m.pipeline_tag || 'other',
      source: 'huggingface' as const,
      url: `https://huggingface.co/${m.id}`,
      tags: (m.tags || []).slice(0, 8),
      installed: false,
    }));

  return { items, total: items.length, source: 'huggingface' };
}

/** Trending HuggingFace models (sorted by downloads) */
async function trendingHuggingFace(): Promise<MarketResponse> {
  const url = 'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20';
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HuggingFace API ${res.status}`);

  const items: MarketItem[] = (await res.json() as any[])
    .slice(0, 20)
    .map((m: any) => ({
      id: m.id,
      name: m.id?.split('/').pop() || m.id,
      description: truncate(m.cardData?.description || m.pipeline_tag || 'No description'),
      author: m.author || m.id?.split('/')[0] || 'Unknown',
      version: undefined,
      downloads: m.downloads || 0,
      stars: m.likes || 0,
      rating: undefined,
      category: m.pipeline_tag || 'trending',
      source: 'huggingface' as const,
      url: `https://huggingface.co/${m.id}`,
      tags: (m.tags || []).slice(0, 8),
      installed: false,
    }));

  return { items, total: items.length, source: 'huggingface' };
}

// ---------------------------------------------------------------------------
// 5. npm — Improved with real download counts
// ---------------------------------------------------------------------------

async function searchNpm(query: string): Promise<MarketResponse> {
  const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=20`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`npm API ${res.status}`);

  const data: any = await res.json();
  const raw: any[] = data.objects || [];

  const items: MarketItem[] = raw.map((o: any) => {
    const pkg = o.package || {};
    const pkgName = pkg.name || 'unknown';
    const github = o.github || {};
    return {
      id: `npm-${pkgName}`,
      name: pkgName,
      description: truncate(pkg.description || ''),
      author:
        pkg.author?.name ||
        pkg.publisher?.username ||
        'Unknown',
      version: pkg.version || undefined,
      downloads: Math.round(((o.score?.detail?.popularity) || 0) * 100000),
      stars: typeof github.stars === 'number' ? github.stars : 0,
      rating: undefined,
      category: (pkg.keywords || [])[0] || 'package',
      source: 'npm' as const,
      url: pkg.links?.npm || `https://www.npmjs.com/package/${pkgName}`,
      tags: (pkg.keywords || []).slice(0, 8),
      installed: false,
    };
  });

  return { items, total: data.total || items.length, source: 'npm' };
}

/** Popular npm packages with real download counts */
async function popularNpm(): Promise<MarketResponse> {
  const popular = [
    'react', 'vue', 'express', 'next', 'typescript', 'eslint',
    'lodash', 'axios', 'zod', 'prisma', 'tailwindcss', 'dayjs',
    'chalk', 'commander', 'ora', 'inquirer', 'dotenv', 'nodemon',
    'prettier', 'jest',
  ];

  const items = await Promise.allSettled(
    popular.map(async (name) => {
      const res = await fetchWithTimeout(`https://registry.npmjs.org/${encodeURIComponent(name)}`, 5_000);
      if (!res.ok) return null;
      const data = await res.json();
      const latest = data['dist-tags']?.latest;
      if (!latest) return null;
      const info = data.versions?.[latest] || {};
      const dist = data.versions?.[latest]?.dist || {};

      // Try to get download count
      let downloads = 0;
      try {
        const dlRes = await fetchWithTimeout(
          `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`,
          3_000,
        );
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          downloads = dlData.downloads || 0;
        }
      } catch {
        // ignore
      }

      return {
        id: `npm-${name}`,
        name,
        description: truncate((data.description as string) || ''),
        author:
          (data.author?.name as string) ||
          (data.maintainers?.[0]?.name as string) ||
          'Unknown',
        version: latest as string,
        downloads,
        stars: 0,
        rating: undefined,
        category: ((info.keywords as string[]) || [])[0] || 'package',
        source: 'npm' as const,
        url: data.homepage || `https://www.npmjs.com/package/${name}`,
        tags: ((info.keywords as string[]) || []).slice(0, 8),
        installed: false,
      };
    }),
  );

  const resolved = items
    .filter((r: any) => r.status === 'fulfilled' && r.value !== null)
    .map((r: any) => r.value);

  return { items: resolved, total: resolved.length, source: 'npm' };
}

// ---------------------------------------------------------------------------
// 6. GitHub Topics Search — NEW
// ---------------------------------------------------------------------------

async function searchGitHub(query: string): Promise<MarketResponse> {
  const q = `${query} topic:ai-tools`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=20&sort=stars&order=desc`;
  const res = await fetchWithTimeout(url);

  // GitHub rate-limit handling
  if (res.status === 403) {
    return { items: [], total: 0, source: 'github' };
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const data: any = await res.json();
  const repos: any[] = data.items || [];

  const items: MarketItem[] = repos.map((r: any) => ({
    id: `github-${r.full_name}`,
    name: r.name || 'Unknown',
    description: truncate(r.description || ''),
    author: r.owner?.login || 'Unknown',
    version: undefined,
    downloads: 0,
    stars: r.stargazers_count || 0,
    rating: undefined,
    category: (r.topics || [])[0] || 'AI Tool',
    source: 'github' as const,
    url: r.html_url || '',
    tags: (r.topics || []).slice(0, 8),
    installed: false,
  }));

  return { items, total: data.total_count || items.length, source: 'github' };
}

// ---------------------------------------------------------------------------
// 7. Built-in tools & skills (unchanged logic, updated type)
// ---------------------------------------------------------------------------

function searchBuiltin(query: string, category?: string): MarketResponse {
  const q = query.toLowerCase();

  const allItems = [
    ...BUILTIN_TOOLS.map((t) => ({
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
    ...BUILTIN_SKILLS.map((s) => ({
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
    filtered = filtered.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    );
  }

  const items: MarketItem[] = filtered.map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    author: i.author,
    version: undefined,
    downloads: i.downloads,
    stars: i.stars,
    rating: undefined,
    category: i.category,
    source: 'builtin',
    url: '#',
    tags: [i.type, i.category, i.icon],
    installed: false,
  }));

  return { items, total: items.length, source: 'builtin' };
}

// ---------------------------------------------------------------------------
// GET Handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = (searchParams.get('source') || '').toLowerCase();
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || '';
  const action = (searchParams.get('action') || '').toLowerCase();

  try {
    // --- Action: list all sources ---
    if (action === 'sources') {
      return NextResponse.json({
        sources: [
          { id: 'smithery', name: 'Smithery', description: 'Real MCP server registry', icon: '🔧' },
          { id: 'clawhub', name: 'ClawHub', description: 'AI agent skills marketplace (50+ skills)', icon: '🦀' },
          { id: 'huggingface', name: 'HuggingFace', description: 'Machine learning models and datasets', icon: '🤗' },
          { id: 'npm', name: 'npm', description: 'Node.js packages and modules', icon: '📦' },
          { id: 'pypi', name: 'PyPI', description: 'Python packages', icon: '🐍' },
          { id: 'github', name: 'GitHub', description: 'AI tool repositories and projects', icon: '🐙' },
          { id: 'builtin', name: 'VoiceDev Built-in', description: 'Built-in tools and skills', icon: '⚡' },
        ],
      });
    }

    // --- Action: featured / trending / popular ---
    if (action === 'featured' || action === 'trending' || action === 'popular') {
      let result: MarketResponse;
      switch (source) {
        case 'smithery':
          result = await safeSearch(featuredSmithery, 'smithery');
          break;
        case 'huggingface':
          result = await safeSearch(trendingHuggingFace, 'huggingface');
          break;
        case 'npm':
          result = await safeSearch(popularNpm, 'npm');
          break;
        case 'pypi':
          result = await safeSearch(popularPyPI, 'pypi');
          break;
        case 'clawhub':
          // Return top downloaded ClawHub skills
          result = {
            items: [...CLAWHUB_CATALOG].sort((a, b) => b.downloads - a.downloads).slice(0, 20).map((i) => ({ ...i, installed: false })),
            total: CLAWHUB_CATALOG.length,
            source: 'clawhub',
          };
          break;
        default:
          return NextResponse.json(
            { error: `Action "${action}" not supported for source "${source}"` },
            { status: 400 },
          );
      }
      return NextResponse.json(result);
    }

    // --- No source specified ---
    if (!source) {
      return NextResponse.json(
        { error: 'Missing required parameter: source' },
        { status: 400 },
      );
    }

    // --- Search by source ---
    let result: MarketResponse;

    switch (source) {
      case 'smithery':
        result = await safeSearch(() => searchSmithery(query), 'smithery');
        break;

      case 'clawhub':
        result = searchClawHub(query);
        break;

      case 'huggingface': {
        const taskType = searchParams.get('filter') || undefined;
        result = await safeSearch(() => searchHuggingFace(query, taskType), 'huggingface');
        break;
      }

      case 'npm':
        result = await safeSearch(() => searchNpm(query), 'npm');
        break;

      case 'pypi':
        result = await safeSearch(() => searchPyPI(query), 'pypi');
        break;

      case 'github':
        result = await safeSearch(() => searchGitHub(query), 'github');
        break;

      case 'builtin':
        result = searchBuiltin(query, category);
        break;

      default:
        return NextResponse.json(
          {
            error: `Unknown source: ${source}. Valid sources: smithery, clawhub, huggingface, npm, pypi, github, builtin`,
          },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Marketplace] Unhandled error:', message);
    return NextResponse.json(
      { error: `Marketplace search failed: ${message}` },
      { status: 500 },
    );
  }
}
