'use client';

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  ExternalLink,
  Package,
  Star,
  Check,
  Sparkles,
  Filter,
  ArrowUpDown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  TrendingUp,
  FolderOpen,
  FileText,
  Trash2,
  Eye,
  Zap,
  PackageOpen,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceDevStore } from '@/lib/store';
import { BUILTIN_TOOLS, BUILTIN_SKILLS } from '@/lib/providers';
import type { MarketPlaceItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// ===========================================================================
// Constants
// ===========================================================================

const CATEGORY_FILTERS: Record<string, string[]> = {
  smithery: ['All', 'File System', 'Network', 'System', 'Database', 'Git', 'Browser', 'AI', 'Voice', 'Data'],
  clawhub: ['All', 'Automation', 'Development', 'Data', 'Research', 'Security', 'AI'],
  huggingface: ['All', 'text-generation', 'text2text-generation', 'image-classification', 'automatic-speech-recognition', 'feature-extraction', 'text-to-image', 'translation', 'summarization'],
  npm: ['All', 'react', 'next', 'typescript', 'node', 'css', 'testing', 'state', 'ui', 'api', 'auth', 'database'],
  pypi: ['All', 'machine-learning', 'deep-learning', 'data-science', 'web', 'api', 'testing', 'devops', 'security', 'visualization'],
  github: ['All', 'AI Tool', 'Agent', 'Automation', 'LLM', 'MCP', 'RAG', 'Voice'],
};

const SOURCE_BADGE_COUNTS: Record<string, string> = {
  smithery: 'Live',
  clawhub: '50+',
  huggingface: '500K+',
  npm: '2M+',
  pypi: '500K+',
  github: '300M+',
  builtin: '54',
};

const SOURCE_LABELS: Record<string, string> = {
  smithery: 'Smithery',
  clawhub: 'ClawHub',
  huggingface: 'HuggingFace',
  npm: 'npm',
  pypi: 'PyPI',
  github: 'GitHub',
  builtin: 'Built-in',
};

// ===========================================================================
// Lucide Icon Map for Built-in Tools/Skills
// ===========================================================================

import {
  FileEdit, Copy, FolderInput, PenLine, Hash, Monitor, Pointer, Camera,
  Terminal, Code, Braces, Key, List, Activity,
  Globe, Send, Scissors,
  Regex, CheckCircle,
  GitBranch, GitCommit, GitMerge, GitCompare,
  Lock, KeyRound, ShieldCheck as ShieldCheckIcon,
  Database as DatabaseIcon, HardDrive,
  Brain, FileText as FileTextIcon, Tags,
  Sparkles as SparklesIcon,
  Volume2, Mic,
  SearchCode, Bug, RefreshCw, TestTube, Rocket,
  BarChart3, PieChart, Workflow,
  BookOpen, GraduationCap,
  Cog,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText: FileText,
  FileEdit: FileEdit,
  Trash2: Trash2,
  Copy: Copy,
  FolderInput: FolderInput,
  PenLine: PenLine,
  Search: Search,
  Hash: Hash,
  Eye: Eye,
  Shield: Shield,
  Terminal: Terminal,
  Code: Code,
  Braces: Braces,
  Key: Key,
  List: List,
  Activity: Activity,
  Globe: Globe,
  Send: Send,
  Scissors: Scissors,
  Zap: Zap,
  Filter: Filter,
  Regex: Regex,
  CheckCircle: CheckCircle,
  GitBranch: GitBranch,
  GitCommit: GitCommit,
  GitMerge: GitMerge,
  GitCompare: GitCompare,
  Lock: Lock,
  KeyRound: KeyRound,
  ShieldCheck: ShieldCheckIcon,
  Database: DatabaseIcon,
  HardDrive: HardDrive,
  Brain: Brain,
  Tags: Tags,
  Sparkles: SparklesIcon,
  Volume2: Volume2,
  Mic: Mic,
  Monitor: Monitor,
  Pointer: Pointer,
  Camera: Camera,
  SearchCode: SearchCode,
  Bug: Bug,
  RefreshCw: RefreshCw,
  TestTube: TestTube,
  Rocket: Rocket,
  BarChart3: BarChart3,
  PieChart: PieChart,
  Workflow: Workflow,
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  Cog: Cog,
  Clock: Clock,
  FileTextIcon: FileTextIcon,
  SparklesIcon: SparklesIcon,
};

// ===========================================================================
// Helpers
// ===========================================================================

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="font-bold text-violet-400">{part}</span>
    ) : (
      part
    )
  );
}

