'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
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
  Filter,
  ArrowRight,
  MessageSquare,
  Bot,
  Code2,
} from 'lucide-react';
import { PROVIDERS, getTotalModelCount, getAllModels } from '@/lib/providers';
import { useVoiceDevStore } from '@/lib/store';
import type { ModelCategory, TabId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  Legend,
} from 'recharts';

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
// Doughnut Chart with hover details
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
      <div className="w-[300px] h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={PIE_COLORS[entry.name] || '#888'}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number, name: string) => [`${value} models`, name]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PIE_COLORS[entry.name] || '#888' }}
            />
            <span className="text-[10px] text-muted-foreground">
              {entry.name} ({entry.value})
            </span>
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
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: item.color }}
            >
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
// Model Row
// ---------------------------------------------------------------------------
function ModelRow({
  model,
  providerId,
  providerColor,
  onSelect,
  selected,
  onCompareCheck,
  isComparing,
}: {
  model: { id: string; name: string; category: ModelCategory; contextWindow: number; features: string[]; releaseDate: string; pricing: string };
  providerId: string;
  providerColor: string;
  onSelect: () => void;
  selected: boolean;
  onCompareCheck: (checked: boolean) => void;
  isComparing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 bg-background/50"
    >
      {isComparing && (
        <Checkbox
          checked={onCompareCheck as unknown as boolean}
          onCheckedChange={onCompareCheck}
          className="shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{model.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] shrink-0"
            style={{ borderColor: PIE_COLORS[model.category] || '#888', color: PIE_COLORS[model.category] || '#888' }}
          >
            {model.category}
          </Badge>
          {model.pricing === 'Free' && (
            <Badge className="text-[9px] bg-green-500/20 text-green-500 border-green-500/30">Free</Badge>
          )}
          {model.pricing === 'Freemium' && (
            <Badge className="text-[9px] bg-blue-500/20 text-blue-500 border-blue-500/30">Freemium</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground">
            {(model.contextWindow / 1000).toFixed(0)}k context
          </span>
          <span className="text-[10px] text-muted-foreground">{model.releaseDate}</span>
          {/* Feature icons */}
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
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={selected ? 'secondary' : 'default'}
          className={`text-xs h-7 cursor-pointer ${selected ? '' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}
          onClick={onSelect}
        >
          {selected ? <Check className="h-3 w-3 mr-1" /> : null}
          {selected ? 'Active' : 'Try Now'}
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Comparison Modal (enhanced with cards)
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
    if (model.features.includes('Function Calling')) bestFor.push('Tool Use');
    if (model.pricing === 'Free' || model.pricing === 'Freemium') bestFor.push('Budget-Friendly');
    if (model.features.includes('Streaming')) bestFor.push('Real-time Chat');
    return bestFor.slice(0, 3);
  };

  const getPros = (model: typeof PROVIDERS[0]['models'][0]): string[] => {
    const pros: string[] = [];
    if (model.contextWindow >= 100000) pros.push('Large context window');
    if (model.features.length >= 4) pros.push('Feature-rich');
    if (model.pricing === 'Free') pros.push('Completely free');
    if (model.pricing === 'Freemium') pros.push('Free tier available');
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
            <Badge variant="secondary" className="text-xs ml-2">
              {models.length} models
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Side-by-side cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {models.map(({ model, providerName, providerColor }) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-5 space-y-4"
            >
              {/* Model Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: providerColor }}
                    >
                      {providerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{model.name}</h4>
                      <p className="text-xs text-muted-foreground">{providerName}</p>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{ borderColor: PIE_COLORS[model.category], color: PIE_COLORS[model.category] }}
                >
                  {model.category}
                </Badge>
              </div>

              {/* Stats */}
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

              {/* Features */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Features</p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              </div>

              {/* Pros */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Pros</p>
                <div className="space-y-1">
                  {getPros(model).map((pro) => (
                    <div key={pro} className="flex items-center gap-1.5 text-xs">
                      <Check className="h-3 w-3 text-green-500 shrink-0" />
                      {pro}
                    </div>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">Best For</p>
                <div className="flex flex-wrap gap-1">
                  {getBestFor(model).map((use) => (
                    <Badge key={use} variant="outline" className="text-[10px] border-violet-500/30 text-violet-500">
                      {use}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Try Now button */}
              <Button
                className="w-full bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                onClick={() => {
                  const provider = PROVIDERS.find((p) => p.name === providerName);
                  if (provider) onSelectModel(provider.id, model.id);
                }}
              >
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
// Providers Page
// ---------------------------------------------------------------------------
export default function ProvidersPage() {
  const { currentSessionId, setCurrentTab, setCurrentSession, createSession, chatSessions } = useVoiceDevStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareChecked, setCompareChecked] = useState<Set<string>>(new Set());
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);

  // Filter providers
  const filteredProviders = useMemo(() => {
    return PROVIDERS.filter((provider) => {
      const matchesSearch =
        !searchQuery ||
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.models.some((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        activeCategory === 'All' ||
        provider.models.some((m) => m.category === activeCategory);
      const matchesFree = !freeOnly || provider.models.some((m) => m.pricing === 'Free' || m.pricing === 'Freemium');
      return matchesSearch && matchesCategory && matchesFree;
    });
  }, [searchQuery, activeCategory, freeOnly]);

  // Recently used models
  const recentlyUsed = useMemo(() => {
    const recent: { providerId: string; modelId: string; providerName: string; modelName: string; providerColor: string; timestamp: number }[] = [];
    const seen = new Set<string>();
    for (const session of chatSessions) {
      const key = `${session.provider}::${session.model}`;
      if (!seen.has(key) && session.messages.length > 0) {
        seen.add(key);
        const provider = PROVIDERS.find((p) => p.id === session.provider);
        const model = provider?.models.find((m) => m.id === session.model);
        if (provider && model) {
          recent.push({
            providerId: session.provider,
            modelId: session.model,
            providerName: provider.name,
            modelName: model.name,
            providerColor: provider.color,
            timestamp: session.updatedAt,
          });
        }
      }
    }
    return recent.slice(0, 5);
  }, [chatSessions]);

  const toggleProvider = (id: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectModel = (providerId: string, modelId: string) => {
    if (currentSessionId) {
      const store = useVoiceDevStore.getState();
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, provider: providerId, model: modelId, updatedAt: Date.now() }
          : s
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
      if (checked) next.add(modelKey);
      else next.delete(modelKey);
      return next;
    });
  };

  const comparisonModels = useMemo(() => {
    return Array.from(compareChecked).map((key) => {
      const [providerId, modelId] = key.split('::');
      const provider = PROVIDERS.find((p) => p.id === providerId);
      const model = provider?.models.find((m) => m.id === modelId);
      return {
        model: model!,
        providerName: provider?.name || '',
        providerColor: provider?.color || '#888',
      };
    }).filter(Boolean);
  }, [compareChecked]);

  // Get current active model
  const currentSession = useVoiceDevStore((s) => s.chatSessions.find((cs) => cs.id === s.currentSessionId));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Providers</h1>
            <p className="text-sm text-muted-foreground">Explore and manage your AI providers and models</p>
          </div>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            className={`gap-2 cursor-pointer ${compareMode ? 'bg-violet-600 text-white' : ''}`}
            onClick={() => {
              if (compareMode) {
                setCompareMode(false);
                setCompareChecked(new Set());
              } else {
                setCompareMode(true);
              }
            }}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            Compare
          </Button>
        </div>

        {/* Quick Stats Banner */}
        <QuickStats />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 space-y-6">

          {/* Chart + Trending + Recently Used */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Doughnut Chart */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2 text-center">Model Distribution</h3>
                <CategoryChart />
              </CardContent>
            </Card>

            {/* Trending + Recently Used */}
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
                          <div
                            key={item.providerId + item.modelId}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                            onClick={() => handleSelectModel(item.providerId, item.modelId)}
                          >
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: item.providerColor }}
                            >
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

          {/* Category Chips + Search + Filters */}
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      activeCategory === cat.value
                        ? 'bg-violet-600 text-white'
                        : 'border text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <CatIcon className="h-3 w-3" />
                    {cat.label}
                  </button>
                );
              })}
              <button
                onClick={() => setFreeOnly(!freeOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  freeOnly
                    ? 'bg-green-600 text-white'
                    : 'border border-green-500/30 text-green-500 hover:bg-green-500/10'
                }`}
              >
                <Star className="h-3 w-3" />
                Free Only
              </button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers and models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
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
                  (!freeOnly || m.pricing === 'Free' || m.pricing === 'Freemium')
              );

              if (filteredModels.length === 0) return null;

              return (
                <Card key={provider.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Provider Header */}
                    <button
                      onClick={() => toggleProvider(provider.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 relative"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.name.charAt(0)}
                        {/* Status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-green-500"
                          />
                        </div>
                      </motion.div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{provider.name}</span>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {filteredModels.length} models
                          </Badge>
                        </div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {provider.features.slice(0, 5).map((f) => {
                            const FIcon = FEATURE_ICONS[f];
                            return FIcon ? (
                              <TooltipProvider key={f}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                                      <FIcon className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">{f}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span
                                key={f}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                              >
                                {f}
                              </span>
                            );
                          })}
                          {provider.features.length > 5 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{provider.features.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="shrink-0"
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </button>

                    {/* Expanded Model List */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t"
                        >
                          <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {filteredModels.map((model) => {
                              const modelKey = `${provider.id}::${model.id}`;
                              const isActive =
                                currentSession?.provider === provider.id &&
                                currentSession?.model === model.id;
                              return (
                                <ModelRow
                                  key={model.id}
                                  model={model}
                                  providerId={provider.id}
                                  providerColor={provider.color}
                                  selected={isActive}
                                  onSelect={() => handleSelectModel(provider.id, model.id)}
                                  onCompareCheck={(checked) =>
                                    handleCompareCheck(modelKey, checked)
                                  }
                                  isComparing={compareMode}
                                />
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

          {/* No results */}
          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No providers or models found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Compare button */}
      <TooltipProvider>
        {compareMode && compareChecked.size >= 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed bottom-24 md:bottom-8 right-8 z-30"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 cursor-pointer"
                  onClick={() => setComparisonOpen(true)}
                >
                  <GitCompareArrows className="h-4 w-4 mr-2" />
                  Compare ({Math.min(compareChecked.size, 4)})
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare selected models</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </TooltipProvider>

      {/* Cancel compare mode */}
      {compareMode && compareChecked.size < 2 && (
        <div className="fixed bottom-24 md:bottom-8 right-8 z-30 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs cursor-pointer"
            onClick={() => {
              setCompareMode(false);
              setCompareChecked(new Set());
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <ComparisonModal
        models={comparisonModels}
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
}
