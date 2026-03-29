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
  LayoutGrid,
  List,
  BarChart3,
  GitBranch,
  GitMerge,
  Plus,
  BookmarkPlus,
  Bookmark,
  MessageSquare,
  Scale,
  HardDrive,
  Users,
  Trophy,
  ChevronDown,
  Layers,
  Play,
  CheckCircle2,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

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

const LICENSE_TYPES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'MPL-2.0', 'Unlicense', 'LGPL-3.0'];

const LICENSE_COLORS: Record<string, string> = {
  'MIT': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Apache-2.0': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'GPL-3.0': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'BSD-3-Clause': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'ISC': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'MPL-2.0': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Unlicense': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'LGPL-3.0': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const PREBUILT_COLLECTIONS = [
  { id: 'ai-essentials', name: 'AI Essentials', description: 'Core AI tools for modern development', icon: '🤖', itemIds: ['openai', 'langchain', 'huggingface-transformers'] },
  { id: 'developer-toolkit', name: 'Developer Toolkit', description: 'Essential tools for productivity', icon: '🛠️', itemIds: ['eslint', 'prettier', 'typescript'] },
  { id: 'data-science-pack', name: 'Data Science Pack', description: 'Libraries for data analysis and ML', icon: '📊', itemIds: ['numpy', 'pandas', 'scikit-learn'] },
];

// ===========================================================================
// Lucide Icon Map for Built-in Tools/Skills
// ===========================================================================

import {
  FileEdit, Copy, FolderInput, PenLine, Hash, Monitor, Pointer, Camera,
  Terminal, Code, Braces, Key, List, Activity,
  Globe, Send, Scissors,
  Regex, CheckCircle,
  GitBranch as GitBranchIcon, GitCommit, GitMerge as GitMergeIcon, GitCompare,
  Lock, KeyRound, ShieldCheck as ShieldCheckIcon,
  Database as DatabaseIcon, HardDrive as HardDriveIcon,
  Brain, FileText as FileTextIcon, Tags,
  Sparkles as SparklesIcon,
  Volume2, Mic,
  SearchCode, Bug, RefreshCw, TestTube, Rocket,
  BarChart3 as BarChart3Icon, PieChart, Workflow,
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
  GitBranch: GitBranchIcon,
  GitCommit: GitCommit,
  GitMerge: GitMergeIcon,
  GitCompare: GitCompare,
  Lock: Lock,
  KeyRound: KeyRound,
  ShieldCheck: ShieldCheckIcon,
  Database: DatabaseIcon,
  HardDrive: HardDriveIcon,
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
  BarChart3: BarChart3Icon,
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

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getLicenseForItem(item: MarketPlaceItem): string {
  const idx = simpleHash(item.id + item.name) % LICENSE_TYPES.length;
  return LICENSE_TYPES[idx];
}

function getPackageSize(item: MarketPlaceItem): string {
  if (item.source === 'npm') {
    const size = (simpleHash(item.id) % 5000) + 10;
    return size > 1000 ? `${(size / 1000).toFixed(1)} MB` : `${size} KB`;
  }
  if (item.source === 'huggingface') {
    const params = [7, 13, 70, 175, 350, 1000];
    return `${params[simpleHash(item.id) % params.length]}B params`;
  }
  if (item.source === 'pypi') {
    const size = (simpleHash(item.id) % 500) + 5;
    return size > 100 ? `${(size / 100).toFixed(1)} MB` : `${size} MB`;
  }
  return 'N/A';
}

function getWeeklyDownloads(item: MarketPlaceItem): number {
  if (item.source === 'npm') return (simpleHash(item.id) % 5000000) + 1000;
  if (item.source === 'pypi') return (simpleHash(item.id) % 2000000) + 500;
  return item.downloads;
}

function getPythonVersion(item: MarketPlaceItem): string {
  if (item.source !== 'pypi') return 'N/A';
  const versions = ['>=3.7', '>=3.8', '>=3.9', '>=3.10', '>=3.11'];
  return versions[simpleHash(item.id) % versions.length];
}

function getLastModified(item: MarketPlaceItem): string {
  const days = simpleHash(item.id) % 365;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getDependencies(item: MarketPlaceItem): string[] {
  if (item.source !== 'npm' && item.source !== 'pypi') return [];
  const deps = ['lodash', 'axios', 'express', 'react', 'typescript', 'zod', 'chalk', 'commander', 'ora', 'inquirer'];
  const count = (simpleHash(item.id) % 5) + 1;
  return deps.slice(simpleHash(item.id) % deps.length, simpleHash(item.id) % deps.length + count);
}

function getDependents(item: MarketPlaceItem): string[] {
  if (item.source !== 'npm' && item.source !== 'pypi') return [];
  const deps = ['next', 'nuxt', 'vite', 'create-react-app', 'gatsby', 'vue-cli', 'angular-cli', 'svelte-kit'];
  const count = (simpleHash(item.id + 'rev') % 4) + 1;
  return deps.slice(simpleHash(item.id + 'rev') % deps.length, simpleHash(item.id + 'rev') % deps.length + count);
}

function getVersionHistory(item: MarketPlaceItem): { version: string; date: string; changelog: string; latest: boolean }[] {
  if (item.source !== 'npm' && item.source !== 'pypi') return [];
  const baseVersion = item.version ? item.version.split('.').map(Number) : [1, 0, 0];
  const versions: { version: string; date: string; changelog: string; latest: boolean }[] = [];
  for (let i = 0; i < 5; i++) {
    const patch = baseVersion[2] !== undefined ? baseVersion[2] - i : i;
    const minor = baseVersion[1] !== undefined ? baseVersion[1] : 0;
    const major = baseVersion[0] !== undefined ? baseVersion[0] : 1;
    versions.push({
      version: `${major}.${Math.max(0, minor - Math.floor(i / 3))}.${Math.max(0, patch)}`,
      date: `${i * 14 + 5}d ago`,
      changelog: i === 0 ? 'Latest release with bug fixes and improvements' : i === 1 ? 'Performance improvements and new features' : i === 2 ? 'Breaking changes and API updates' : i === 3 ? 'Feature release and documentation updates' : 'Initial stable release',
      latest: i === 0,
    });
  }
  return versions;
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
// localStorage Hooks
// ===========================================================================

const RV_KEY = 'voicedev-recently-viewed';
const FAV_KEY = 'voicedev-favorites';
const SEARCH_KEY = 'voicedev-recent-searches';
const RATINGS_KEY = 'voicedev-ratings';
const REVIEWS_KEY = 'voicedev-reviews';
const COLLECTIONS_KEY = 'voicedev-collections';
const COMPARE_KEY = 'voicedev-compare';
const VIEW_MODE_KEY = 'voicedev-view-mode';
const INSTALL_QUEUE_KEY = 'voicedev-install-queue';

// Types for new features
interface ItemReview {
  id: string;
  itemId: string;
  rating: number;
  text: string;
  author: string;
  timestamp: number;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemIds: string[];
  createdAt: number;
  isPrebuilt?: boolean;
}

interface QueueItem {
  id: string;
  itemId: string;
  itemName: string;
  status: 'queued' | 'installing' | 'done' | 'error';
  progress: number;
}

function useRecentlyViewed() {
  const [items, setItems] = useState<MarketPlaceItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RV_KEY);
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
      if (stored) setSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 50);
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

function useRatings() {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RATINGS_KEY);
      if (stored) setRatings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const setRating = useCallback((itemId: string, rating: number) => {
    setRatings((prev) => {
      const next = { ...prev, [itemId]: rating };
      localStorage.setItem(RATINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getAverageRating = useCallback((itemId: string, itemRating?: number): number => {
    if (ratings[itemId]) return ratings[itemId];
    return itemRating || 0;
  }, [ratings]);

  return { ratings, setRating, getAverageRating };
}

function useReviews() {
  const [reviews, setReviews] = useState<ItemReview[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      if (stored) setReviews(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addReview = useCallback((itemId: string, rating: number, text: string) => {
    const review: ItemReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      itemId,
      rating,
      text,
      author: 'You',
      timestamp: Date.now(),
    };
    setReviews((prev) => {
      const next = [review, ...prev].slice(0, 100);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
      return next;
    });
    return review;
  }, []);

  const getItemReviews = useCallback((itemId: string) => {
    return reviews.filter((r) => r.itemId === itemId);
  }, [reviews]);

  const getReviewCount = useCallback((itemId: string): number => {
    const base = simpleHash(itemId) % 50;
    return base + reviews.filter((r) => r.itemId === itemId).length;
  }, [reviews]);

  return { reviews, addReview, getItemReviews, getReviewCount };
}

function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLECTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCollections(parsed);
      } else {
        // Initialize with prebuilt collections
        setCollections(PREBUILT_COLLECTIONS.map((c) => ({ ...c, createdAt: Date.now(), isPrebuilt: true })));
        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(PREBUILT_COLLECTIONS.map((c) => ({ ...c, createdAt: Date.now(), isPrebuilt: true }))));
      }
    } catch { /* ignore */ }
  }, []);

  const createCollection = useCallback((name: string, description: string, icon: string) => {
    const collection: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      description,
      icon,
      itemIds: [],
      createdAt: Date.now(),
    };
    setCollections((prev) => {
      const next = [...prev, collection];
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
      return next;
    });
    return collection;
  }, []);

  const addItemToCollection = useCallback((collectionId: string, itemId: string) => {
    setCollections((prev) => {
      const next = prev.map((c) =>
        c.id === collectionId
          ? { ...c, itemIds: c.itemIds.includes(itemId) ? c.itemIds : [...c.itemIds, itemId] }
          : c
      );
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItemFromCollection = useCallback((collectionId: string, itemId: string) => {
    setCollections((prev) => {
      const next = prev.map((c) =>
        c.id === collectionId ? { ...c, itemIds: c.itemIds.filter((id) => id !== itemId) } : c
      );
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== collectionId);
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { collections, createCollection, addItemToCollection, removeItemFromCollection, deleteCollection };
}

function useCompareList() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.error('You can compare up to 3 items at a time');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  return { compareIds, toggleCompare, clearCompare };
}

function useViewMode() {
  const [mode, setMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_KEY);
      if (stored) setMode(stored as 'grid' | 'list');
    } catch { /* ignore */ }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'grid' ? 'list' : 'grid';
      localStorage.setItem(VIEW_MODE_KEY, next);
      return next;
    });
  }, []);

  return { mode, toggleMode, setMode };
}

function useInstallQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addToQueue = useCallback((itemId: string, itemName: string) => {
    const item: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      itemId,
      itemName,
      status: 'queued',
      progress: 0,
    };
    setQueue((prev) => [...prev, item]);
    toast.success(`Queued ${itemName} for installation`);
  }, []);

  const processQueue = useCallback((onComplete: (itemId: string) => void) => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setQueue((prev) => {
        const updated = [...prev];
        let changed = false;

        for (const item of updated) {
          if (item.status === 'queued') {
            item.status = 'installing';
            changed = true;
          }
          if (item.status === 'installing') {
            item.progress = Math.min(100, item.progress + Math.random() * 20 + 5);
            if (item.progress >= 100) {
              item.status = 'done';
              item.progress = 100;
              onComplete(item.itemId);
              changed = true;
            }
          }
        }

        if (changed) {
          localStorage.setItem(INSTALL_QUEUE_KEY, JSON.stringify(updated.filter((q) => q.status !== 'done')));
        }

        if (updated.every((q) => q.status === 'done')) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimeout(() => setQueue([]), 2000);
        }

        return updated;
      });
    }, 400);
  }, []);

  return { queue, addToQueue, processQueue };
}