function getSecurityLevel(item: MarketPlaceItem): 'builtin' | 'trusted' | 'unknown' {
  if (item.source === 'builtin') return 'builtin';
  if (item.downloads > 10000) return 'trusted';
  return 'unknown';
}

function SecurityShield({ level }: { level: 'builtin' | 'trusted' | 'unknown' }) {
  if (level === 'builtin') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
          </TooltipTrigger>
          <TooltipContent>Built-in – fully verified</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (level === 'trusted') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Shield className="h-3.5 w-3.5 text-yellow-400" />
          </TooltipTrigger>
          <TooltipContent>Popular – community trusted</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>Unknown security profile</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'File System': '📁',
    'System': '⚙️',
    'Network': '🌐',
    'Data': '📊',
    'Git': '🔀',
    'Security': '🔒',
    'Database': '🗄️',
    'AI': '🤖',
    'Voice': '🎙️',
    'Browser': '🖥️',
    'Development': '💻',
    'Research': '📚',
    'Automation': '⚡',
    'text-generation': '✍️',
    'text2text-generation': '🔄',
    'image-classification': '🖼️',
    'automatic-speech-recognition': '🗣️',
    'feature-extraction': '🔬',
    'text-to-image': '🎨',
    'translation': '🌍',
    'summarization': '📝',
  };
  return map[category] || '📦';
}

// ===========================================================================
// Recently Viewed Hook (localStorage)
// ===========================================================================

const RV_KEY = 'voicedev-recently-viewed';
const FAV_KEY = 'voicedev-favorites';
const SEARCH_KEY = 'voicedev-recent-searches';

function useRecentlyViewed() {
  const [items, setItems] = useState<MarketPlaceItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RV_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addViewed = useCallback((item: MarketPlaceItem) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 20);
      localStorage.setItem(RV_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearViewed = useCallback(() => {
    setItems([]);
    localStorage.removeItem(RV_KEY);
  }, []);

  return { items, addViewed, clearViewed };
}

function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setIds(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { ids, toggleFavorite };
}

function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 8);
      localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    localStorage.removeItem(SEARCH_KEY);
  }, []);

  return { searches, addSearch, removeSearch, clearSearches };
}

// ===========================================================================
// Item Card Skeleton
// ===========================================================================

function ItemCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-8 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

// ===========================================================================
// Featured Carousel
// ===========================================================================

