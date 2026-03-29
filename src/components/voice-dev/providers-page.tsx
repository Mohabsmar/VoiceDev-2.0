'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Settings,
  Check,
  Layers,
  Brain,
  Zap,
  Eye,
  Image,
  Mic,
  Database,
  Puzzle,
  GitCompareArrows,
  Sparkles,
} from 'lucide-react';
import { PROVIDERS, getTotalModelCount } from '@/lib/providers';
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
const CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: 'All', label: 'All', color: '#8b5cf6' },
  { value: 'LLM', label: 'LLM', color: '#3b82f6' },
  { value: 'Reasoning', label: 'Reasoning', color: '#f59e0b' },
  { value: 'Vision', label: 'Vision', color: '#10b981' },
  { value: 'Image', label: 'Image', color: '#ec4899' },
  { value: 'TTS', label: 'TTS', color: '#f97316' },
  { value: 'ASR', label: 'ASR', color: '#06b6d4' },
  { value: 'Embedding', label: 'Embedding', color: '#8b5cf6' },
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

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
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
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground">
            {(model.contextWindow / 1000).toFixed(0)}k context
          </span>
          <span className="text-[10px] text-muted-foreground">
            {model.releaseDate}
          </span>
          <Badge
            variant="secondary"
            className="text-[10px]"
          >
            {model.pricing}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={selected ? 'secondary' : 'default'}
          className={`text-xs h-7 cursor-pointer ${selected ? '' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}
          onClick={onSelect}
        >
          {selected ? 'Active' : 'Select'}
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Comparison Modal
// ---------------------------------------------------------------------------
function ComparisonModal({
  models,
  open,
  onClose,
}: {
  models: { model: typeof PROVIDERS[0]['models'][0]; providerName: string; providerColor: string }[];
  open: boolean;
  onClose: () => void;
}) {
  if (models.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-violet-500" />
            Model Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Property</th>
                {models.map(({ model, providerName, providerColor }) => (
                  <th key={model.id} className="text-left py-2 px-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: providerColor }}
                      />
                      <span className="font-medium text-xs">{model.name}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">{providerName}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2.5 pr-4 text-muted-foreground">Category</td>
                {models.map(({ model }) => (
                  <td key={model.id} className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: PIE_COLORS[model.category], color: PIE_COLORS[model.category] }}>
                      {model.category}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 pr-4 text-muted-foreground">Context Window</td>
                {models.map(({ model }) => (
                  <td key={model.id} className="py-2.5 px-3 font-medium">
                    {model.contextWindow.toLocaleString()} tokens
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 pr-4 text-muted-foreground">Pricing</td>
                {models.map(({ model }) => (
                  <td key={model.id} className="py-2.5 px-3">
                    <Badge variant="secondary" className="text-xs">{model.pricing}</Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 pr-4 text-muted-foreground">Release</td>
                {models.map(({ model }) => (
                  <td key={model.id} className="py-2.5 px-3">{model.releaseDate}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-muted-foreground">Features</td>
                {models.map(({ model }) => (
                  <td key={model.id} className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {model.features.map((f) => (
                        <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Providers Page
// ---------------------------------------------------------------------------
export default function ProvidersPage() {
  const { currentSessionId, setCurrentTab, setCurrentSession, createSession } = useVoiceDevStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareChecked, setCompareChecked] = useState<Set<string>>(new Set());
  const [comparisonOpen, setComparisonOpen] = useState(false);

  // Chart data
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const provider of PROVIDERS) {
      for (const model of provider.models) {
        counts[model.category] = (counts[model.category] || 0) + 1;
      }
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const categoryCount = new Set(
    PROVIDERS.flatMap((p) => p.models.map((m) => m.category))
  ).size;

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
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

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
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-4">
        <h1 className="text-2xl font-bold mb-4">AI Providers</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 max-w-2xl">
          <StatCard
            icon={Layers}
            label="Total Providers"
            value={`${PROVIDERS.length}+`}
            color="#8b5cf6"
          />
          <StatCard
            icon={Brain}
            label="Total Models"
            value={`${getTotalModelCount()}+`}
            color="#3b82f6"
          />
          <StatCard
            icon={Sparkles}
            label="Categories"
            value={`${categoryCount}`}
            color="#10b981"
          />
        </div>

        {/* Doughnut Chart */}
        <div className="mb-4 flex justify-center">
          <div className="w-[280px] h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[entry.name] || '#888'}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.value
                  ? 'bg-violet-600 text-white'
                  : 'border text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
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
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {filteredProviders.map((provider) => {
            const isExpanded = expandedProviders.has(provider.id);
            const filteredModels = provider.models.filter(
              (m) =>
                (activeCategory === 'All' || m.category === activeCategory) &&
                (!searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            return (
              <Card key={provider.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Provider Header */}
                  <button
                    onClick={() => toggleProvider(provider.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: provider.color }}
                    >
                      {provider.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {provider.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {provider.models.length} models
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {provider.features.slice(0, 4).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {f}
                          </span>
                        ))}
                        {provider.features.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{provider.features.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
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

      {/* Compare mode toggle */}
      <div className="fixed bottom-24 md:bottom-8 right-8 z-30">
        {!compareMode ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full shadow-lg cursor-pointer"
                  onClick={() => setCompareMode(true)}
                >
                  <GitCompareArrows className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare models</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : compareChecked.size < 2 ? null : null}
      </div>

      {/* Cancel compare mode */}
      {compareMode && (
        <div className="fixed bottom-24 md:bottom-16 right-8 z-30">
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
      />
    </div>
  );
}
