'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  Check,
  Layers,
  Brain,
  Zap,
  Eye,
  Image,
  Mic,
  Database,
  GitCompareArrows,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  MessageSquare,
  Bot,
  Code2,
  Heart,
  Activity,
  DollarSign,
  Tag,
  Calendar,
  ExternalLink,
  X,
  Plus,
  RotateCcw,
  BarChart3,
  FileText,
  Globe,
} from 'lucide-react';
import { PROVIDERS, getTotalModelCount, getAllModels, getProviderById } from '@/lib/providers';
import { useVoiceDevStore } from '@/lib/store';
import type { ModelCategory, TabId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES: { value: string; label: string; color: string; icon: React.ElementType }[] = [
  { value: 'All', label: 'All', color: '#8b5cf6', icon: Layers },
  { value: 'LLM', label: 'LLM', color: '#3b82f6', icon: Brain },
  { value: 'Reasoning', label: 'Reasoning', color: '#f59e0b', icon: Sparkles },
  { value: 'Vision', label: 'Vision', color: '#10b981', icon: Eye },
  { value: 'Image', label: 'Image', color: '#ec4899', icon: Image },
  { value: 'TTS', label: 'TTS', color: '#f97316', icon: Mic },
  { value: 'ASR', label: 'ASR', color: '#06b6d4', icon: Mic },
  { value: 'Embedding', label: 'Embedding', color: '#8b5cf6', icon: Database },
];

const PIE_COLORS: Record<string, string> = {
  LLM: '#3b82f6',
  Reasoning: '#f59e0b',
  Vision: '#10b981',
  Image: '#ec4899',
  TTS: '#f97316',
  ASR: '#06b6d4',
  Embedding: '#8b5cf6',
};

const FEATURE_ICONS: Record<string, React.ElementType> = {
  Chat: MessageSquare,
  Vision: Eye,
  TTS: Mic,
  'Image Gen': Image,
  Code: Code2,
  Streaming: Zap,
  'Function Calling': Bot,
};

// Benchmark data for popular models
const MODEL_BENCHMARKS: Record<string, { MMLU: number; HumanEval: number; GSM8K: number; MATH: number }> = {
  'gpt-4o': { MMLU: 88.7, HumanEval: 90.2, GSM8K: 95.8, MATH: 76.6 },
  'gpt-4o-mini': { MMLU: 82.0, HumanEval: 87.2, GSM8K: 93.2, MATH: 70.2 },
  'claude-opus-4-20250514': { MMLU: 89.2, HumanEval: 92.8, GSM8K: 96.4, MATH: 78.5 },
  'claude-sonnet-4-20250514': { MMLU: 87.3, HumanEval: 91.0, GSM8K: 95.1, MATH: 76.0 },
  'claude-3-5-sonnet-20241022': { MMLU: 85.8, HumanEval: 92.0, GSM8K: 96.4, MATH: 71.1 },
  'gemini-2.5-pro': { MMLU: 90.0, HumanEval: 93.4, GSM8K: 97.0, MATH: 83.2 },
  'gemini-2.5-flash': { MMLU: 85.5, HumanEval: 89.0, GSM8K: 94.5, MATH: 74.8 },
  'deepseek-reasoner': { MMLU: 84.1, HumanEval: 90.2, GSM8K: 92.8, MATH: 90.2 },
  'deepseek-chat': { MMLU: 82.3, HumanEval: 86.5, GSM8K: 90.2, MATH: 68.4 },
  'grok-3': { MMLU: 87.5, HumanEval: 88.0, GSM8K: 94.0, MATH: 75.0 },
  'llama-3.3-70b-versatile': { MMLU: 80.5, HumanEval: 82.0, GSM8K: 87.5, MATH: 62.4 },
  'o3-mini': { MMLU: 85.2, HumanEval: 87.5, GSM8K: 95.3, MATH: 78.0 },
  'qwen-max': { MMLU: 83.1, HumanEval: 84.5, GSM8K: 89.0, MATH: 66.8 },
};

// Provider health simulation data
const PROVIDER_HEALTH: Record<string, { uptime: number; latency: number; status: 'green' | 'yellow' | 'red'; lastChecked: string }> = {
  openai: { uptime: 99.98, latency: 320, status: 'green', lastChecked: '2 min ago' },
  anthropic: { uptime: 99.95, latency: 480, status: 'green', lastChecked: '3 min ago' },
  google: { uptime: 99.97, latency: 280, status: 'green', lastChecked: '1 min ago' },
  deepseek: { uptime: 99.2, latency: 850, status: 'green', lastChecked: '5 min ago' },
  xai: { uptime: 98.5, latency: 620, status: 'yellow', lastChecked: '4 min ago' },
  groq: { uptime: 99.9, latency: 120, status: 'green', lastChecked: '1 min ago' },
  mistral: { uptime: 99.4, latency: 410, status: 'green', lastChecked: '2 min ago' },
  cohere: { uptime: 99.1, latency: 550, status: 'yellow', lastChecked: '6 min ago' },
  together: { uptime: 98.8, latency: 720, status: 'yellow', lastChecked: '3 min ago' },
  perplexity: { uptime: 99.6, latency: 390, status: 'green', lastChecked: '2 min ago' },
  fireworks: { uptime: 99.3, latency: 250, status: 'green', lastChecked: '4 min ago' },
  replicate: { uptime: 98.2, latency: 1100, status: 'yellow', lastChecked: '5 min ago' },
  openrouter: { uptime: 97.5, latency: 680, status: 'yellow', lastChecked: '3 min ago' },
  elevenlabs: { uptime: 99.7, latency: 200, status: 'green', lastChecked: '2 min ago' },
};

// Provider documentation links
const PROVIDER_DOCS: Record<string, { api: string; pricing: string; status: string; changelog: string }> = {
  openai: { api: 'https://platform.openai.com/docs', pricing: 'https://openai.com/pricing', status: 'https://status.openai.com', changelog: 'https://platform.openai.com/docs/changelog' },
  anthropic: { api: 'https://docs.anthropic.com', pricing: 'https://www.anthropic.com/pricing', status: 'https://status.anthropic.com', changelog: 'https://docs.anthropic.com/en/docs/about-claude/models' },
  google: { api: 'https://ai.google.dev/docs', pricing: 'https://ai.google.dev/pricing', status: 'https://ai.google.dev/status', changelog: 'https://ai.google.dev/changelog' },
  deepseek: { api: 'https://platform.deepseek.com/api-docs', pricing: 'https://platform.deepseek.com/usage', status: 'https://status.deepseek.com', changelog: 'https://platform.deepseek.com/news' },
  xai: { api: 'https://docs.x.ai/docs', pricing: 'https://x.ai/pricing', status: 'https://status.x.ai', changelog: 'https://docs.x.ai/docs' },
  groq: { api: 'https://console.groq.com/docs', pricing: 'https://groq.com/pricing', status: 'https://status.groq.com', changelog: 'https://console.groq.com/docs/models' },
  mistral: { api: 'https://docs.mistral.ai', pricing: 'https://mistral.ai/pricing', status: 'https://status.mistral.ai', changelog: 'https://docs.mistral.ai/getting-started/models/models_overview' },
  cohere: { api: 'https://docs.cohere.com', pricing: 'https://cohere.com/pricing', status: 'https://status.cohere.com', changelog: 'https://docs.cohere.com/docs' },
};

// Pricing data (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku-20241022': { input: 1.0, output: 5.0 },
  'gemini-2.5-pro': { input: 1.25, output: 10.0 },
  'gemini-2.5-flash': { input: 0.15, output: 0.6 },
  'gemini-1.5-pro': { input: 3.5, output: 10.5 },
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
  'grok-3': { input: 3.0, output: 15.0 },
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'o3-mini': { input: 1.10, output: 4.40 },
  'qwen-max': { input: 2.0, output: 6.0 },
};