function FeaturedCarousel({
  items,
  onSelect,
  onInstall,
}: {
  items: MarketPlaceItem[];
  onSelect: (item: MarketPlaceItem) => void;
  onInstall: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featured = useMemo(() => {
    return [...items]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 8);
  }, [items]);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 320;
    scrollRef.current.scrollTo({ left: index * (cardWidth + 16), behavior: 'smooth' });
    setCurrentIndex(index);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (isPaused || featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % featured.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, featured.length, scrollToIndex]);

  if (featured.length === 0) return null;

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold">Featured & Popular</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              const idx = currentIndex === 0 ? featured.length - 1 : currentIndex - 1;
              scrollToIndex(idx);
              setCurrentIndex(idx);
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              const idx = (currentIndex + 1) % featured.length;
              scrollToIndex(idx);
              setCurrentIndex(idx);
            }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featured.map((item, index) => {
          const isInstalled = false; // Will use real store
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="shrink-0 w-80"
            >
              <Card
                className="cursor-pointer hover:border-violet-500/50 transition-all group relative overflow-hidden"
                onClick={() => onSelect(item)}
              >
                {/* Featured badge */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-amber-500/90 text-white text-[10px] border-0">
                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                    Featured
                  </Badge>
                </div>
                {/* Gradient accent */}
                <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-lg shrink-0">
                      {getCategoryEmoji(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.author}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {formatNumber(item.downloads)}
                    </span>
                    {item.stars !== undefined && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {formatNumber(item.stars)}
                      </span>
                    )}
                    {item.version && (
                      <Badge variant="outline" className="text-[10px] h-4">
                        v{item.version}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="text-xs h-7 flex-1 bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onInstall(item.id); }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Install
                    </Button>
                    <Badge variant="secondary" className="text-[10px]">
                      {SOURCE_LABELS[item.source] || item.source}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {featured.map((_, i) => (
          <button
            key={i}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === currentIndex ? 'w-4 bg-violet-500' : 'w-1.5 bg-muted-foreground/30'
            }`}
            onClick={() => { scrollToIndex(i); setCurrentIndex(i); }}
          />
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Category Filter Chips
// ===========================================================================

function CategoryFilterChips({
  source,
  activeFilter,
  onFilterChange,
}: {
  source: string;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  const categories = CATEGORY_FILTERS[source] || ['All'];

  return (
    <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      {categories.map((cat) => (
        <motion.button
          key={cat}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(cat)}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
            activeFilter === cat
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {cat === 'All' ? 'All' : cat}
        </motion.button>
      ))}
    </div>
  );
}

// ===========================================================================
// Recently Viewed Section
// ===========================================================================

function RecentlyViewedSection({
  items,
  onSelect,
  onClear,
}: {
  items: MarketPlaceItem[];
  onSelect: (item: MarketPlaceItem) => void;
  onClear: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Recently Viewed</h3>
          <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground cursor-pointer" onClick={onClear}>
          Clear
        </Button>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            className="shrink-0 w-48"
          >
            <Card
              className="cursor-pointer hover:border-violet-500/40 transition-colors"
              onClick={() => onSelect(item)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getCategoryEmoji(item.category)}</span>
                  <h4 className="text-xs font-medium truncate flex-1">{item.name}</h4>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                <Badge variant="secondary" className="text-[9px]">{SOURCE_LABELS[item.source] || item.source}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Enhanced Item Card
// ===========================================================================

function ItemCard({
  item,
  query,
  onSelect,
  onInstall,
}: {
  item: MarketPlaceItem;
  query: string;
  onSelect: () => void;
  onInstall: () => void;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = installedItems.includes(item.id);
  const security = getSecurityLevel(item);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card
        className="cursor-pointer hover:border-violet-500/40 transition-all group overflow-hidden"
        onClick={onSelect}
      >
        {/* Source badge top-right */}
        <div className="relative">
          <div className="h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Header: icon, name, security shield */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center text-lg shrink-0 border border-violet-500/10">
                {getCategoryEmoji(item.category)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">
                  {highlightText(item.name, query)}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-[8px] text-white font-bold shrink-0">
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {highlightText(item.author, query)}
                  </span>
                </div>
              </div>
            </div>
            <SecurityShield level={security} />
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {highlightText(item.description, query)}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Download className="h-3 w-3" />
              {formatNumber(item.downloads)}
            </span>
            {item.stars !== undefined && item.stars > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {formatNumber(item.stars)}
              </span>
            )}
            {item.version && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                v{item.version}
              </Badge>
            )}
          </div>

          {/* Bottom: source badge + install button */}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {SOURCE_LABELS[item.source] || item.source}
            </Badge>
            <div className="flex-1" />
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={isInstalled ? 'secondary' : 'default'}
                className={`text-xs h-7 px-3 cursor-pointer transition-colors ${
                  isInstalled
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
                onClick={(e) => { e.stopPropagation(); onInstall(); }}
              >
                <AnimatePresence mode="wait">
                  {isInstalled ? (
                    <motion.span
                      key="installed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Installed
                    </motion.span>
                  ) : (
                    <motion.span
                      key="install"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Install
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===========================================================================
// Enhanced Detail Modal
// ===========================================================================

function DetailModal({
  item,
  open,
  onClose,
  onInstall,
  isFavorite,
  onToggleFavorite,
  relatedItems,
  onSelectRelated,
}: {
  item: MarketPlaceItem | null;
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  relatedItems: MarketPlaceItem[];
  onSelectRelated: (item: MarketPlaceItem) => void;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = item ? installedItems.includes(item.id) : false;

  if (!item) return null;

  const security = getSecurityLevel(item);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl border border-violet-500/10">
                {getCategoryEmoji(item.category)}
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  {item.name}
                  {item.version && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      v{item.version}
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  by {item.author}
                </p>
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={onToggleFavorite}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                />
              </Button>
            </motion.div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{item.description}</p>
          </div>

          {/* Metadata Grid */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Source', value: SOURCE_LABELS[item.source] || item.source },
                { label: 'Category', value: item.category },
                { label: 'Version', value: item.version || 'N/A' },
                { label: 'Downloads', value: formatNumber(item.downloads) },
                { label: 'Stars', value: item.stars !== undefined ? formatNumber(item.stars) : 'N/A' },
                { label: 'Rating', value: item.rating || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 rounded-lg bg-muted/50 border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security</h4>
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              security === 'builtin' ? 'bg-green-500/5 border-green-500/20' :
              security === 'trusted' ? 'bg-yellow-500/5 border-yellow-500/20' :
              'bg-muted/50'
            }`}>
              {security === 'builtin' && <ShieldCheck className="h-5 w-5 text-green-400" />}
              {security === 'trusted' && <Shield className="h-5 w-5 text-yellow-400" />}
              {security === 'unknown' && <ShieldAlert className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">
                  {security === 'builtin' ? 'Verified Built-in' : security === 'trusted' ? 'Community Trusted' : 'Unknown Security Profile'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {security === 'builtin' ? 'This is a built-in item with full verification.' :
                   security === 'trusted' ? `Popular item with ${formatNumber(item.downloads)} downloads.` :
                   'Review the source before installing.'}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Items */}
          {relatedItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related Items</h4>
              <div className="grid grid-cols-2 gap-2">
                {relatedItems.slice(0, 4).map((related) => (
                  <Card
                    key={related.id}
                    className="cursor-pointer hover:border-violet-500/40 transition-colors"
                    onClick={() => onSelectRelated(related)}
                  >
                    <CardContent className="p-3 flex items-center gap-2">
                      <span className="text-base">{getCategoryEmoji(related.category)}</span>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-medium truncate">{related.name}</h5>
                        <p className="text-[10px] text-muted-foreground">{formatNumber(related.downloads)} downloads</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        <DialogFooter className="gap-2">
          {item.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open on {SOURCE_LABELS[item.source] || item.source}
              </a>
            </Button>
          )}
          <Button
            size="sm"
            variant={isInstalled ? 'secondary' : 'default'}
            className={
              isInstalled
                ? 'cursor-pointer'
                : 'bg-violet-600 hover:bg-violet-500 text-white cursor-pointer'
            }
            onClick={onInstall}
          >
            {isInstalled ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Uninstall
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Install
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// Empty State
// ===========================================================================

function EmptyState({
  query,
  onRetry,
  type,
}: {
  query: string;
  onRetry?: () => void;
  type: 'no-results' | 'loading' | 'error';
}) {
  if (type === 'loading') return null;

  if (type === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Failed to fetch results. Please check your connection and try again.
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="cursor-pointer">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* CSS art illustration */}
      <div className="relative h-24 w-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-violet-500/5" />
        <div className="absolute inset-3 rounded-full bg-violet-500/10 flex items-center justify-center">
          <div className="relative">
            <FolderOpen className="h-12 w-12 text-violet-400/60" />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Search className="h-5 w-5 text-muted-foreground/40" />
            </motion.div>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {query ? `No results for "${query}"` : 'No results found'}
      </h3>
      <p className="text-sm text-muted-foreground mb-3 max-w-sm">
        {query
          ? 'Try different keywords or browse by category'
          : 'Start searching to discover packages and tools'}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3 w-3" />
        <span>Tip: Try fewer words or check the spelling</span>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Stats Bar
// ===========================================================================

function StatsBar({ installedCount }: { installedCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-6 px-4 py-3 mb-2 rounded-xl bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-amber-500/5 border border-violet-500/10"
    >
      <div className="flex items-center gap-2">
        <PackageOpen className="h-4 w-4 text-violet-400" />
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">3M+</span> items across 6 sources
        </span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-green-400" />
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{installedCount}</span> installed
        </span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-amber-400" />
        <span className="text-xs text-muted-foreground">Marketplace</span>
      </div>
    </motion.div>
  );
}

// ===========================================================================
// Search Info Bar
// ===========================================================================

function SearchInfoBar({
  query,
  count,
  searchTime,
  onClear,
}: {
  query: string;
  count: number;
  searchTime: number;
  onClear: () => void;
}) {
  if (!query.trim()) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between mb-4"
    >
      <p className="text-xs text-muted-foreground">
        Found <span className="font-semibold text-foreground">{count}</span> result{count !== 1 ? 's' : ''} for &ldquo;
        <span className="text-violet-400">{query}</span>&rdquo;
        <span className="ml-1.5 text-muted-foreground/60">({searchTime.toFixed(1)}s)</span>
      </p>
      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground cursor-pointer" onClick={onClear}>
        <X className="h-3 w-3 mr-1" />
        Clear
      </Button>
    </motion.div>
  );
}

// ===========================================================================
// Recent Search Chips
// ===========================================================================

function RecentSearchChips({
  searches,
  onSelect,
  onRemove,
  onClear,
}: {
  searches: string[];
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
}) {
  if (searches.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-muted-foreground">Recent searches</span>
        <Button variant="ghost" size="sm" className="h-5 text-[10px] text-muted-foreground cursor-pointer" onClick={onClear}>
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {searches.map((s) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative"
          >
            <button
              onClick={() => onSelect(s)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <Clock className="h-2.5 w-2.5" />
              {s}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(s); }}
              className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-2 w-2" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Built-in Section (Enhanced)
// ===========================================================================

function BuiltinGridItem({
  item,
  type,
}: {
  item: { id: string; name: string; description: string; category: string; icon: string };
  type: 'tool' | 'skill';
}) {
  const { installedItems, toggleInstall } = useVoiceDevStore();
  const isInstalled = installedItems.includes(item.id);
  const IconComponent = ICON_MAP[item.icon];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className="overflow-hidden group hover:border-violet-500/40 transition-all">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center border border-violet-500/10 shrink-0">
                {IconComponent ? (
                  <IconComponent className="h-5 w-5 text-violet-400" />
                ) : (
                  <span className="text-lg">{getCategoryEmoji(item.category)}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <Badge variant="outline" className="text-[9px] px-1 h-3.5 shrink-0">
                    {type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-green-400" />
                  <span className="text-[10px] text-muted-foreground">{item.category}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground">{item.id}</span>
            <div className="flex-1" />
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant={isInstalled ? 'secondary' : 'default'}
                className={`text-xs h-7 px-3 cursor-pointer transition-colors ${
                  isInstalled
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
                onClick={() => {
                  toggleInstall(item.id);
                  toast.success(
                    isInstalled ? `Uninstalled ${item.name}` : `Installed ${item.name}`,
                    {
                      icon: isInstalled ? <Trash2 className="h-4 w-4" /> : <Check className="h-4 w-4" />,
                    }
                  );
                }}
              >
                <AnimatePresence mode="wait">
                  {isInstalled ? (
                    <motion.span
                      key="installed"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Installed
                    </motion.span>
                  ) : (
                    <motion.span
                      key="install"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Install
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BuiltinSection() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const allBuiltinItems = useMemo(() => {
    const tools = BUILTIN_TOOLS.map((t) => ({ ...t, type: 'tool' as const }));
    const skills = BUILTIN_SKILLS.map((s) => ({ ...s, type: 'skill' as const }));
    return [...tools, ...skills];
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(allBuiltinItems.map((i) => i.category));
    return ['All', ...Array.from(cats).sort()];
  }, [allBuiltinItems]);

  const filteredItems = useMemo(() => {
    let items = allBuiltinItems;
    if (filter !== 'All') items = items.filter((i) => i.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allBuiltinItems, filter, search]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-violet-400">{BUILTIN_TOOLS.length}</p>
          <p className="text-[10px] text-muted-foreground">Tools</p>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="text-center">
          <p className="text-2xl font-bold text-fuchsia-400">{BUILTIN_SKILLS.length}</p>
          <p className="text-[10px] text-muted-foreground">Skills</p>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">{categories.length - 1}</p>
          <p className="text-[10px] text-muted-foreground">Categories</p>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          <span className="text-[11px] text-muted-foreground">All verified & secure</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search built-in tools & skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 cursor-pointer"
              onClick={() => setSearch('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <CategoryFilterChips
          source="builtin-custom"
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Results count */}
      {search && (
        <p className="text-xs text-muted-foreground">
          Found <span className="font-semibold text-foreground">{filteredItems.length}</span> item{filteredItems.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState query={search} type="no-results" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <BuiltinGridItem key={item.id} item={item} type={item.type} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Marketplace Page (Main Export)
// ===========================================================================

export default function MarketplacePage() {
  const { installedItems, toggleInstall } = useVoiceDevStore();
  const [selectedSource, setSelectedSource] = useState('smithery');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [items, setItems] = useState<MarketPlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sortOrder, setSortOrder] = useState('popular');
  const [selectedItem, setSelectedItem] = useState<MarketPlaceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const fetchIdRef = useRef(0);

  const { items: recentlyViewed, addViewed, clearViewed } = useRecentlyViewed();
  const { ids: favoriteIds, toggleFavorite } = useFavorites();
  const { searches: recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items when source or query changes
  const fetchItems = useCallback(async (isLoadMore = false) => {
    if (selectedSource === 'builtin') return;

    const fetchId = ++fetchIdRef.current;
    const startTime = Date.now();
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        source: selectedSource === 'builtin' ? 'builtin' : selectedSource,
        query: debouncedQuery,
        sort: sortOrder,
      });
      const res = await fetch(`/api/marketplace?${params}`);
      if (fetchId !== fetchIdRef.current) return;

      if (res.ok) {
        const data = await res.json();
        // API returns { items: [...], total, source }
        const newItems = Array.isArray(data) ? data : (data.items || []);
        setItems(isLoadMore ? (prev) => [...prev, ...newItems] : newItems);
        setSearchTime((Date.now() - startTime) / 1000);
      } else {
        setError(true);
        setItems(isLoadMore ? (prev) => prev : []);
      }
    } catch {
      if (fetchId === fetchIdRef.current) {
        setError(true);
        setItems(isLoadMore ? (prev) => prev : []);
      }
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }, [selectedSource, debouncedQuery, sortOrder]);

  // Save search when query is submitted
  useEffect(() => {
    if (debouncedQuery.trim() && !loading) {
      addSearch(debouncedQuery);
    }
  }, [debouncedQuery, loading, addSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleInstall = useCallback(
    (id: string) => {
      const wasInstalled = installedItems.includes(id);
      toggleInstall(id);

      const item = items.find((i) => i.id === id);
      const builtinItem = [...BUILTIN_TOOLS, ...BUILTIN_SKILLS].find((i) => i.id === id);

      if (wasInstalled) {
        toast.success(`Uninstalled ${item?.name || builtinItem?.name || id}`, {
          icon: <Trash2 className="h-4 w-4" />,
          description: `Removed from your workspace`,
        });
      } else {
        toast.success(`Installed ${item?.name || builtinItem?.name || id}`, {
          icon: <Check className="h-4 w-4" />,
          description: item ? `from ${SOURCE_LABELS[item.source] || item.source}` : 'Built-in tool',
        });
      }
    },
    [toggleInstall, installedItems, items]
  );

  const handleSelectItem = useCallback(
    (item: MarketPlaceItem) => {
      setSelectedItem(item);
      setDetailOpen(true);
      addViewed(item);
    },
    [addViewed]
  );

  const handleCategoryFilterChange = useCallback(
    (filter: string) => {
      setCategoryFilter(filter);
      // Category chips act as search for external sources
      if (selectedSource !== 'builtin' && filter !== 'All') {
        setSearchQuery(filter);
      } else if (filter === 'All') {
        setSearchQuery('');
      }
    },
    [selectedSource]
  );

  // Filter items by category (client-side for already-fetched items)
  const filteredItems = useMemo(() => {
    if (categoryFilter === 'All' || selectedSource === 'builtin') return items;
    return items.filter((i) => {
      const cat = i.category?.toLowerCase() || '';
      return cat.includes(categoryFilter.toLowerCase());
    });
  }, [items, categoryFilter, selectedSource]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    if (sortOrder === 'popular') sorted.sort((a, b) => b.downloads - a.downloads);
    else if (sortOrder === 'newest') sorted.sort((a, b) => (b.version || '').localeCompare(a.version || ''));
    else if (sortOrder === 'top-rated') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  }, [filteredItems, sortOrder]);

  // Related items for detail modal
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    return items
      .filter((i) => i.id !== selectedItem.id && i.category === selectedItem.category)
      .slice(0, 4);
  }, [items, selectedItem]);

  // Source config for tabs
  const tabs = [
    { value: 'smithery', label: 'Smithery', badge: SOURCE_BADGE_COUNTS.smithery },
    { value: 'clawhub', label: 'ClawHub', badge: SOURCE_BADGE_COUNTS.clawhub },
    { value: 'huggingface', label: 'HuggingFace', badge: SOURCE_BADGE_COUNTS.huggingface },
    { value: 'npm', label: 'npm', badge: SOURCE_BADGE_COUNTS.npm },
    { value: 'pypi', label: 'PyPI', badge: SOURCE_BADGE_COUNTS.pypi },
    { value: 'github', label: 'GitHub', badge: SOURCE_BADGE_COUNTS.github },
    { value: 'builtin', label: 'Built-in', badge: SOURCE_BADGE_COUNTS.builtin },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Marketplace
            </h1>
          </div>

          <Tabs
            value={selectedSource}
            onValueChange={(v) => {
              setSelectedSource(v);
              setCategoryFilter('All');
              setSearchQuery('');
              setItems([]);
              setSelectedItem(null);
            }}
            className="w-full"
          >
            {/* Tab bar with badges */}
            <div className="flex items-center gap-3 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <TabsList className="h-9 shrink-0">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3 gap-1.5">
                    {tab.label}
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-3.5 px-1 font-normal bg-violet-500/20 text-violet-300"
                    >
                      {tab.badge}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Stats bar */}
            <StatsBar installedCount={installedItems.length} />

            {/* Search + Sort for external sources */}
            {selectedSource !== 'builtin' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${SOURCE_LABELS[selectedSource] || selectedSource}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 cursor-pointer"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[140px] h-9">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="top-rated">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Recent search chips */}
                {!searchQuery && !loading && (
                  <RecentSearchChips
                    searches={recentSearches}
                    onSelect={(q) => setSearchQuery(q)}
                    onRemove={removeSearch}
                    onClear={clearSearches}
                  />
                )}

                {/* Category filter chips */}
                <CategoryFilterChips
                  source={selectedSource}
                  activeFilter={categoryFilter}
                  onFilterChange={handleCategoryFilterChange}
                />
              </div>
            )}
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {selectedSource === 'builtin' ? (
          <div className="max-w-5xl mx-auto">
            <BuiltinSection />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Recently Viewed */}
            <RecentlyViewedSection
              items={recentlyViewed}
              onSelect={handleSelectItem}
              onClear={clearViewed}
            />

            {/* Search Info */}
            <SearchInfoBar
              query={debouncedQuery}
              count={sortedItems.length}
              searchTime={searchTime}
              onClear={() => { setSearchQuery(''); setCategoryFilter('All'); }}
            />

            {loading && items.length === 0 ? (
              /* Skeleton loading */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ItemCardSkeleton />
                  </motion.div>
                ))}
              </div>
            ) : error && items.length === 0 ? (
              <EmptyState query={debouncedQuery} type="error" onRetry={() => fetchItems()} />
            ) : sortedItems.length === 0 ? (
              <EmptyState query={debouncedQuery} type="no-results" />
            ) : (
              <>
                {/* Featured carousel (only when searching or initial load) */}
                {items.length > 3 && !debouncedQuery && !loading && (
                  <FeaturedCarousel
                    items={items}
                    onSelect={handleSelectItem}
                    onInstall={handleInstall}
                  />
                )}

                {/* Items grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {sortedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        query={debouncedQuery}
                        onSelect={() => handleSelectItem(item)}
                        onInstall={() => handleInstall(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More */}
                {sortedItems.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => fetchItems(true)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Package className="h-4 w-4 mr-2" />
                            Load More
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        item={selectedItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onInstall={() => {
          if (selectedItem) handleInstall(selectedItem.id);
        }}
        isFavorite={selectedItem ? favoriteIds.has(selectedItem.id) : false}
        onToggleFavorite={() => {
          if (selectedItem) {
            toggleFavorite(selectedItem.id);
            toast.success(
              favoriteIds.has(selectedItem.id) ? `Removed ${selectedItem.name} from favorites` : `Added ${selectedItem.name} to favorites`,
              {
                icon: favoriteIds.has(selectedItem.id) ? <Heart className="h-4 w-4" /> : <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
              }
            );
          }
        }}
        relatedItems={relatedItems}
        onSelectRelated={(item) => {
          setSelectedItem(item);
          addViewed(item);
        }}
      />
    </div>
  );
}
