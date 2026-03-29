'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, Store, Cpu, Settings, BarChart3, History,
  Workflow, BookOpen, Swords, Puzzle, StickyNote, FolderOpen,
  Code, Terminal, User, Link2, LayoutTemplate, Command, Search,
  ChevronLeft, ChevronRight, X, Zap, Star, Pin, ArrowDown, ArrowUp,
  ChevronDown, ChevronUp, type LucideIcon,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { TabId } from '@/lib/types';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Nav Section Configuration
// ---------------------------------------------------------------------------
interface NavItemConfig {
  id: TabId;
  icon: LucideIcon;
  label: string;
  shortcut: string;
  description: string;
  featureCount: number;
  category: string;
  getBadge?: () => { text: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' };
}

const NAV_SECTIONS = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'landing' as TabId, icon: Home, label: 'Home', shortcut: 'Alt+1', description: 'Welcome & overview', featureCount: 12, category: 'main' },
      { id: 'chat' as TabId, icon: MessageSquare, label: 'Chat', shortcut: 'Alt+2', description: 'AI conversations', featureCount: 85, category: 'main',
        getBadge: () => { const c = useVoiceDevStore.getState().chatSessions.length; return c > 0 ? { text: `${c}`, variant: 'default' as const } : { text: '', variant: 'secondary' as const }; },
      },
      { id: 'dashboard' as TabId, icon: BarChart3, label: 'Dashboard', shortcut: 'Alt+3', description: 'Analytics & stats', featureCount: 78, category: 'main' },
    ],
  },
  {
    id: 'create',
    label: 'Create',
    items: [
      { id: 'workflows' as TabId, icon: Workflow, label: 'Workflows', shortcut: 'Alt+4', description: 'Automate tasks', featureCount: 65, category: 'create' },
      { id: 'prompts' as TabId, icon: BookOpen, label: 'Prompts', shortcut: 'Alt+5', description: 'Prompt library', featureCount: 72, category: 'create' },
      { id: 'templates' as TabId, icon: LayoutTemplate, label: 'Templates', shortcut: 'Alt+6', description: 'Chat templates', featureCount: 55, category: 'create' },
      { id: 'editor' as TabId, icon: Code, label: 'Editor', shortcut: 'Alt+7', description: 'Code editor', featureCount: 62, category: 'create' },
      { id: 'terminal' as TabId, icon: Terminal, label: 'Terminal', shortcut: 'Alt+8', description: 'Run commands', featureCount: 48, category: 'create' },
    ],
  },
  {
    id: 'discover',
    label: 'Discover',
    items: [
      { id: 'marketplace' as TabId, icon: Store, label: 'Marketplace', shortcut: 'Alt+9', description: 'Browse tools', featureCount: 95, category: 'discover',
        getBadge: () => { const c = useVoiceDevStore.getState().installedItems.length; return c > 0 ? { text: `${c}`, variant: 'default' as const } : { text: '6', variant: 'secondary' as const }; },
      },
      { id: 'providers' as TabId, icon: Cpu, label: 'Providers', shortcut: 'Alt+0', description: 'AI providers', featureCount: 88, category: 'discover' },
      { id: 'arena' as TabId, icon: Swords, label: 'Arena', shortcut: '', description: 'Model battles', featureCount: 42, category: 'discover' },
      { id: 'plugins' as TabId, icon: Puzzle, label: 'Plugins', shortcut: '', description: 'Extensions', featureCount: 58, category: 'discover' },
      { id: 'integrations' as TabId, icon: Link2, label: 'Integrations', shortcut: '', description: 'Third-party', featureCount: 52, category: 'discover' },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'history' as TabId, icon: History, label: 'History', shortcut: 'Ctrl+H', description: 'Chat history', featureCount: 45, category: 'workspace' },
      { id: 'notes' as TabId, icon: StickyNote, label: 'Notes', shortcut: '', description: 'Quick notes', featureCount: 56, category: 'workspace' },
      { id: 'files' as TabId, icon: FolderOpen, label: 'Files', shortcut: '', description: 'File manager', featureCount: 44, category: 'workspace' },
      { id: 'profile' as TabId, icon: User, label: 'Profile', shortcut: '', description: 'Your profile', featureCount: 38, category: 'workspace' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'settings' as TabId, icon: Settings, label: 'Settings', shortcut: 'Ctrl+,', description: 'Preferences', featureCount: 110, category: 'system',
        getBadge: () => { const { apiKeys } = useVoiceDevStore.getState(); return Object.values(apiKeys).some((k) => !k || k.length < 5) ? { text: '!', variant: 'outline' as const } : { text: '', variant: 'secondary' as const }; },
      },
    ],
  },
] as const;

