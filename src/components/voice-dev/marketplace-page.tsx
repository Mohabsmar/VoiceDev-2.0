'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

// ---------------------------------------------------------------------------
// Suggestion chips for npm/PyPI
// ---------------------------------------------------------------------------
const NPM_SUGGESTIONS = ['express', 'react', 'next', 'openai', 'prisma', 'zod', 'axios', 'lodash'];
const PYPI_SUGGESTIONS = ['torch', 'tensorflow', 'transformers', 'fastapi', 'django', 'requests', 'numpy', 'pandas'];

// ---------------------------------------------------------------------------
// Built-in Section
// ---------------------------------------------------------------------------
function BuiltinSection() {
  const { installedItems, toggleInstall } = useVoiceDevStore();

  const toolCategories = useMemo(() => {
    const cats: Record<string, typeof BUILTIN_TOOLS[number][]> = {};
    for (const tool of BUILTIN_TOOLS) {
      if (!cats[tool.category]) cats[tool.category] = [];
      cats[tool.category].push(tool);
    }
    return cats;
  }, []);

  const skillCategories = useMemo(() => {
    const cats: Record<string, typeof BUILTIN_SKILLS[number][]> = {};
    for (const skill of BUILTIN_SKILLS) {
      if (!cats[skill.category]) cats[skill.category] = [];
      cats[skill.category].push(skill);
    }
    return cats;
  }, []);

  return (
    <div className="space-y-6">
      {/* Tools */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Built-in Tools</h3>
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(toolCategories).map(([category, tools]) => (
            <AccordionItem
              key={category}
              value={category}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{category}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {tools.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 pb-1">
                  {tools.map((tool) => {
                    const isInstalled = installedItems.includes(tool.id);
                    return (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:border-violet-500/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {tool.name}
                            </span>
                            {isInstalled && (
                              <Badge
                                variant="secondary"
                                className="bg-green-500/10 text-green-500 text-[10px]"
                              >
                                <Check className="h-2.5 w-2.5 mr-0.5" />
                                Installed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isInstalled ? 'secondary' : 'default'}
                          className={`shrink-0 text-xs h-7 cursor-pointer ${
                            isInstalled
                              ? ''
                              : 'bg-violet-600 hover:bg-violet-500 text-white'
                          }`}
                          onClick={() => toggleInstall(tool.id)}
                        >
                          {isInstalled ? 'Uninstall' : 'Install'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Built-in Skills</h3>
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(skillCategories).map(([category, skills]) => (
            <AccordionItem
              key={category}
              value={category}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{category}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {skills.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 pb-1">
                  {skills.map((skill) => {
                    const isInstalled = installedItems.includes(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:border-violet-500/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {skill.name}
                            </span>
                            {isInstalled && (
                              <Badge
                                variant="secondary"
                                className="bg-green-500/10 text-green-500 text-[10px]"
                              >
                                <Check className="h-2.5 w-2.5 mr-0.5" />
                                Installed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {skill.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isInstalled ? 'secondary' : 'default'}
                          className={`shrink-0 text-xs h-7 cursor-pointer ${
                            isInstalled
                              ? ''
                              : 'bg-violet-600 hover:bg-violet-500 text-white'
                          }`}
                          onClick={() => toggleInstall(skill.id)}
                        >
                          {isInstalled ? 'Uninstall' : 'Install'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item Card
// ---------------------------------------------------------------------------
function ItemCard({
  item,
  onSelect,
  onInstall,
}: {
  item: MarketPlaceItem;
  onSelect: () => void;
  onInstall: () => void;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = installedItems.includes(item.id);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className="cursor-pointer hover:border-violet-500/40 transition-colors"
        onClick={onSelect}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {item.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              {item.author}
            </Badge>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Download className="h-3 w-3" />
              {item.downloads.toLocaleString()}
            </span>
            {item.stars !== undefined && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Star className="h-3 w-3" />
                {item.stars.toLocaleString()}
              </span>
            )}
            {item.category && (
              <Badge variant="secondary" className="text-[10px]">
                {item.category}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant={isInstalled ? 'secondary' : 'default'}
              className={`text-xs h-7 flex-1 cursor-pointer ${
                isInstalled
                  ? ''
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onInstall();
              }}
            >
              {isInstalled ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Installed
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------
function DetailModal({
  item,
  open,
  onClose,
  onInstall,
}: {
  item: MarketPlaceItem | null;
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
}) {
  const { installedItems } = useVoiceDevStore();
  const isInstalled = item ? installedItems.includes(item.id) : false;

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-500" />
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Author</span>
              <p className="font-medium">{item.author}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Version</span>
              <p className="font-medium">{item.version || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Downloads</span>
              <p className="font-medium">{item.downloads.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Rating</span>
              <p className="font-medium">{item.rating || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Source</span>
              <p className="font-medium capitalize">{item.source}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Category</span>
              <p className="font-medium">{item.category}</p>
            </div>
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {item.url && (
            <Button variant="outline" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Source
              </a>
            </Button>
          )}
          <Button
            variant={isInstalled ? 'secondary' : 'default'}
            className={
              isInstalled
                ? ''
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

// ---------------------------------------------------------------------------
// Marketplace Page
// ---------------------------------------------------------------------------
export default function MarketplacePage() {
  const { installedItems, toggleInstall } = useVoiceDevStore();
  const [selectedSource, setSelectedSource] = useState('smithery');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<MarketPlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('popular');
  const [selectedItem, setSelectedItem] = useState<MarketPlaceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items when source or query changes
  const fetchItems = useCallback(async () => {
    if (selectedSource === 'built-in') return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        source: selectedSource === 'built-in' ? 'builtin' : selectedSource,
        query: debouncedQuery,
        sort: sortOrder,
      });
      const res = await fetch(`/api/marketplace?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSource, debouncedQuery, sortOrder]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleInstall = useCallback(
    (id: string) => {
      toggleInstall(id);
    },
    [toggleInstall]
  );

  const handleSelectItem = useCallback((item: MarketPlaceItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    if (sortOrder === 'popular') sorted.sort((a, b) => b.downloads - a.downloads);
    else if (sortOrder === 'newest') sorted.sort((a, b) => (b.version || '').localeCompare(a.version || ''));
    else if (sortOrder === 'top-rated') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  }, [items, sortOrder]);

  const suggestions =
    selectedSource === 'npm'
      ? NPM_SUGGESTIONS
      : selectedSource === 'pypi'
        ? PYPI_SUGGESTIONS
        : [];

  const sourceLabels: Record<string, string> = {
    smithery: 'Smithery',
    clawhub: 'ClawHub',
    huggingface: 'HuggingFace',
    npm: 'npm',
    pypi: 'PyPI',
    builtin: 'VoiceDev Built-in',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
          <Tabs
            value={selectedSource}
            onValueChange={setSelectedSource}
            className="w-full"
          >
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <TabsList className="h-9">
                {[
                  { value: 'smithery', label: 'Smithery' },
                  { value: 'clawhub', label: 'ClawHub' },
                  { value: 'huggingface', label: 'HuggingFace' },
                  { value: 'npm', label: 'npm' },
                  { value: 'pypi', label: 'PyPI' },
                  { value: 'builtin', label: 'Built-in' },
                ].map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Search + Sort for external sources */}
            {selectedSource !== 'builtin' && (
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${sourceLabels[selectedSource] || selectedSource}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
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
            )}

            {/* Suggestion chips */}
            {suggestions.length > 0 && (
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSearchQuery(s)}
                    className="px-3 py-1 rounded-full border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {selectedSource === 'builtin' ? (
          <div className="max-w-4xl mx-auto">
            <BuiltinSection />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-1">No results found</p>
            <p className="text-sm text-muted-foreground">
              {debouncedQuery
                ? `No items match "${debouncedQuery}"`
                : 'Start searching to discover packages'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {sortedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={() => handleSelectItem(item)}
                onInstall={() => handleInstall(item.id)}
              />
            ))}
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
      />
    </div>
  );
}