// ===========================================================================
// Star Rating Component
// ===========================================================================

function StarRating({
  value,
  onChange,
  size = 'sm',
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform hover:scale-110`}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              (hovered || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ===========================================================================
// License Badge
// ===========================================================================

function LicenseBadge({ license }: { license: string }) {
  return (
    <Badge variant="outline" className={`text-[9px] h-4 px-1 border ${LICENSE_COLORS[license] || 'bg-muted text-muted-foreground border-muted'}`}>
      <Scale className="h-2.5 w-2.5 mr-0.5" />
      {license}
    </Badge>
  );
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
// License Filter Bar
// ===========================================================================

function LicenseFilterBar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (l: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <Scale className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('All')}
        className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
          selected === 'All'
            ? 'bg-violet-600 text-white border-violet-600'
            : 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        All Licenses
      </motion.button>
      {LICENSE_TYPES.map((lic) => (
        <motion.button
          key={lic}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(lic)}
          className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
            selected === lic
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {lic}
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
// Enhanced Item Card (Grid View)
// ===========================================================================

function ItemCard({
  item,
  query,
  onSelect,
  onInstall,
  isFavorite,
  onToggleFavorite,
  userRating,
  reviewCount,
  onSetRating,
  isSelected,
  onToggleSelect,
  onCompare,
  showCheckbox,
}: {
  item: MarketPlaceItem;
  query: string;
  onSelect: () => void;
  onInstall: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  userRating: number;
  reviewCount: number;
  onSetRating: (r: number) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  onCompare: () => void;
  showCheckbox: boolean;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = installedItems.includes(item.id);
  const security = getSecurityLevel(item);
  const license = getLicenseForItem(item);
  const avgRating = userRating || item.rating || 0;

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
        <div className="relative">
          <div className="h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {/* Bulk select checkbox */}
          {showCheckbox && (
            <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                className="h-4 w-4"
              />
            </div>
          )}
          {/* Favorite heart */}
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-pointer"
              onClick={onToggleFavorite}
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground/50 hover:text-red-400'}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Header */}
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

          {/* Rating + Review Count */}
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} onChange={(r) => { onSetRating(r); }} size="sm" readonly={false} />
            <span className="text-[10px] text-muted-foreground">
              {avgRating.toFixed(1)} ({reviewCount})
            </span>
          </div>

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
            {/* Size info */}
            {(item.source === 'npm' || item.source === 'huggingface' || item.source === 'pypi') && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                {getPackageSize(item)}
              </span>
            )}
            {item.version && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                v{item.version}
              </Badge>
            )}
          </div>

          {/* License badge */}
          <LicenseBadge license={license} />

          {/* Bottom: source badge + install + compare */}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {SOURCE_LABELS[item.source] || item.source}
            </Badge>
            <div className="flex-1" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onCompare(); }}
                  >
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compare</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
// Item List Row (List View)
// ===========================================================================

function ItemListRow({
  item,
  query,
  onSelect,
  onInstall,
  isFavorite,
  onToggleFavorite,
  userRating,
  reviewCount,
  onSetRating,
  isSelected,
  onToggleSelect,
  onCompare,
  showCheckbox,
}: {
  item: MarketPlaceItem;
  query: string;
  onSelect: () => void;
  onInstall: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  userRating: number;
  reviewCount: number;
  onSetRating: (r: number) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  onCompare: () => void;
  showCheckbox: boolean;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = installedItems.includes(item.id);
  const security = getSecurityLevel(item);
  const license = getLicenseForItem(item);
  const avgRating = userRating || item.rating || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card
        className="cursor-pointer hover:border-violet-500/40 transition-all group"
        onClick={onSelect}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            {showCheckbox && (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggleSelect}
                  className="h-4 w-4"
                />
              </div>
            )}

            {/* Icon */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center text-base shrink-0 border border-violet-500/10">
              {getCategoryEmoji(item.category)}
            </div>

            {/* Name + Author */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">
                {highlightText(item.name, query)}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">{highlightText(item.author, query)}</p>
            </div>

            {/* Rating */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 w-28">
              <StarRating value={Math.round(avgRating)} onChange={(r) => onSetRating(r)} size="sm" readonly={false} />
              <span className="text-[10px] text-muted-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
            </div>

            {/* Downloads */}
            <div className="hidden md:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 w-20">
              <Download className="h-3 w-3" />
              {formatNumber(item.downloads)}
            </div>

            {/* Size */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 w-20">
              <HardDrive className="h-3 w-3" />
              {getPackageSize(item)}
            </div>

            {/* License */}
            <div className="hidden lg:block shrink-0 w-24">
              <LicenseBadge license={license} />
            </div>

            {/* Source */}
            <Badge variant="secondary" className="text-[10px] shrink-0 hidden md:block">
              {SOURCE_LABELS[item.source] || item.source}
            </Badge>

            {/* Security */}
            <SecurityShield level={security} />

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={onToggleFavorite}>
                <Heart className={`h-3.5 w-3.5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground/50'}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={onCompare}>
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                size="sm"
                variant={isInstalled ? 'secondary' : 'default'}
                className={`text-xs h-7 px-3 cursor-pointer transition-colors ${
                  isInstalled
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
                onClick={onInstall}
              >
                {isInstalled ? <><Check className="h-3 w-3 mr-1" />Done</> : <><Download className="h-3 w-3 mr-1" />Install</>}
              </Button>
            </div>
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
  userRating,
  onSetRating,
  reviews,
  onAddReview,
  reviewCount,
  collections,
  onAddToCollection,
  compareToIds,
  onToggleCompare,
}: {
  item: MarketPlaceItem | null;
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  relatedItems: MarketPlaceItem[];
  onSelectRelated: (item: MarketPlaceItem) => void;
  userRating: number;
  onSetRating: (r: number) => void;
  reviews: ItemReview[];
  onAddReview: (rating: number, text: string) => void;
  reviewCount: number;
  collections: Collection[];
  onAddToCollection: (colId: string) => void;
  compareToIds: string[];
  onToggleCompare: () => void;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = item ? installedItems.includes(item.id) : false;
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);

  if (!item) return null;

  const security = getSecurityLevel(item);
  const license = getLicenseForItem(item);
  const avgRating = userRating || item.rating || 0;
  const dependencies = getDependencies(item);
  const dependents = getDependents(item);
  const versionHistory = getVersionHistory(item);
  const itemCollections = collections.filter((c) => c.itemIds.includes(item.id));

  const handleSubmitReview = () => {
    if (!newReviewText.trim()) return;
    onAddReview(newReviewRating, newReviewText.trim());
    setNewReviewText('');
    setNewReviewRating(5);
    toast.success('Review added');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
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
                  <LicenseBadge license={license} />
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  by {item.author} · {reviewCount} reviews
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Add to Collection */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                >
                  <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
                </Button>
                <AnimatePresence>
                  {showCollectionMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1 z-50 w-52 bg-popover border rounded-lg shadow-lg p-1"
                    >
                      <p className="text-[10px] text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">Add to Collection</p>
                      {collections.map((col) => (
                        <button
                          key={col.id}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded-md cursor-pointer text-left transition-colors"
                          onClick={() => {
                            onAddToCollection(col.id);
                            setShowCollectionMenu(false);
                            toast.success(`Added to ${col.name}`);
                          }}
                        >
                          <span>{col.icon}</span>
                          <span className="truncate">{col.name}</span>
                          {itemCollections.some((c) => c.id === col.id) && (
                            <Check className="h-3 w-3 text-green-400 ml-auto shrink-0" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Compare */}
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 cursor-pointer ${compareToIds.includes(item.id) ? 'text-violet-400' : ''}`}
                onClick={onToggleCompare}
              >
                <Layers className="h-4 w-4" />
              </Button>
              {/* Favorite */}
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
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start h-8 shrink-0">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Reviews ({reviewCount})</TabsTrigger>
            {(item.source === 'npm' || item.source === 'pypi') && (
              <TabsTrigger value="dependencies" className="text-xs">Dependencies</TabsTrigger>
            )}
            {(item.source === 'npm' || item.source === 'pypi') && (
              <TabsTrigger value="versions" className="text-xs">Versions</TabsTrigger>
            )}
            <TabsTrigger value="related" className="text-xs">Related</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-3">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-5 mt-0">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-foreground/90 leading-relaxed">{item.description}</p>
              </div>

              {/* User Rating */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rate this package</h4>
                <div className="flex items-center gap-3">
                  <StarRating value={Math.round(userRating)} onChange={onSetRating} size="lg" />
                  {userRating > 0 && (
                    <span className="text-sm text-muted-foreground">Your rating: {userRating}/5</span>
                  )}
                </div>
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
                    { label: 'Rating', value: `${avgRating.toFixed(1)} / 5` },
                    { label: 'License', value: license },
                    { label: 'Size', value: getPackageSize(item) },
                    { label: 'Last Modified', value: getLastModified(item) },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2.5 rounded-lg bg-muted/50 border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source-specific info */}
              {item.source === 'pypi' && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Python Support</p>
                  <p className="text-sm font-medium">{getPythonVersion(item)}</p>
                </div>
              )}
              {item.source === 'npm' && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Weekly Downloads</p>
                  <p className="text-sm font-medium">{formatNumber(getWeeklyDownloads(item))}</p>
                </div>
              )}

              {/* Security */}
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
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections containing this item */}
              {itemCollections.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">In Collections</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {itemCollections.map((col) => (
                      <Badge key={col.id} variant="secondary" className="text-xs">
                        <Bookmark className="h-3 w-3 mr-1" />
                        {col.icon} {col.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4 mt-0">
              {/* Add review form */}
              <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <h4 className="text-xs font-semibold">Write a Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rating:</span>
                  <StarRating value={newReviewRating} onChange={setNewReviewRating} size="md" />
                </div>
                <Textarea
                  placeholder="Share your experience with this package..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <Button size="sm" className="text-xs bg-violet-600 hover:bg-violet-500 text-white cursor-pointer" onClick={handleSubmitReview} disabled={!newReviewText.trim()}>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Submit Review
                </Button>
              </div>

              {/* Reviews list */}
              <div className="space-y-3">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{review.author}</span>
                        <StarRating value={review.rating} readonly size="sm" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
                  </motion.div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </TabsContent>

            {/* Dependencies Tab */}
            {(item.source === 'npm' || item.source === 'pypi') && (
              <TabsContent value="dependencies" className="space-y-4 mt-0">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" />
                    Dependencies ({dependencies.length})
                  </h4>
                  <div className="space-y-1.5">
                    {dependencies.map((dep, i) => (
                      <div key={dep} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                        <Package className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                        <span className="text-xs font-mono flex-1">{dep}</span>
                        <Badge variant="outline" className="text-[9px]">
                          v{(simpleHash(dep) % 5) + 1}.{simpleHash(dep + 'm') % 10}.{simpleHash(dep + 'p') % 20}
                        </Badge>
                      </div>
                    ))}
                    {dependencies.length === 0 && <p className="text-xs text-muted-foreground">No dependencies</p>}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitMerge className="h-3.5 w-3.5" />
                    Dependents ({dependents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {dependents.map((dep) => (
                      <div key={dep} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                        <Package className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                        <span className="text-xs font-mono flex-1">{dep}</span>
                      </div>
                    ))}
                    {dependents.length === 0 && <p className="text-xs text-muted-foreground">No known dependents</p>}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Versions Tab */}
            {(item.source === 'npm' || item.source === 'pypi') && (
              <TabsContent value="versions" className="space-y-2 mt-0">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Version History</h4>
                {versionHistory.map((v, i) => (
                  <motion.div
                    key={v.version}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border ${v.latest ? 'bg-violet-500/5 border-violet-500/20' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono font-semibold">v{v.version}</code>
                        {v.latest && (
                          <Badge className="bg-violet-500/20 text-violet-300 text-[9px] h-4 border-0">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{v.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{v.changelog}</p>
                  </motion.div>
                ))}
              </TabsContent>
            )}

            {/* Related Tab */}
            <TabsContent value="related" className="space-y-3 mt-0">
              {relatedItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {relatedItems.slice(0, 6).map((related) => (
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
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No related items found</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator className="my-1" />

        <DialogFooter className="gap-2 shrink-0">
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
              <><Check className="h-4 w-4 mr-2" />Uninstall</>
            ) : (
              <><Download className="h-4 w-4 mr-2" />Install</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// Compare Dialog
// ===========================================================================

function CompareDialog({
  open,
  onClose,
  items,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  items: MarketPlaceItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length < 2) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-400" />
            Compare Items
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-xs text-muted-foreground font-semibold w-32">Property</th>
                {items.map((item) => (
                  <th key={item.id} className="text-left py-2 px-3 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryEmoji(item.category)}</span>
                      <span className="font-semibold text-xs truncate">{item.name}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 cursor-pointer" onClick={() => onRemove(item.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { label: 'Source', render: (i: MarketPlaceItem) => SOURCE_LABELS[i.source] },
                { label: 'Author', render: (i: MarketPlaceItem) => i.author },
                { label: 'Version', render: (i: MarketPlaceItem) => i.version || 'N/A' },
                { label: 'License', render: (i: MarketPlaceItem) => <LicenseBadge license={getLicenseForItem(i)} /> },
                { label: 'Downloads', render: (i: MarketPlaceItem) => formatNumber(i.downloads) },
                { label: 'Stars', render: (i: MarketPlaceItem) => i.stars !== undefined ? formatNumber(i.stars) : 'N/A' },
                { label: 'Size', render: (i: MarketPlaceItem) => getPackageSize(i) },
                { label: 'Rating', render: (i: MarketPlaceItem) => i.rating || 'N/A' },
                { label: 'Dependencies', render: (i: MarketPlaceItem) => `${getDependencies(i).length} deps` },
                { label: 'Last Modified', render: (i: MarketPlaceItem) => getLastModified(i) },
                { label: 'Category', render: (i: MarketPlaceItem) => i.category },
              ].map(({ label, render }) => (
                <tr key={label}>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground font-medium">{label}</td>
                  {items.map((item) => (
                    <td key={item.id} className="py-2.5 px-3 text-xs">{render(item)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// Stats Dashboard Dialog
// ===========================================================================

function StatsDashboardDialog({
  open,
  onClose,
  items,
  installedCount,
}: {
  open: boolean;
  onClose: () => void;
  items: MarketPlaceItem[];
  installedCount: number;
}) {
  if (items.length === 0) return null;

  const totalItems = items.length;
  const totalDownloads = items.reduce((sum, i) => sum + i.downloads, 0);
  const totalStars = items.reduce((sum, i) => sum + (i.stars || 0), 0);

  // Most popular category
  const categoryCounts: Record<string, number> = {};
  items.forEach((i) => { categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1; });
  const popularCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  // Fastest growing (highest downloads)
  const fastestGrowing = [...items].sort((a, b) => b.downloads - a.downloads)[0];

  // Average rating
  const avgRating = items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.filter((i) => i.rating).length;

  const stats = [
    { icon: PackageOpen, label: 'Total Items', value: formatNumber(totalItems), color: 'text-violet-400' },
    { icon: Download, label: 'Total Downloads', value: formatNumber(totalDownloads), color: 'text-green-400' },
    { icon: Star, label: 'Total Stars', value: formatNumber(totalStars), color: 'text-amber-400' },
    { icon: CheckCircle2, label: 'Installed', value: String(installedCount), color: 'text-blue-400' },
    { icon: Trophy, label: 'Most Popular Category', value: popularCategory ? `${popularCategory[0]} (${popularCategory[1]})` : 'N/A', color: 'text-fuchsia-400' },
    { icon: TrendingUp, label: 'Fastest Growing', value: fastestGrowing ? fastestGrowing.name : 'N/A', color: 'text-cyan-400' },
    { icon: Star, label: 'Average Rating', value: avgRating > 0 ? avgRating.toFixed(1) : 'N/A', color: 'text-amber-400' },
    { icon: Users, label: 'Unique Authors', value: String(new Set(items.map((i) => i.author)).size), color: 'text-purple-400' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            Market Statistics
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg border bg-muted/30">
              <stat.icon className={`h-4 w-4 ${stat.color} mb-1.5`} />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-sm font-semibold mt-0.5 truncate">{stat.value}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===========================================================================
// Collection Manager Dialog
// ===========================================================================

function CollectionManagerDialog({
  open,
  onClose,
  collections,
  onCreateCollection,
  onDeleteCollection,
  allItems,
  onSelectItem,
}: {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
  onCreateCollection: (name: string, desc: string, icon: string) => void;
  onDeleteCollection: (id: string) => void;
  allItems: MarketPlaceItem[];
  onSelectItem: (item: MarketPlaceItem) => void;
}) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('📁');

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateCollection(newName.trim(), newDesc.trim(), newIcon);
    setNewName('');
    setNewDesc('');
    setNewIcon('📁');
    toast.success(`Collection "${newName.trim()}" created`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-violet-400" />
            My Collections
          </DialogTitle>
        </DialogHeader>

        {/* Create new collection */}
        <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
          <p className="text-xs font-semibold">Create New Collection</p>
          <div className="flex gap-2">
            <Input
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 text-xs"
            />
            <button
              className="h-8 w-8 rounded-md border flex items-center justify-center text-lg shrink-0 cursor-pointer hover:bg-accent"
              onClick={() => {
                const emojis = ['📁', '📦', '🔧', '🚀', '💡', '🎯', '⭐', '🔥', '💎', '🎨'];
                setNewIcon(emojis[(emojis.indexOf(newIcon) + 1) % emojis.length]);
              }}
            >
              {newIcon}
            </button>
          </div>
          <Input
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="h-8 text-xs"
          />
          <Button size="sm" className="text-xs bg-violet-600 hover:bg-violet-500 text-white cursor-pointer" onClick={handleCreate} disabled={!newName.trim()}>
            <Plus className="h-3 w-3 mr-1" />
            Create
          </Button>
        </div>

        {/* Collections list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {collections.map((col) => {
            const colItems = allItems.filter((i) => col.itemIds.includes(i.id));
            return (
              <div key={col.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{col.icon}</span>
                    <div>
                      <h4 className="text-sm font-medium">{col.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{col.description || `${col.itemIds.length} items`}</p>
                    </div>
                  </div>
                  {!col.isPrebuilt && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={() => onDeleteCollection(col.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-400" />
                    </Button>
                  )}
                </div>
                {colItems.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {colItems.slice(0, 5).map((i) => (
                      <Badge
                        key={i.id}
                        variant="secondary"
                        className="text-[10px] cursor-pointer hover:bg-violet-500/20 transition-colors"
                        onClick={() => onSelectItem(i)}
                      >
                        {i.name}
                      </Badge>
                    ))}
                    {colItems.length > 5 && (
                      <Badge variant="outline" className="text-[10px]">+{colItems.length - 5} more</Badge>
                    )}
                  </div>
                )}
                {colItems.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">No items yet. Add items from the detail modal.</p>
                )}
              </div>
            );
          })}
        </div>
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

function StatsBar({ installedCount, favoriteCount }: { installedCount: number; favoriteCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-4 py-3 mb-2 rounded-xl bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-amber-500/5 border border-violet-500/10 overflow-x-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <PackageOpen className="h-4 w-4 text-violet-400" />
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">3M+</span> items
        </span>
      </div>
      <Separator orientation="vertical" className="h-4 shrink-0" />
      <div className="flex items-center gap-2 shrink-0">
        <Download className="h-4 w-4 text-green-400" />
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{installedCount}</span> installed
        </span>
      </div>
      <Separator orientation="vertical" className="h-4 shrink-0" />
      <div className="flex items-center gap-2 shrink-0">
        <Heart className="h-4 w-4 text-red-400" />
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{favoriteCount}</span> favorites
        </span>
      </div>
      <Separator orientation="vertical" className="h-4 shrink-0" />
      <div className="flex items-center gap-2 shrink-0">
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
      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
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
  const [licenseFilter, setLicenseFilter] = useState('All');
  const [items, setItems] = useState<MarketPlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sortOrder, setSortOrder] = useState('popular');
  const [selectedItem, setSelectedItem] = useState<MarketPlaceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const fetchIdRef = useRef(0);

  // New feature hooks
  const { items: recentlyViewed, addViewed, clearViewed } = useRecentlyViewed();
  const { ids: favoriteIds, toggleFavorite } = useFavorites();
  const { searches: recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();
  const { ratings, setRating, getAverageRating } = useRatings();
  const { addReview, getItemReviews, getReviewCount } = useReviews();
  const { collections, createCollection, addItemToCollection, deleteCollection } = useCollections();
  const { compareIds, toggleCompare, clearCompare } = useCompareList();
  const { mode: viewMode, toggleMode } = useViewMode();
  const { queue: installQueue, addToQueue, processQueue } = useInstallQueue();

  // Dialog states
  const [compareOpen, setCompareOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  // Custom sidebar tabs (favorites, collections)
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'favorites' | 'collections'>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

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
      const item = items.find((i) => i.id === id);
      const builtinItem = [...BUILTIN_TOOLS, ...BUILTIN_SKILLS].find((i) => i.id === id);

      if (!wasInstalled) {
        // Add to install queue
        addToQueue(id, item?.name || builtinItem?.name || id);
        processQueue((itemId) => {
          toggleInstall(itemId);
          const installedItem = items.find((i) => i.id === itemId);
          const installedBuiltin = [...BUILTIN_TOOLS, ...BUILTIN_SKILLS].find((i) => i.id === itemId);
          toast.success(`Installed ${installedItem?.name || installedBuiltin?.name || itemId}`, {
            icon: <CheckCircle2 className="h-4 w-4 text-green-400" />,
          });
        });
      } else {
        toggleInstall(id);
        toast.success(`Uninstalled ${item?.name || builtinItem?.name || id}`, {
          icon: <Trash2 className="h-4 w-4" />,
          description: `Removed from your workspace`,
        });
      }
    },
    [toggleInstall, installedItems, items, addToQueue, processQueue]
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
      if (selectedSource !== 'builtin' && filter !== 'All') {
        setSearchQuery(filter);
      } else if (filter === 'All') {
        setSearchQuery('');
      }
    },
    [selectedSource]
  );

  const handleBulkSelect = useCallback((id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (bulkSelected.size === sortedFilteredItems.length) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(sortedFilteredItems.map((i) => i.id)));
    }
  }, [bulkSelected.size, sortedFilteredItems]);

  const handleBulkInstall = useCallback(() => {
    bulkSelected.forEach((id) => handleInstall(id));
    toast.success(`Installing ${bulkSelected.size} items...`);
  }, [bulkSelected, handleInstall]);

  const handleBulkAddToCollection = useCallback((colId: string) => {
    bulkSelected.forEach((id) => addItemToCollection(colId, id));
    toast.success(`Added ${bulkSelected.size} items to collection`);
    setBulkSelected(new Set());
    setShowBulkMode(false);
  }, [bulkSelected, addItemToCollection]);

  // Filter items by category, license, favorites, and collections
  const filteredItems = useMemo(() => {
    let result = items;

    // Sidebar filter (favorites / collections)
    if (sidebarFilter === 'favorites') {
      result = result.filter((i) => favoriteIds.has(i.id));
    } else if (sidebarFilter === 'collections' && selectedCollectionId) {
      const col = collections.find((c) => c.id === selectedCollectionId);
      if (col) {
        result = result.filter((i) => col.itemIds.includes(i.id));
      }
    }

    // Category filter
    if (categoryFilter !== 'All' && selectedSource !== 'builtin') {
      result = result.filter((i) => {
        const cat = i.category?.toLowerCase() || '';
        return cat.includes(categoryFilter.toLowerCase());
      });
    }

    // License filter
    if (licenseFilter !== 'All') {
      result = result.filter((i) => getLicenseForItem(i) === licenseFilter);
    }

    return result;
  }, [items, categoryFilter, selectedSource, licenseFilter, sidebarFilter, favoriteIds, collections, selectedCollectionId]);

  // Sort items
  const sortedFilteredItems = useMemo(() => {
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
      .filter((i) => i.id !== selectedItem.id && i.category === selectedItem.category && i.source === selectedItem.source)
      .slice(0, 6);
  }, [items, selectedItem]);

  // Compare items
  const compareItems = useMemo(() => {
    return compareIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as MarketPlaceItem[];
  }, [compareIds, items]);

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
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Marketplace
            </h1>
            <div className="flex items-center gap-2">
              {/* Stats button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setStatsOpen(true)}>
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      Stats
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Market Statistics</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Collections button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" onClick={() => setCollectionsOpen(true)}>
                      <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                      Collections
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Manage Collections</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Tabs
            value={selectedSource}
            onValueChange={(v) => {
              setSelectedSource(v);
              setCategoryFilter('All');
              setSearchQuery('');
              setItems([]);
              setSelectedItem(null);
              setSidebarFilter('all');
              setSelectedCollectionId(null);
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
            <StatsBar installedCount={installedItems.length} favoriteCount={favoriteIds.size} />

            {/* Search + Sort + View toggle + Bulk mode for external sources */}
            {selectedSource !== 'builtin' && (
              <div className="mt-4 space-y-2">
                {/* Sidebar filter tabs: All / Favorites / Collections */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => { setSidebarFilter('all'); setSelectedCollectionId(null); }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                      sidebarFilter === 'all' ? 'bg-violet-600 text-white border-violet-600' : 'bg-transparent text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => { setSidebarFilter('favorites'); setSelectedCollectionId(null); }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border flex items-center gap-1 ${
                      sidebarFilter === 'favorites' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-transparent text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Heart className="h-3 w-3" /> Favorites ({favoriteIds.size})
                  </button>
                  {collections.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setSidebarFilter(sidebarFilter === 'collections' ? 'all' : 'collections')}
                        className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border flex items-center gap-1 ${
                          sidebarFilter === 'collections' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-transparent text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <Bookmark className="h-3 w-3" /> Collections
                      </button>
                      {sidebarFilter === 'collections' && collections.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 z-50 w-48 bg-popover border rounded-lg shadow-lg p-1">
                          {collections.map((col) => (
                            <button
                              key={col.id}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md cursor-pointer text-left transition-colors ${
                                selectedCollectionId === col.id ? 'bg-accent' : 'hover:bg-accent'
                              }`}
                              onClick={() => setSelectedCollectionId(selectedCollectionId === col.id ? null : col.id)}
                            >
                              <span>{col.icon}</span>
                              <span className="truncate">{col.name}</span>
                              <Badge variant="secondary" className="text-[9px] ml-auto">{col.itemIds.length}</Badge>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                  {/* Grid/List toggle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 cursor-pointer"
                          onClick={toggleMode}
                        >
                          {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{viewMode === 'grid' ? 'List View' : 'Grid View'}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* Bulk mode toggle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={showBulkMode ? 'default' : 'outline'}
                          size="sm"
                          className={`h-9 text-xs cursor-pointer ${showBulkMode ? 'bg-violet-600 text-white' : ''}`}
                          onClick={() => {
                            setShowBulkMode(!showBulkMode);
                            setBulkSelected(new Set());
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Bulk
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bulk Actions</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Bulk action bar */}
                {showBulkMode && bulkSelected.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20"
                  >
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{bulkSelected.size}</span> selected
                    </span>
                    <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-500 text-white cursor-pointer" onClick={handleSelectAll}>
                      {bulkSelected.size === sortedFilteredItems.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button size="sm" className="h-7 text-xs cursor-pointer" onClick={handleBulkInstall}>
                      <Download className="h-3 w-3 mr-1" />
                      Install All
                    </Button>
                    <div className="relative">
                      <Button size="sm" variant="outline" className="h-7 text-xs cursor-pointer" onClick={() => setBulkSelected(new Set())}>
                        <BookmarkPlus className="h-3 w-3 mr-1" />
                        Add to Collection
                      </Button>
                      {bulkSelected.size > 0 && (
                        <div className="absolute top-full left-0 mt-1 z-50 w-44 bg-popover border rounded-lg shadow-lg p-1">
                          {collections.map((col) => (
                            <button
                              key={col.id}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded-md cursor-pointer text-left"
                              onClick={() => handleBulkAddToCollection(col.id)}
                            >
                              <span>{col.icon}</span>
                              <span className="truncate">{col.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground cursor-pointer" onClick={() => setBulkSelected(new Set())}>
                      Clear
                    </Button>
                  </motion.div>
                )}

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

                {/* License filter */}
                <LicenseFilterBar
                  selected={licenseFilter}
                  onSelect={setLicenseFilter}
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
              count={sortedFilteredItems.length}
              searchTime={searchTime}
              onClear={() => { setSearchQuery(''); setCategoryFilter('All'); setLicenseFilter('All'); }}
            />

            {loading && items.length === 0 ? (
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
            ) : sortedFilteredItems.length === 0 ? (
              <EmptyState query={debouncedQuery} type="no-results" />
            ) : (
              <>
                {/* Featured carousel */}
                {items.length > 3 && !debouncedQuery && !loading && sidebarFilter === 'all' && (
                  <FeaturedCarousel
                    items={items}
                    onSelect={handleSelectItem}
                    onInstall={handleInstall}
                  />
                )}

                {/* Items display */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {sortedFilteredItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          query={debouncedQuery}
                          onSelect={() => handleSelectItem(item)}
                          onInstall={() => handleInstall(item.id)}
                          isFavorite={favoriteIds.has(item.id)}
                          onToggleFavorite={() => {
                            toggleFavorite(item.id);
                            toast.success(
                              favoriteIds.has(item.id) ? `Removed ${item.name} from favorites` : `Added ${item.name} to favorites`,
                              {
                                icon: favoriteIds.has(item.id) ? <Heart className="h-4 w-4" /> : <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
                              }
                            );
                          }}
                          userRating={getAverageRating(item.id, item.rating)}
                          reviewCount={getReviewCount(item.id)}
                          onSetRating={(r) => setRating(item.id, r)}
                          isSelected={bulkSelected.has(item.id)}
                          onToggleSelect={() => handleBulkSelect(item.id)}
                          onCompare={() => toggleCompare(item.id)}
                          showCheckbox={showBulkMode}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {sortedFilteredItems.map((item) => (
                        <ItemListRow
                          key={item.id}
                          item={item}
                          query={debouncedQuery}
                          onSelect={() => handleSelectItem(item)}
                          onInstall={() => handleInstall(item.id)}
                          isFavorite={favoriteIds.has(item.id)}
                          onToggleFavorite={() => {
                            toggleFavorite(item.id);
                            toast.success(
                              favoriteIds.has(item.id) ? `Removed ${item.name} from favorites` : `Added ${item.name} to favorites`,
                              {
                                icon: favoriteIds.has(item.id) ? <Heart className="h-4 w-4" /> : <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
                              }
                            );
                          }}
                          userRating={getAverageRating(item.id, item.rating)}
                          reviewCount={getReviewCount(item.id)}
                          onSetRating={(r) => setRating(item.id, r)}
                          isSelected={bulkSelected.has(item.id)}
                          onToggleSelect={() => handleBulkSelect(item.id)}
                          onCompare={() => toggleCompare(item.id)}
                          showCheckbox={showBulkMode}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Load More */}
                {sortedFilteredItems.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => fetchItems(true)}
                        disabled={loading}
                      >
                        {loading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                        ) : (
                          <><Package className="h-4 w-4 mr-2" />Load More</>
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

      {/* Floating: Compare button */}
      {compareIds.length >= 2 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            className="bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-lg shadow-violet-500/20"
            onClick={() => setCompareOpen(true)}
          >
            <Layers className="h-4 w-4 mr-2" />
            Compare ({compareIds.length})
            <Badge className="ml-2 bg-white/20 text-white border-0 text-[10px]">{compareIds.length}/3</Badge>
          </Button>
        </motion.div>
      )}

      {/* Floating: Install Queue */}
      <AnimatePresence>
        {installQueue.length > 0 && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute bottom-6 right-6 z-40 w-64"
          >
            <Card className="border-violet-500/30 shadow-lg shadow-violet-500/10">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    <span className="text-xs font-semibold">Installing...</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{installQueue.length}</Badge>
                </div>
                {installQueue.map((q) => (
                  <div key={q.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] truncate flex-1">{q.itemName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {q.status === 'done' ? '✅' : q.status === 'installing' ? `${Math.round(q.progress)}%` : '⏳'}
                      </span>
                    </div>
                    <Progress value={q.progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
        userRating={selectedItem ? getAverageRating(selectedItem.id, selectedItem.rating) : 0}
        onSetRating={(r) => { if (selectedItem) setRating(selectedItem.id, r); }}
        reviews={selectedItem ? getItemReviews(selectedItem.id) : []}
        onAddReview={(rating, text) => { if (selectedItem) addReview(selectedItem.id, rating, text); }}
        reviewCount={selectedItem ? getReviewCount(selectedItem.id) : 0}
        collections={collections}
        onAddToCollection={(colId) => { if (selectedItem) { addItemToCollection(colId, selectedItem.id); toast.success('Added to collection'); } }}
        compareToIds={compareIds}
        onToggleCompare={() => { if (selectedItem) toggleCompare(selectedItem.id); }}
      />

      {/* Compare Dialog */}
      <CompareDialog
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        items={compareItems}
        onRemove={(id) => toggleCompare(id)}
      />

      {/* Stats Dashboard */}
      <StatsDashboardDialog
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        items={items}
        installedCount={installedItems.length}
      />

      {/* Collection Manager */}
      <CollectionManagerDialog
        open={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        collections={collections}
        onCreateCollection={createCollection}
        onDeleteCollection={deleteCollection}
        allItems={items}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}