const allNavItems = NAV_SECTIONS.flatMap((s) => s.items);

// ---------------------------------------------------------------------------
// Nav Search
// ---------------------------------------------------------------------------
function NavSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCurrentTab, createSession, chatSessions, setCurrentSession } = useVoiceDevStore();

  const allSearchable = [
    ...allNavItems.map((item) => ({
      type: 'page' as const, label: item.label, description: item.description, category: item.category,
      action: () => setCurrentTab(item.id), icon: item.icon,
    })),
    ...chatSessions.slice(0, 8).map((s) => ({
      type: 'session' as const, label: s.name, description: `${s.messages.length} messages · ${s.model}`, category: 'sessions',
      action: () => { setCurrentTab('chat'); setCurrentSession(s.id); }, icon: MessageSquare,
    })),
    { type: 'action' as const, label: 'New Chat', description: 'Start a new conversation', category: 'actions',
      action: () => { createSession(); setCurrentTab('chat'); }, icon: Zap },
  ];

  const filtered = query
    ? allSearchable.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allSearchable;

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  const handleClose = useCallback(() => { setQuery(''); onClose(); }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="absolute left-16 top-0 w-72 bg-card border-r border-t border-b z-50 shadow-xl max-h-[80vh] flex flex-col"
        >
          <div className="flex items-center gap-2 p-3 border-b">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, sessions..." className="h-7 text-xs border-0 bg-muted/50 focus-visible:ring-1" />
            <button onClick={onClose} className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
            {['page', 'session', 'action'].map((type) => {
              const items = filtered.filter((i) => i.type === type);
              if (items.length === 0) return null;
              return (
                <div key={type} className="mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">{type}s</p>
                  {items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.button key={`${item.type}-${item.label}-${i}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        onClick={() => { item.action(); onClose(); }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer text-left"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No results found</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Navigation Component
// ---------------------------------------------------------------------------
export default function Navigation() {
  const {
    currentTab, setCurrentTab, sidebarCollapsed, setSidebarCollapsed,
    usageStats, createSession, userProfile,
  } = useVoiceDevStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const handleNavClick = useCallback((tab: TabId) => setCurrentTab(tab), [setCurrentTab]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  }, []);

  // Keyboard shortcuts for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (!e.altKey) return;
      const keyMap: Record<string, TabId> = {
        '1': 'landing', '2': 'chat', '3': 'dashboard', '4': 'workflows',
        '5': 'prompts', '6': 'templates', '7': 'editor', '8': 'terminal',
        '9': 'marketplace', '0': 'providers',
      };
      if (keyMap[e.key]) { e.preventDefault(); setCurrentTab(keyMap[e.key]); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentTab]);

  return (
    <TooltipProvider delayDuration={150}>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-card border-r overflow-hidden select-none"
        animate={{ width: sidebarCollapsed ? 52 : 220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b shrink-0">
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">V</div>
              <div>
                <p className="text-xs font-bold tracking-tight">VoiceDev</p>
                <p className="text-[9px] text-muted-foreground">2.0 · 1000+ features</p>
              </div>
            </motion.div>
          )}
          {sidebarCollapsed && (
            <div className="h-8 w-8 mx-auto rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">V</div>
          )}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className={cn("h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer", searchOpen && "bg-accent text-foreground")}>
                <Search className="h-3 w-3" />
              </button>
              <button onClick={() => setSidebarCollapsed(true)}
                className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Nav Search */}
        <NavSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2 space-y-1">
          {NAV_SECTIONS.map((section) => {
            const isCollapsed = collapsedSections.has(section.id);
            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                {sidebarCollapsed ? (
                  <div className="flex justify-center py-1">
                    <div className="w-6 h-px bg-border" />
                  </div>
                ) : (
                  <button onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
                    <span>{section.label}</span>
                    {isCollapsed ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronUp className="h-2.5 w-2.5" />}
                  </button>
                )}

                {/* Section Items */}
                {!isCollapsed && section.items.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  const badge = item.getBadge?.();

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <motion.button onClick={() => handleNavClick(item.id)}
                            className={cn(
                              "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors cursor-pointer relative",
                              isActive ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                            <Icon className="h-4.5 w-4.5" />
                            {badge && badge.text && (
                              <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-violet-500 text-white text-[7px] font-bold flex items-center justify-center">{badge.text}</span>
                            )}
                            {isActive && (
                              <motion.div layoutId="nav-active-indicator" className="absolute inset-0 rounded-lg bg-violet-600 -z-10" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col gap-0.5 max-w-[200px]">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground">{item.description}</span>
                          <span className="text-[10px] text-violet-400">{item.featureCount} features</span>
                          {item.shortcut && <kbd className="text-[9px] bg-muted px-1 py-0.5 rounded">{item.shortcut}</kbd>}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <motion.button key={item.id} onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer relative mb-0.5",
                        isActive ? "bg-violet-600/10 text-violet-400 font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                      whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                      <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "bg-violet-600 text-white" : "bg-muted/60"
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-medium truncate">{item.label}</p>
                        {!isActive && <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {badge && badge.text && (
                          <Badge variant={badge.variant} className="h-4 px-1 text-[9px]">{badge.text}</Badge>
                        )}
                        {item.shortcut && (
                          <kbd className="hidden lg:inline text-[8px] text-muted-foreground/60 bg-muted/40 px-1 py-0.5 rounded">{item.shortcut.replace('Alt+', '')}</kbd>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Widgets */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2 border-t space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Tokens used</span>
              <span className="font-mono text-violet-400 font-medium">{(usageStats.totalTokens / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">API calls</span>
              <span className="font-mono text-emerald-400 font-medium">{usageStats.totalCalls}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Providers</span>
              <span className="font-mono text-amber-400 font-medium">{Object.keys(useVoiceDevStore.getState().apiKeys).filter(k => useVoiceDevStore.getState().apiKeys[k]).length}/20</span>
            </div>
          </div>
        )}

        {/* Command Palette + Expand */}
        <div className="px-2 py-2 border-t shrink-0">
          {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)}
              className="w-full h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer mb-1">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className={cn("flex items-center gap-2 w-full rounded-lg border px-2.5 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer",
                  sidebarCollapsed && "justify-center px-0 border-0"
                )}
                whileTap={{ scale: 0.97 }}>
                <Command className="h-3.5 w-3.5 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span>Command Palette</span>
                    <kbd className="ml-auto text-[9px] bg-muted px-1.5 py-0.5 rounded border">⌘K</kbd>
                  </>
                )}
              </motion.button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right"><span>Command Palette</span></TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t">
        {/* Scrollable tabs row */}
        <div className="flex items-center h-14 overflow-x-auto custom-scrollbar px-1 gap-0.5">
          {allNavItems.slice(0, 10).map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <motion.button key={item.id} onClick={() => handleNavClick(item.id)}
                className={cn("flex flex-col items-center justify-center min-w-[48px] py-1.5 px-1.5 rounded-lg transition-colors cursor-pointer shrink-0",
                  isActive ? "text-violet-500" : "text-muted-foreground"
                )} whileTap={{ scale: 0.9 }}>
                {isActive && <motion.div layoutId="mobile-nav-indicator" className="absolute top-0 w-6 h-0.5 rounded-full bg-violet-500" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                <Icon className="h-4 w-4" />
                <span className="text-[9px] font-medium mt-0.5">{item.label}</span>
              </motion.button>
            );
          })}
          {/* More button */}
          <div className="relative group shrink-0">
            <button className="flex flex-col items-center justify-center min-w-[48px] py-1.5 px-1.5 text-muted-foreground cursor-pointer">
              <span className="text-[9px]">···</span>
            </button>
            {/* Popup menu for remaining items */}
            <div className="absolute bottom-14 right-0 w-48 bg-popover border rounded-lg shadow-xl p-1 hidden group-focus-within:block z-50">
              {allNavItems.slice(10).map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button key={item.id} onClick={() => handleNavClick(item.id)}
                    className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer text-left",
                      isActive ? "bg-violet-600/10 text-violet-400" : "hover:bg-accent"
                    )}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