// Tag colors
const TAG_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
  '#f97316', '#06b6d4', '#ef4444', '#84cc16', '#6366f1',
];

// ---------------------------------------------------------------------------
// Local storage hooks
// ---------------------------------------------------------------------------
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  const setter = useCallback((v: T) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* noop */ }
  }, [key]);
  return [val, setter];
}

// ---------------------------------------------------------------------------
// Quick Stat Banner
// ---------------------------------------------------------------------------
function QuickStats() {
  const totalModels = getTotalModelCount();
  const categories = new Set(PROVIDERS.flatMap((p) => p.models.map((m) => m.category))).size;
  const avgContext = Math.round(
    getAllModels()
      .filter((m) => m.contextWindow > 0)
      .reduce((sum, m) => sum + m.contextWindow, 0) /
      Math.max(getAllModels().filter((m) => m.contextWindow > 0).length, 1)
  );
  const freeModels = getAllModels().filter((m) => m.pricing === 'Free' || m.pricing === 'Freemium').length;

  const stats = [
    { icon: Layers, label: 'Total Providers', value: `${PROVIDERS.length}+`, color: '#8b5cf6' },
    { icon: Brain, label: 'Total Models', value: `${totalModels}+`, color: '#3b82f6' },
    { icon: Sparkles, label: 'Categories', value: `${categories}`, color: '#10b981' },
    { icon: Database, label: 'Avg Context', value: `${(avgContext / 1000).toFixed(0)}k`, color: '#f59e0b' },
    { icon: Star, label: 'Free/Freemium', value: `${freeModels}`, color: '#ec4899' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
          >
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: stat.color + '15' }}
            >
              <Icon className="h-4.5 w-4.5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Doughnut Chart
// ---------------------------------------------------------------------------
function CategoryChart() {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const provider of PROVIDERS) {
      for (const model of provider.models) {
        counts[model.category] = (counts[model.category] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="w-[280px] h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#888'} className="transition-opacity hover:opacity-80" />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number, name: string) => [`${value} models`, name]}
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[entry.name] || '#888' }} />
            <span className="text-[10px] text-muted-foreground">{entry.name} ({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trending Models
// ---------------------------------------------------------------------------
function TrendingModels({ onSelectModel }: { onSelectModel: (providerId: string, modelId: string) => void }) {
  const trending = [
    { providerId: 'openai', modelId: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: '#10a37f', badge: '🔥 Hottest' },
    { providerId: 'anthropic', modelId: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'Anthropic', color: '#d4a574', badge: '⭐ New' },
    { providerId: 'google', modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google AI', color: '#ea4335', badge: '🚀 Trending' },
    { providerId: 'deepseek', modelId: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'DeepSeek', color: '#4d6bfe', badge: '🧠 Reasoning' },
    { providerId: 'xai', modelId: 'grok-3', name: 'Grok 3', provider: 'xAI', color: '#6366f1', badge: '⚡ Fast' },
    { providerId: 'openai', modelId: 'o3-mini', name: 'o3 Mini', provider: 'OpenAI', color: '#10a37f', badge: '💡 Smart' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-semibold">Trending Models</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {trending.map((item, i) => (
          <motion.div
            key={item.modelId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:border-violet-500/30 transition-colors cursor-pointer group"
            onClick={() => onSelectModel(item.providerId, item.modelId)}
          >
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: item.color }}>
              {item.provider.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{item.name}</span>
                <span className="text-[10px]">{item.badge}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{item.provider}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #2: Provider Health Monitor
// ---------------------------------------------------------------------------
function ProviderHealthMonitor({ apiKeys }: { apiKeys: Record<string, string> }) {
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(Date.now()), 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  const healthData = useMemo(() => {
    return PROVIDERS.filter((p) => PROVIDER_HEALTH[p.id]).map((p) => ({
      ...p,
      health: PROVIDER_HEALTH[p.id],
      hasKey: !!apiKeys[p.id],
    }));
  }, [apiKeys, lastRefresh]);

  const statusColor = (status: string) => {
    if (status === 'green') return 'bg-green-500';
    if (status === 'yellow') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const statusText = (status: string) => {
    if (status === 'green') return 'text-green-500';
    if (status === 'yellow') return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold">Provider Health</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Auto-refresh: 5 min</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {healthData.filter((h) => h.health.status === 'green').length}/{healthData.length} healthy
            </div>
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {healthData.map((provider) => (
            <div key={provider.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card/50">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: provider.health.status === 'green' ? '#10b981' : provider.health.status === 'yellow' ? '#f59e0b' : '#ef4444' }} />
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: provider.color }}>
                {provider.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{provider.name}</span>
                  {provider.hasKey && <Badge variant="secondary" className="text-[9px]">Key ✓</Badge>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xs font-semibold ${statusText(provider.health.status)}`}>
                  {provider.health.uptime}%
                </p>
                <p className="text-[10px] text-muted-foreground">{provider.health.latency}ms</p>
              </div>
              <div className="w-16 shrink-0">
                <Progress value={provider.health.uptime} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feature #3: Model Benchmark Scores
// ---------------------------------------------------------------------------
function ModelBenchmarks() {
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const benchmarkModels = Object.keys(MODEL_BENCHMARKS);
  const currentBench = MODEL_BENCHMARKS[selectedModel];

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold">Model Benchmarks</h3>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {benchmarkModels.map((modelId) => {
            const provider = PROVIDERS.find((p) => p.models.some((m) => m.id === modelId));
            const model = provider?.models.find((m) => m.id === modelId);
            return (
              <button
                key={modelId}
                onClick={() => setSelectedModel(modelId)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedModel === modelId
                    ? 'bg-violet-600 text-white'
                    : 'border text-muted-foreground hover:bg-accent'
                }`}
              >
                {model?.name || modelId}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {currentBench && Object.entries(currentBench).map(([bench, score]) => (
            <div key={bench} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{bench}</span>
                <span className="text-xs font-bold" style={{ color: score >= 90 ? '#10b981' : score >= 80 ? '#f59e0b' : '#ef4444' }}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feature #4: Cost Calculator
// ---------------------------------------------------------------------------
function CostCalculator() {
  const [messages, setMessages] = useState(1000);
  const [avgTokens, setAvgTokens] = useState(500);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const pricedModels = Object.keys(MODEL_PRICING);
  const pricing = MODEL_PRICING[selectedModel];
  const inputTokens = messages * avgTokens;
  const outputTokens = Math.round(messages * avgTokens * 0.4);
  const monthlyCost = ((inputTokens / 1000000) * pricing.input) + ((outputTokens / 1000000) * pricing.output);

  const model = (() => {
    for (const p of PROVIDERS) {
      const m = p.models.find((mod) => mod.id === selectedModel);
      if (m) return m;
    }
    return null;
  })();

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold">Cost Calculator</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-xs">Model</Label>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {pricedModels.map((mId) => {
                const prov = PROVIDERS.find((p) => p.models.some((mod) => mod.id === mId));
                const mod = prov?.models.find((mod) => mod.id === mId);
                return (
                  <button
                    key={mId}
                    onClick={() => setSelectedModel(mId)}
                    className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors cursor-pointer ${
                      selectedModel === mId ? 'bg-violet-600 text-white' : 'border text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {mod?.name || mId}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs">Messages / month</Label>
                <span className="text-xs font-mono text-muted-foreground">{messages.toLocaleString()}</span>
              </div>
              <Input
                type="number"
                value={messages}
                onChange={(e) => setMessages(Math.max(0, parseInt(e.target.value) || 0))}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs">Avg tokens / msg</Label>
                <span className="text-xs font-mono text-muted-foreground">{avgTokens.toLocaleString()}</span>
              </div>
              <Input
                type="number"
                value={avgTokens}
                onChange={(e) => setAvgTokens(Math.max(0, parseInt(e.target.value) || 0))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <Separator />

          <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
            <p className="text-[10px] text-muted-foreground mb-1">Estimated Monthly Cost</p>
            <p className="text-2xl font-bold text-violet-500">${monthlyCost.toFixed(2)}</p>
            <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
              <span>Input: {((inputTokens / 1000000) * pricing.input).toFixed(2)}</span>
              <span>Output: {((outputTokens / 1000000) * pricing.output).toFixed(2)}</span>
            </div>
            <div className="flex gap-4 mt-1 text-[10px] text-muted-foreground">
              <span>~{inputTokens.toLocaleString()} input tokens</span>
              <span>~{outputTokens.toLocaleString()} output tokens</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feature #8: Context Window Visualizer
// ---------------------------------------------------------------------------
function ContextWindowBar({ contextWindow }: { contextWindow: number }) {
  if (contextWindow <= 0) return null;

  const maxCtx = 2000000;
  const percent = Math.min((contextWindow / maxCtx) * 100, 100);
  const estMessages = Math.round(contextWindow / 800);

  let barColor = '#3b82f6';
  let label = `${(contextWindow / 1000).toFixed(0)}K`;
  if (contextWindow >= 1000000) {
    barColor = '#10b981';
    label = `${(contextWindow / 1000000).toFixed(1)}M`;
  } else if (contextWindow >= 200000) {
    barColor = '#8b5cf6';
    label = `${(contextWindow / 1000).toFixed(0)}K`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(percent, 3)}%`, backgroundColor: barColor }} />
            </div>
            <span className="text-[9px] text-muted-foreground">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-[10px]">
          <p>Context: {contextWindow.toLocaleString()} tokens</p>
          <p>~{estMessages.toLocaleString()} messages (avg 800 tok)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Feature #9: Release Timeline
// ---------------------------------------------------------------------------
function ReleaseTimeline() {
  const models = useMemo(() => {
    return getAllModels()
      .filter((m) => m.contextWindow > 0)
      .sort((a, b) => {
        const da = parseInt(a.releaseDate) || 2023;
        const db = parseInt(b.releaseDate) || 2023;
        return db - da;
      })
      .slice(0, 12);
  }, []);

  const now = new Date();
  const isNew = (date: string) => {
    const d = parseInt(date);
    if (!d) return false;
    const modelDate = new Date(d, 5);
    const diff = now.getTime() - modelDate.getTime();
    return diff < 180 * 24 * 60 * 60 * 1000; // 180 days ≈ 6 months
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold">Release Timeline</h3>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {models.map((model, i) => (
            <motion.div
              key={`${model.providerId}-${model.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3"
            >
              <div className="flex flex-col items-center shrink-0">
                <div className="h-2.5 w-2.5 rounded-full border-2 border-violet-500 bg-background" />
                {i < models.length - 1 && <div className="w-px h-6 bg-border" />}
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ backgroundColor: model.providerColor }}>
                  {model.providerName.charAt(0)}
                </div>
                <span className="text-xs font-medium truncate">{model.name}</span>
                {isNew(model.releaseDate) && (
                  <Badge className="text-[8px] h-4 bg-green-500/20 text-green-500 border-green-500/30 px-1">New</Badge>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{model.releaseDate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feature #10: Provider Documentation Links
// ---------------------------------------------------------------------------
function ProviderDocsLinks() {
  const providers = PROVIDERS.filter((p) => PROVIDER_DOCS[p.id]);

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold">Documentation</h3>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {providers.map((provider) => {
            const docs = PROVIDER_DOCS[provider.id];
            return (
              <div key={provider.id} className="p-2.5 rounded-lg border bg-card/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: provider.color }}>
                    {provider.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium">{provider.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <a href={docs.api} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors">
                    <Globe className="h-3 w-3" /> API Docs
                  </a>
                  <a href={docs.pricing} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors">
                    <DollarSign className="h-3 w-3" /> Pricing
                  </a>
                  <a href={docs.status} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors">
                    <Activity className="h-3 w-3" /> Status
                  </a>
                  <a href={docs.changelog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors">
                    <Clock className="h-3 w-3" /> Changelog
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Feature #1: Provider Comparison Dashboard (Radar Chart)
// ---------------------------------------------------------------------------
function ComparisonDashboard({ selectedProviders, onToggleProvider }: {
  selectedProviders: string[];
  onToggleProvider: (id: string) => void;
}) {
  const radarData = useMemo(() => {
    const dims = ['Models', 'Features', 'Uptime', 'Speed', 'Free Tier', 'Community'];
    return dims.map((dim) => {
      const point: Record<string, unknown> = { dimension: dim };
      for (const pid of selectedProviders) {
        const p = PROVIDERS.find((pr) => pr.id === pid);
        if (!p) continue;
        const health = PROVIDER_HEALTH[p.id];
        let score = 50;
        if (dim === 'Models') score = Math.min((p.models.length / 15) * 100, 100);
        if (dim === 'Features') score = Math.min((p.features.length / 8) * 100, 100);
        if (dim === 'Uptime') score = health?.uptime || 98;
        if (dim === 'Speed') score = health ? Math.max(100 - (health.latency / 15), 20) : 50;
        if (dim === 'Free Tier') score = p.models.filter((m) => m.pricing === 'Free' || m.pricing === 'Freemium').length > 0 ? 80 : 20;
        if (dim === 'Community') score = ['openai', 'anthropic', 'google'].includes(p.id) ? 95 : p.models.length > 5 ? 70 : 45;
        point[p.name] = Math.round(score);
      }
      return point;
    });
  }, [selectedProviders]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#f97316'];

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold">Comparison Dashboard</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">Select 2-4 providers</span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {PROVIDERS.slice(0, 12).map((p) => (
            <button
              key={p.id}
              onClick={() => onToggleProvider(p.id)}
              className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors cursor-pointer ${
                selectedProviders.includes(p.id)
                  ? 'text-white border-transparent'
                  : 'border text-muted-foreground hover:bg-accent'
              }`}
              style={selectedProviders.includes(p.id) ? { backgroundColor: p.color } : {}}
            >
              {p.name}
            </button>
          ))}
        </div>

        {selectedProviders.length >= 2 && (
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#888', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                {selectedProviders.map((pid, i) => {
                  const p = PROVIDERS.find((pr) => pr.id === pid);
                  if (!p) return null;
                  return (
                    <Radar
                      key={pid}
                      name={p.name}
                      dataKey={p.name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  );
                })}
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedProviders.length < 2 && (
          <div className="text-center py-8">
            <GitCompareArrows className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Select at least 2 providers to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Model Row (with favorites, tags, context visualizer, aliases)
// ---------------------------------------------------------------------------
function ModelRow({
  model,
  providerId,
  providerColor,
  providerName,
  onSelect,
  selected,
  onCompareCheck,
  isComparing,
  isFavorite,
  onToggleFavorite,
  alias,
}: {
  model: { id: string; name: string; category: ModelCategory; contextWindow: number; features: string[]; releaseDate: string; pricing: string };
  providerId: string;
  providerColor: string;
  providerName: string;
  onSelect: () => void;
  selected: boolean;
  onCompareCheck: (checked: boolean) => void;
  isComparing: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  alias?: string;
}) {
  const modelKey = `${providerId}::${model.id}`;
  const displayName = alias || model.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 bg-background/50"
    >
      {isComparing && (
        <Checkbox checked={false} onCheckedChange={onCompareCheck} className="shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {alias && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-[9px] text-muted-foreground cursor-default">{model.name}</span>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Alias for {model.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Badge variant="outline" className="text-[10px] shrink-0" style={{ borderColor: PIE_COLORS[model.category] || '#888', color: PIE_COLORS[model.category] || '#888' }}>
            {model.category}
          </Badge>
          {model.pricing === 'Free' && <Badge className="text-[9px] bg-green-500/20 text-green-500 border-green-500/30">Free</Badge>}
          {model.pricing === 'Freemium' && <Badge className="text-[9px] bg-blue-500/20 text-blue-500 border-blue-500/30">Freemium</Badge>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <ContextWindowBar contextWindow={model.contextWindow} />
          <span className="text-[10px] text-muted-foreground">{model.releaseDate}</span>
          <div className="flex gap-1">
            {model.features.slice(0, 4).map((f) => {
              const FIcon = FEATURE_ICONS[f];
              return FIcon ? (
                <TooltipProvider key={f}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="h-4 w-4 rounded bg-muted flex items-center justify-center">
                        <FIcon className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px]">{f}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null;
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onToggleFavorite} className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded transition-colors cursor-pointer">
          <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        </button>
        <Button size="sm" variant={selected ? 'secondary' : 'default'} className={`text-xs h-7 cursor-pointer ${selected ? '' : 'bg-violet-600 hover:bg-violet-500 text-white'}`} onClick={onSelect}>
          {selected ? <Check className="h-3 w-3 mr-1" /> : null}
          {selected ? 'Active' : 'Try Now'}
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Feature #5: Model Alias Dialog
// ---------------------------------------------------------------------------
function AliasDialog({ open, onClose, modelKey, currentAlias, onSave }: {
  open: boolean;
  onClose: () => void;
  modelKey: string;
  currentAlias?: string;
  onSave: (alias: string) => void;
}) {
  const [alias, setAlias] = useState(currentAlias || '');
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    if (open) {
      setAlias(currentAlias || '');
    }
    setPrevOpen(open);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Set Model Alias</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Model: <span className="font-mono">{modelKey}</span></p>
          <Input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder='e.g. "My Fast Model"' className="text-sm" />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="text-xs cursor-pointer" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs cursor-pointer" onClick={() => { onSave(alias); onClose(); }} disabled={!alias.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Feature #7: Model Tags Dialog
// ---------------------------------------------------------------------------
function TagsDialog({ open, onClose, modelKey, currentTags, onAddTag, onRemoveTag }: {
  open: boolean;
  onClose: () => void;
  modelKey: string;
  currentTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [newTag, setNewTag] = useState('');
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const p of PROVIDERS) {
      for (const m of p.models) {
        const key = `${p.id}::${m.id}`;
        const store = useVoiceDevStore.getState();
        (store.modelTags[key] || []).forEach((t: string) => tags.add(t));
      }
    }
    return Array.from(tags);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Model Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Model: <span className="font-mono">{modelKey}</span></p>
          <div className="flex gap-2">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder='e.g. "Best for Code"' className="text-sm flex-1" onKeyDown={(e) => {
              if (e.key === 'Enter' && newTag.trim()) { onAddTag(newTag.trim()); setNewTag(''); }
            }} />
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs cursor-pointer" onClick={() => { if (newTag.trim()) { onAddTag(newTag.trim()); setNewTag(''); } }}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {currentTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                  {tag}
                  <button onClick={() => onRemoveTag(tag)} className="hover:text-red-500 cursor-pointer"><X className="h-2.5 w-2.5" /></button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">Suggested: {allTags.slice(0, 5).join(', ')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Feature #6: Favorite Models Section
// ---------------------------------------------------------------------------
function FavoriteModelsSection({ onSelectModel }: { onSelectModel: (providerId: string, modelId: string) => void }) {
  const { favoriteModels, modelAliases } = useVoiceDevStore();
  const favoriteData = useMemo(() => {
    return favoriteModels.map((key) => {
      const [providerId, modelId] = key.split('::');
      const provider = PROVIDERS.find((p) => p.id === providerId);
      const model = provider?.models.find((m) => m.id === modelId);
      return { key, providerId, modelId, provider, model, alias: modelAliases[key] };
    }).filter((f) => f.provider && f.model);
  }, [favoriteModels, modelAliases]);

  if (favoriteData.length === 0) return null;

  return (
    <Card className="border-border/50 border-yellow-500/20 bg-yellow-500/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <h3 className="text-sm font-semibold">My Models</h3>
          <Badge variant="secondary" className="text-[10px]">{favoriteData.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {favoriteData.map((fav, i) => (
            <motion.div
              key={fav.key}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-2.5 rounded-lg border bg-card/50 hover:border-violet-500/30 transition-colors cursor-pointer"
              onClick={() => onSelectModel(fav.providerId, fav.modelId)}
            >
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: fav.provider!.color }}>
                {fav.provider!.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium truncate block">{fav.alias || fav.model!.name}</span>
                <span className="text-[10px] text-muted-foreground">{fav.provider!.name}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Comparison Modal
// ---------------------------------------------------------------------------
function ComparisonModal({
  models,
  open,
  onClose,
  onSelectModel,
}: {
  models: { model: typeof PROVIDERS[0]['models'][0]; providerName: string; providerColor: string }[];
  open: boolean;
  onClose: () => void;
  onSelectModel: (providerId: string, modelId: string) => void;
}) {
  if (models.length === 0) return null;

  const getBestFor = (model: typeof PROVIDERS[0]['models'][0]): string[] => {
    const bestFor: string[] = [];
    if (model.features.includes('Code')) bestFor.push('Programming');
    if (model.features.includes('Vision')) bestFor.push('Image Analysis');
    if (model.category === 'Reasoning') bestFor.push('Complex Reasoning');
    if (model.contextWindow >= 100000) bestFor.push('Long Documents');
    if (model.pricing === 'Free' || model.pricing === 'Freemium') bestFor.push('Budget-Friendly');
    return bestFor.slice(0, 3);
  };

  const getPros = (model: typeof PROVIDERS[0]['models'][0]): string[] => {
    const pros: string[] = [];
    if (model.contextWindow >= 100000) pros.push('Large context window');
    if (model.features.length >= 4) pros.push('Feature-rich');
    if (model.pricing === 'Free') pros.push('Completely free');
    if (model.category === 'Reasoning') pros.push('Advanced reasoning');
    if (model.releaseDate === '2025') pros.push('Latest release');
    return pros.slice(0, 3);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-violet-500" />
            Model Comparison
            <Badge variant="secondary" className="text-xs ml-2">{models.length} models</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {models.map(({ model, providerName, providerColor }) => (
            <motion.div key={model.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: providerColor }}>
                    {providerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{model.name}</h4>
                    <p className="text-xs text-muted-foreground">{providerName}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: PIE_COLORS[model.category], color: PIE_COLORS[model.category] }}>
                  {model.category}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Context Window</p>
                  <p className="font-semibold text-sm">{model.contextWindow.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Pricing</p>
                  <p className="font-semibold text-sm">{model.pricing}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Release</p>
                  <p className="font-semibold text-sm">{model.releaseDate}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Features</p>
                  <p className="font-semibold text-sm">{model.features.length}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">Benchmarks</p>
                {MODEL_BENCHMARKS[model.id] ? Object.entries(MODEL_BENCHMARKS[model.id]).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-16">{k}</span>
                    <Progress value={v} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-medium">{v}%</span>
                  </div>
                )) : <p className="text-[10px] text-muted-foreground">No benchmarks available</p>}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Features</p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((f) => <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>)}
                </div>
              </div>
              <div className="space-y-1">
                {getPros(model).map((pro) => (
                  <div key={pro} className="flex items-center gap-1.5 text-xs">
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                    {pro}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Best For</p>
                <div className="flex flex-wrap gap-1">
                  {getBestFor(model).map((use) => (
                    <Badge key={use} variant="outline" className="text-[10px] border-violet-500/30 text-violet-500">{use}</Badge>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white cursor-pointer" onClick={() => {
                const provider = PROVIDERS.find((p) => p.name === providerName);
                if (provider) onSelectModel(provider.id, model.id);
              }}>
                Try {model.name}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Providers Page Main
// ---------------------------------------------------------------------------
export default function ProvidersPage() {
  const {
    currentSessionId, setCurrentTab, createSession, chatSessions,
    favoriteModels, toggleFavoriteModel, modelAliases, modelTags, addModelTag, removeModelTag, apiKeys,
  } = useVoiceDevStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareChecked, setCompareChecked] = useState<Set<string>>(new Set());
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [aliasDialogOpen, setAliasDialogOpen] = useState(false);
  const [aliasModelKey, setAliasModelKey] = useState('');
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [tagsModelKey, setTagsModelKey] = useState('');
  const [selectedCompareProviders, setSelectedCompareProviders] = useState<string[]>(['openai', 'anthropic', 'google']);
  const [activeTab, setActiveTab] = useState('overview');

  // Persist tab filter
  const [customTags, setCustomTags] = useLocalStorage<string[]>('voicedev-tags', []);

  // Collect all used tags
  const allUsedTags = useMemo(() => {
    const tags = new Set<string>();
    for (const [key, tagsList] of Object.entries(modelTags)) {
      for (const t of tagsList) tags.add(t);
    }
    return Array.from(tags);
  }, [modelTags]);

  // Filter providers
  const filteredProviders = useMemo(() => {
    return PROVIDERS.filter((provider) => {
      const matchesSearch = !searchQuery ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.models.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || provider.models.some((m) => m.category === activeCategory);
      const matchesFree = !freeOnly || provider.models.some((m) => m.pricing === 'Free' || m.pricing === 'Freemium');
      const matchesTag = !tagFilter || provider.models.some((m) => {
        const key = `${provider.id}::${m.id}`;
        return (modelTags[key] || []).includes(tagFilter);
      });
      return matchesSearch && matchesCategory && matchesFree && matchesTag;
    });
  }, [searchQuery, activeCategory, freeOnly, tagFilter, modelTags]);

  // Recently used models
  const recentlyUsed = useMemo(() => {
    const recent: { providerId: string; modelId: string; providerName: string; modelName: string; providerColor: string }[] = [];
    const seen = new Set<string>();
    for (const session of chatSessions) {
      const key = `${session.provider}::${session.model}`;
      if (!seen.has(key) && session.messages.length > 0) {
        seen.add(key);
        const provider = PROVIDERS.find((p) => p.id === session.provider);
        const model = provider?.models.find((m) => m.id === session.model);
        if (provider && model) {
          recent.push({ providerId: session.provider, modelId: session.model, providerName: provider.name, modelName: model.name, providerColor: provider.color });
        }
      }
    }
    return recent.slice(0, 5);
  }, [chatSessions]);

  const toggleProvider = (id: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectModel = (providerId: string, modelId: string) => {
    if (currentSessionId) {
      const store = useVoiceDevStore.getState();
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId ? { ...s, provider: providerId, model: modelId, updatedAt: Date.now() } : s
      );
      store.setCurrentSession(currentSessionId);
    } else {
      createSession(providerId, modelId);
    }
    setCurrentTab('chat' as TabId);
  };

  const handleCompareCheck = (modelKey: string, checked: boolean | 'indeterminate') => {
    setCompareChecked((prev) => {
      const next = new Set(prev);
      if (checked) next.add(modelKey); else next.delete(modelKey);
      return next;
    });
  };

  const comparisonModels = useMemo(() => {
    return Array.from(compareChecked).map((key) => {
      const [providerId, modelId] = key.split('::');
      const provider = PROVIDERS.find((p) => p.id === providerId);
      const model = provider?.models.find((m) => m.id === modelId);
      return { model: model!, providerName: provider?.name || '', providerColor: provider?.color || '#888' };
    }).filter((x) => x.model);
  }, [compareChecked]);

  const currentSession = useVoiceDevStore((s) => s.chatSessions.find((cs) => cs.id === s.currentSessionId));

  // Handle model row right-click context
  const handleSetAlias = (modelKey: string) => {
    setAliasModelKey(modelKey);
    setAliasDialogOpen(true);
  };

  const handleOpenTags = (modelKey: string) => {
    setTagsModelKey(modelKey);
    setTagsDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Providers</h1>
            <p className="text-sm text-muted-foreground">Explore and manage your AI providers and models</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={compareMode ? 'default' : 'outline'} size="sm" className={`gap-2 cursor-pointer ${compareMode ? 'bg-violet-600 text-white' : ''}`} onClick={() => {
              if (compareMode) { setCompareMode(false); setCompareChecked(new Set()); } else { setCompareMode(true); }
            }}>
              <GitCompareArrows className="h-3.5 w-3.5" />
              Compare
            </Button>
          </div>
        </div>
        <QuickStats />
      </div>

      {/* Tab Navigation */}
      <div className="border-b px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Overview</TabsTrigger>
            <TabsTrigger value="compare" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Compare</TabsTrigger>
            <TabsTrigger value="benchmarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Benchmarks</TabsTrigger>
            <TabsTrigger value="costs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Cost Calculator</TabsTrigger>
            <TabsTrigger value="health" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Health</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Timeline</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2 px-3 cursor-pointer">Docs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 space-y-6">

          {/* Favorite Models */}
          <FavoriteModelsSection onSelectModel={handleSelectModel} />

          {activeTab === 'overview' && (
            <>
              {/* Chart + Trending + Recently Used */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-2 text-center">Model Distribution</h3>
                    <CategoryChart />
                  </CardContent>
                </Card>
                <div className="lg:col-span-2 space-y-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <TrendingModels onSelectModel={handleSelectModel} />
                    </CardContent>
                  </Card>
                  {recentlyUsed.length > 0 && (
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-violet-500" />
                            <h3 className="text-sm font-semibold">Recently Used</h3>
                          </div>
                          <div className="space-y-1.5">
                            {recentlyUsed.map((item) => (
                              <div key={item.providerId + item.modelId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => handleSelectModel(item.providerId, item.modelId)}>
                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: item.providerColor }}>
                                  {item.providerName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium">{item.modelName}</span>
                                  <span className="text-[10px] text-muted-foreground ml-2">{item.providerName}</span>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Category Chips + Search + Filters + Tag Filter */}
              <div className="space-y-3">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${activeCategory === cat.value ? 'bg-violet-600 text-white' : 'border text-muted-foreground hover:bg-accent'}`}>
                        <CatIcon className="h-3 w-3" />
                        {cat.label}
                      </button>
                    );
                  })}
                  <button onClick={() => setFreeOnly(!freeOnly)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${freeOnly ? 'bg-green-600 text-white' : 'border border-green-500/30 text-green-500 hover:bg-green-500/10'}`}>
                    <Star className="h-3 w-3" /> Free Only
                  </button>
                </div>

                {/* Tag filter */}
                {allUsedTags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => setTagFilter(null)} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer ${!tagFilter ? 'bg-violet-600 text-white' : 'border text-muted-foreground hover:bg-accent'}`}>
                      All Tags
                    </button>
                    {allUsedTags.map((tag) => (
                      <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)} className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer ${tagFilter === tag ? 'bg-violet-600 text-white' : 'border text-muted-foreground hover:bg-accent'}`}>
                        <Tag className="h-2.5 w-2.5 inline mr-1" />{tag}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search providers and models..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
                </div>
              </div>

              {/* Provider Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProviders.map((provider) => {
                  const isExpanded = expandedProviders.has(provider.id);
                  const filteredModels = provider.models.filter(
                    (m) =>
                      (activeCategory === 'All' || m.category === activeCategory) &&
                      (!searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
                      (!freeOnly || m.pricing === 'Free' || m.pricing === 'Freemium') &&
                      (!tagFilter || (modelTags[`${provider.id}::${m.id}`] || []).includes(tagFilter))
                  );
                  if (filteredModels.length === 0) return null;

                  return (
                    <Card key={provider.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <button onClick={() => toggleProvider(provider.id)} className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                          <motion.div whileHover={{ scale: 1.1 }} className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 relative" style={{ backgroundColor: provider.color }}>
                            {provider.name.charAt(0)}
                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card" style={{ backgroundColor: PROVIDER_HEALTH[provider.id]?.status === 'green' ? '#10b981' : PROVIDER_HEALTH[provider.id]?.status === 'yellow' ? '#f59e0b' : '#ef4444' }}>
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full" style={{ backgroundColor: PROVIDER_HEALTH[provider.id]?.status === 'green' ? '#10b981' : PROVIDER_HEALTH[provider.id]?.status === 'yellow' ? '#f59e0b' : '#ef4444' }} />
                            </div>
                          </motion.div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{provider.name}</span>
                              <Badge variant="secondary" className="text-[10px] shrink-0">{filteredModels.length} models</Badge>
                            </div>
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {provider.features.slice(0, 5).map((f) => {
                                const FIcon = FEATURE_ICONS[f];
                                return FIcon ? (
                                  <TooltipProvider key={f}>
                                    <Tooltip>
                                      <TooltipTrigger><div className="h-5 w-5 rounded bg-muted flex items-center justify-center"><FIcon className="h-3 w-3 text-muted-foreground" /></div></TooltipTrigger>
                                      <TooltipContent className="text-[10px]">{f}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="shrink-0">
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t">
                              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {filteredModels.map((model) => {
                                  const modelKey = `${provider.id}::${model.id}`;
                                  const isActive = currentSession?.provider === provider.id && currentSession?.model === model.id;
                                  const isFav = favoriteModels.includes(modelKey);
                                  const alias = modelAliases[modelKey];
                                  const tags = modelTags[modelKey] || [];
                                  return (
                                    <div key={model.id} className="relative group">
                                      <ModelRow
                                        model={model}
                                        providerId={provider.id}
                                        providerColor={provider.color}
                                        providerName={provider.name}
                                        selected={isActive}
                                        onSelect={() => handleSelectModel(provider.id, model.id)}
                                        onCompareCheck={(checked) => handleCompareCheck(modelKey, checked)}
                                        isComparing={compareMode}
                                        isFavorite={isFav}
                                        onToggleFavorite={() => toggleFavoriteModel(modelKey)}
                                        alias={alias}
                                      />
                                      {/* Tags display */}
                                      {tags.length > 0 && (
                                        <div className="px-4 pb-1.5 flex gap-1 flex-wrap">
                                          {tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-[9px] border-violet-500/30 text-violet-500" style={{ borderColor: TAG_COLORS[tags.indexOf(tag) % TAG_COLORS.length] + '60', color: TAG_COLORS[tags.indexOf(tag) % TAG_COLORS.length] }}>
                                              <Tag className="h-2 w-2 mr-0.5" />{tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                      {/* Action buttons on hover */}
                                      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 z-10">
                                        <button onClick={(e) => { e.stopPropagation(); handleSetAlias(modelKey); }} className="h-6 w-6 flex items-center justify-center bg-background border rounded hover:bg-accent transition-colors cursor-pointer" title="Set Alias">
                                          <span className="text-[9px] font-bold">A</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenTags(modelKey); }} className="h-6 w-6 flex items-center justify-center bg-background border rounded hover:bg-accent transition-colors cursor-pointer" title="Manage Tags">
                                          <Tag className="h-2.5 w-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredProviders.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No providers or models found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'compare' && (
            <ComparisonDashboard selectedProviders={selectedCompareProviders} onToggleProvider={(id) => {
              setSelectedCompareProviders((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 4 ? [...prev, id] : prev);
            }} />
          )}

          {activeTab === 'benchmarks' && <ModelBenchmarks />}
          {activeTab === 'costs' && <CostCalculator />}
          {activeTab === 'health' && <ProviderHealthMonitor apiKeys={apiKeys} />}
          {activeTab === 'timeline' && <ReleaseTimeline />}
          {activeTab === 'docs' && <ProviderDocsLinks />}
        </div>
      </div>

      {/* Compare floating button */}
      {compareMode && compareChecked.size >= 2 && (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed bottom-24 md:bottom-8 right-8 z-30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 cursor-pointer" onClick={() => setComparisonOpen(true)}>
                  <GitCompareArrows className="h-4 w-4 mr-2" />
                  Compare ({compareChecked.size})
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare selected models</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}

      {compareMode && compareChecked.size < 2 && (
        <div className="fixed bottom-24 md:bottom-8 right-8 z-30">
          <Button variant="ghost" size="sm" className="text-xs cursor-pointer" onClick={() => { setCompareMode(false); setCompareChecked(new Set()); }}>
            Cancel
          </Button>
        </div>
      )}

      <ComparisonModal models={comparisonModels} open={comparisonOpen} onClose={() => setComparisonOpen(false)} onSelectModel={handleSelectModel} />

      <AliasDialog open={aliasDialogOpen} onClose={() => setAliasDialogOpen(false)} modelKey={aliasModelKey} currentAlias={modelAliases[aliasModelKey]} onSave={(alias) => {
        if (alias.trim()) {
          useVoiceDevStore.getState().setModelAlias(alias.trim(), aliasModelKey);
          toast.success(`Alias "${alias.trim()}" set`);
        }
      }} />

      <TagsDialog open={tagsDialogOpen} onClose={() => setTagsDialogOpen(false)} modelKey={tagsModelKey} currentTags={modelTags[tagsModelKey] || []} onAddTag={(tag) => { addModelTag(tagsModelKey, tag); toast.success(`Tag "${tag}" added`); }} onRemoveTag={(tag) => { removeModelTag(tagsModelKey, tag); }} />
    </div>
  );
}
