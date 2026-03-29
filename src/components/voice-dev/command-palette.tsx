'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Store, Cpu, Settings, Home, Plus,
  Search, Sun, Moon, Download, Trash2, Sparkles, ArrowRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS, getAllModels } from '@/lib/providers';
import { Badge } from '@/components/ui/badge';
import type { TabId } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  section: string;
  action: () => void;
  keywords?: string[];
  badge?: React.ReactNode;
}

interface CommandGroup {
  title: string;
  items: CommandItem[];
}

interface CommandPaletteProps {
  onShowShortcuts?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SECTION_ORDER = ['Quick Actions', 'Pages', 'Recent Sessions', 'Models', 'Providers'] as const;

function formatCtx(n: number): string {
  if (!n) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M ctx`;
  return `${Math.round(n / 1000)}K ctx`;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const overlayVar = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const dialogVar = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, damping: 28, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.15 } },
};
const groupVar = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommandPalette({ onShowShortcuts }: CommandPaletteProps) {
  const {
    currentTab, setCurrentTab, setCurrentSession, createSession,
    chatSessions, sidebarOpen, setSidebarOpen, clearAllData, exportData,
  } = useVoiceDevStore();
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ---- Keyboard shortcut to toggle ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ---- Reset on open / close ----
  useEffect(() => {
    if (open) { setQuery(''); setSelectedIdx(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  // ---- Build all commands ----
  const allCommands: CommandItem[] = useMemo(() => {
    const cmds: CommandItem[] = [];

    // Quick Actions
    cmds.push(
      { id: 'new-chat', icon: <Plus size={16} />, label: 'New Chat', description: 'Start a new conversation', section: 'Quick Actions', action: () => { createSession(); setCurrentTab('chat'); }, keywords: ['create', 'start'] },
      { id: 'toggle-sidebar', icon: sidebarOpen ? <ArrowRight size={16} /> : <MessageSquare size={16} />, label: 'Toggle Sidebar', description: sidebarOpen ? 'Hide the sidebar' : 'Show the sidebar', section: 'Quick Actions', action: () => setSidebarOpen(!sidebarOpen), keywords: ['panel', 'nav'] },
      { id: 'toggle-theme', icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />, label: 'Toggle Theme', description: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, section: 'Quick Actions', action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), keywords: ['appearance', 'light', 'dark', 'mode'] },
      { id: 'go-settings', icon: <Settings size={16} />, label: 'Go to Settings', description: 'Open application settings', section: 'Quick Actions', action: () => setCurrentTab('settings'), keywords: ['preferences', 'config'] },
      { id: 'go-marketplace', icon: <Store size={16} />, label: 'Go to Marketplace', description: 'Browse extensions and plugins', section: 'Quick Actions', action: () => setCurrentTab('marketplace'), keywords: ['extensions', 'plugins', 'store'] },
      { id: 'go-providers', icon: <Cpu size={16} />, label: 'Go to Providers', description: 'Manage AI providers and models', section: 'Quick Actions', action: () => setCurrentTab('providers'), keywords: ['models', 'ai', 'api'] },
      { id: 'export-data', icon: <Download size={16} />, label: 'Export Data', description: 'Download all data as JSON', section: 'Quick Actions', action: () => { const d = exportData(); const b = new Blob([d], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'voicedev-data.json'; a.click(); URL.revokeObjectURL(u); }, keywords: ['backup', 'download', 'save'] },
      { id: 'clear-history', icon: <Trash2 size={16} />, label: 'Clear All Data', description: 'Reset sessions, settings, and keys', section: 'Quick Actions', action: () => { clearAllData(); setCurrentTab('landing'); }, keywords: ['reset', 'delete', 'clean'] },
      { id: 'show-shortcuts', icon: <Sparkles size={16} />, label: 'Keyboard Shortcuts', description: 'View all keyboard shortcuts', section: 'Quick Actions', action: () => { setOpen(false); onShowShortcuts?.(); }, keywords: ['help', 'keys', 'hotkeys'] },
    );

    // Pages
    const pages: { id: TabId; icon: React.ReactNode; label: string; keywords: string[] }[] = [
      { id: 'landing', icon: <Home size={16} />, label: 'Landing', keywords: ['home', 'welcome'] },
      { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat', keywords: ['messages', 'conversation'] },
      { id: 'marketplace', icon: <Store size={16} />, label: 'Marketplace', keywords: ['store', 'extensions', 'plugins'] },
      { id: 'providers', icon: <Cpu size={16} />, label: 'Providers', keywords: ['ai', 'models', 'api'] },
      { id: 'settings', icon: <Settings size={16} />, label: 'Settings', keywords: ['preferences', 'config'] },
    ];
    for (const p of pages) {
      cmds.push({ id: `page-${p.id}`, icon: p.icon, label: p.label, description: `Navigate to ${p.label}`, section: 'Pages', action: () => setCurrentTab(p.id), keywords: p.keywords });
    }

    // Recent Sessions
    const recent = chatSessions.slice(0, 5);
    for (const s of recent) {
      const lastMsg = s.messages.length > 0 ? s.messages[s.messages.length - 1].content : '';
      cmds.push({
        id: `session-${s.id}`, icon: <MessageSquare size={16} />, label: s.name,
        description: `${s.messages.length} msg${s.messages.length !== 1 ? 's' : ''}${lastMsg ? ' · ' + truncate(lastMsg, 50) : ''}`,
        section: 'Recent Sessions', action: () => { setCurrentSession(s.id); setCurrentTab('chat'); },
        keywords: ['chat', 'session', 'history', 'conversation'],
      });
    }

    // Models
    const allModels = getAllModels();
    for (const m of allModels) {
      cmds.push({
        id: `model-${m.providerId}-${m.id}`, icon: <Cpu size={16} />, label: m.name,
        section: 'Models', action: () => { createSession(m.providerId, m.id); setCurrentTab('chat'); },
        keywords: [m.id, m.name, m.providerName, m.category, ...m.features],
        badge: (
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.providerColor }} />
            <span className="text-[11px] text-muted-foreground">{m.providerName}</span>
            {m.contextWindow > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{formatCtx(m.contextWindow)}</Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">{m.category}</Badge>
          </div>
        ),
      });
    }

    // Providers
    for (const p of PROVIDERS) {
      cmds.push({
        id: `provider-${p.id}`, icon: <Store size={16} />, label: p.name,
        description: `${p.models.length} models · ${p.features.slice(0, 3).join(', ')}`,
        section: 'Providers', action: () => setCurrentTab('providers'),
        keywords: [p.id, p.name, ...p.features],
        badge: <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{p.models.length} models</Badge>,
      });
    }

    return cmds;
  }, [chatSessions, theme, sidebarOpen]);

  // ---- Filter & group ----
  const grouped: CommandGroup[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    let filtered: CommandItem[];
    if (q) {
      filtered = allCommands.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.keywords?.some(k => k.includes(q))
      );
    } else {
      // No query: show limited models & providers
      const core = allCommands.filter(c => c.section !== 'Models' && c.section !== 'Providers');
      const topModels = allCommands.filter(c => c.section === 'Models').slice(0, 5);
      const topProviders = allCommands.filter(c => c.section === 'Providers').slice(0, 5);
      filtered = [...core, ...topModels, ...topProviders];
    }

    const map: Record<string, CommandItem[]> = {};
    for (const cmd of filtered) {
      (map[cmd.section] ??= []).push(cmd);
    }

    return SECTION_ORDER.filter(s => map[s]?.length).map(s => ({ title: s, items: map[s]! }));
  }, [allCommands, query]);

  // ---- Flat list for keyboard nav ----
  const flatItems = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  // ---- Reset selection on filter change ----
  useEffect(() => { setSelectedIdx(0); }, [query, grouped]);

  // ---- Scroll selected into view ----
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  // ---- Keyboard navigation inside palette ----
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, flatItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && flatItems[selectedIdx]) { e.preventDefault(); flatItems[selectedIdx].action(); setOpen(false); }
    else if (e.key === 'Escape') { setOpen(false); }
  }, [flatItems, selectedIdx]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          variants={overlayVar}
          initial="hidden" animate="visible" exit="hidden"
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Dialog */}
          <motion.div
            variants={dialogVar}
            initial="hidden" animate="visible" exit="exit"
            className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-neutral-900/95 shadow-2xl shadow-black/40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, models, providers..."
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-muted-foreground font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[420px] overflow-y-auto px-2 py-2 custom-scrollbar">
              {grouped.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}
              {grouped.map((group) => (
                <motion.div key={group.title} variants={groupVar} initial="hidden" animate="visible" className="mb-1">
                  <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const idx = flatItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => { item.action(); setOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          idx === selectedIdx ? 'bg-white/10 text-foreground' : 'text-foreground/80 hover:bg-white/5'
                        }`}
                      >
                        <span className={`shrink-0 ${idx === selectedIdx ? 'text-violet-400' : 'text-muted-foreground'}`}>
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</div>
                          )}
                        </div>
                        {item.badge && <div className="shrink-0 flex items-center gap-1.5">{item.badge}</div>}
                      </button>
                    );
                  })}
                </motion.div>
              ))}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-muted-foreground">
              <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded text-[10px]">↑↓</kbd> Navigate</span>
              <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded text-[10px]">↵</kbd> Select</span>
              <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded text-[10px]">esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
