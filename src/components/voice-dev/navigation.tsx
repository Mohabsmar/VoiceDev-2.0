'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Store,
  Cpu,
  Settings,
  Keyboard,
  Command,
  Search,
  Clock,
  Wifi,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Pin,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { TabId } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Nav Item Configuration
// ---------------------------------------------------------------------------
interface NavItemConfig {
  id: TabId;
  icon: React.ElementType;
  label: string;
  shortcut: string;
  description: string;
  featureCount: number;
  getBadge?: () => { text: string; variant: 'default' | 'secondary' | 'outline' };
  contextActions?: Array<{ label: string; icon: React.ElementType; action: string }>;
}

const navItemsConfig: NavItemConfig[] = [
  {
    id: 'landing',
    icon: Home,
    label: 'Home',
    shortcut: '1',
    description: 'Welcome page and feature overview',
    featureCount: 8,
    contextActions: [
      { label: 'Go to Home', icon: Home, action: 'nav-landing' },
      { label: 'Open GitHub', icon: Star, action: 'open-github' },
    ],
  },
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'Chat',
    shortcut: '2',
    description: 'AI chat with multiple providers',
    featureCount: 15,
    getBadge: () => {
      const { chatSessions } = useVoiceDevStore.getState();
      const count = chatSessions.length;
      return count > 0
        ? { text: `${count}`, variant: 'default' as const }
        : { text: '', variant: 'secondary' as const };
    },
    contextActions: [
      { label: 'New Chat', icon: MessageSquare, action: 'new-chat' },
      { label: 'Recent Chats', icon: Clock, action: 'recent-chats' },
      { label: 'Pinned Messages', icon: Pin, action: 'pinned-messages' },
    ],
  },
  {
    id: 'marketplace',
    icon: Store,
    label: 'Marketplace',
    shortcut: '3',
    description: 'Browse and install AI tools',
    featureCount: 42,
    getBadge: () => {
      const count = useVoiceDevStore.getState().installedItems.length;
      return count > 0
        ? { text: `${count}`, variant: 'default' as const }
        : { text: '6', variant: 'secondary' as const };
    },
    contextActions: [
      { label: 'Browse All', icon: Store, action: 'nav-marketplace' },
      { label: 'My Installs', icon: Zap, action: 'my-installs' },
      { label: 'Collections', icon: Star, action: 'collections' },
    ],
  },
  {
    id: 'providers',
    icon: Cpu,
    label: 'AI Providers',
    shortcut: '4',
    description: 'Manage providers and models',
    featureCount: 20,
    contextActions: [
      { label: 'All Providers', icon: Cpu, action: 'nav-providers' },
      { label: 'Favorites', icon: Star, action: 'fav-models' },
      { label: 'Custom Endpoints', icon: Zap, action: 'custom-endpoints' },
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    shortcut: '5',
    description: 'Preferences and configuration',
    featureCount: 12,
    getBadge: () => {
      const { apiKeys } = useVoiceDevStore.getState();
      const hasKeyIssues = Object.values(apiKeys).some((k) => !k || k.length < 5);
      return hasKeyIssues
        ? { text: '!', variant: 'outline' as const }
        : { text: '', variant: 'secondary' as const };
    },
    contextActions: [
      { label: 'General', icon: Settings, action: 'settings-general' },
      { label: 'API Keys', icon: AlertTriangle, action: 'settings-keys' },
      { label: 'Appearance', icon: Zap, action: 'settings-appearance' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Context Menu Component
// ---------------------------------------------------------------------------
function ContextMenu({
  x,
  y,
  actions,
  onClose,
  onAction,
}: {
  x: number;
  y: number;
  actions: Array<{ label: string; icon: React.ElementType; action: string }>;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[200] min-w-[160px] rounded-lg border bg-popover p-1 shadow-lg"
        style={{ left: x, top: y }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.action}
              onClick={() => {
                onAction(action.action);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Nav Search Component
// ---------------------------------------------------------------------------
function NavSearch({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCurrentTab, createSession, chatSessions } = useVoiceDevStore();

  const allSearchable = [
    ...navItemsConfig.map((item) => ({
      type: 'page' as const,
      label: item.label,
      description: item.description,
      action: () => setCurrentTab(item.id),
      icon: item.icon,
    })),
    ...chatSessions.slice(0, 5).map((s) => ({
      type: 'session' as const,
      label: s.name,
      description: `${s.messages.length} messages`,
      action: () => {
        setCurrentTab('chat');
        useVoiceDevStore.getState().setCurrentSession(s.id);
      },
      icon: MessageSquare,
    })),
    {
      type: 'action' as const,
      label: 'New Chat',
      description: 'Start a new conversation',
      action: () => {
        createSession();
        setCurrentTab('chat');
      },
      icon: Zap,
    },
  ];

  const filtered = query
    ? allSearchable.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : allSearchable;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset query when closed via key approach
  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-16 top-0 w-64 bg-card border-r border-t border-b z-50 p-3 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, models..."
              className="h-7 text-xs border-0 bg-muted/50 focus-visible:ring-1"
            />
            <button
              onClick={onClose}
              className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
            {filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={`${item.type}-${item.label}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
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
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No results found</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Current Time Widget
// ---------------------------------------------------------------------------
function CurrentTimeWidget() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-[9px] text-muted-foreground/70 tabular-nums font-medium">
      {time}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Navigation Component
// ---------------------------------------------------------------------------
export default function Navigation() {
  const {
    currentTab,
    setCurrentTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    navTabOrder,
    setNavTabOrder,
    usageStats,
    createSession,
  } = useVoiceDevStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    actions: Array<{ label: string; icon: React.ElementType; action: string }>;
  } | null>(null);

  const [navSearchOpen, setNavSearchOpen] = useState(false);

  const handleNavClick = useCallback((tab: TabId) => {
    setCurrentTab(tab);
  }, [setCurrentTab]);

  const handleCommandPalette = useCallback(() => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })
    );
  }, []);

  const handleContextAction = useCallback((action: string) => {
    switch (action) {
      case 'nav-landing':
        setCurrentTab('landing');
        break;
      case 'new-chat':
        createSession();
        setCurrentTab('chat');
        break;
      case 'nav-marketplace':
      case 'nav-providers':
      case 'recent-chats':
      case 'pinned-messages':
      case 'my-installs':
      case 'collections':
      case 'fav-models':
      case 'custom-endpoints':
      case 'settings-general':
      case 'settings-keys':
      case 'settings-appearance':
        setCurrentTab(action.startsWith('nav-') ? action.replace('nav-', '') as TabId : (
          action.startsWith('settings-') ? 'settings' as TabId :
          action.includes('marketplace') || action.includes('install') || action.includes('collection') ? 'marketplace' as TabId :
          'chat' as TabId
        ));
        break;
      default:
        break;
    }
  }, [createSession, setCurrentTab]);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: NavItemConfig) => {
    e.preventDefault();
    if (item.contextActions) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        actions: item.contextActions,
      });
    }
  }, []);

  const handleDoubleClickCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  // Listen for number shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput || e.metaKey || e.ctrlKey || e.altKey) return;

      const tabMap: Record<string, TabId> = {
        '1': 'landing',
        '2': 'chat',
        '3': 'marketplace',
        '4': 'providers',
        '5': 'settings',
      };
      if (tabMap[e.key]) {
        setCurrentTab(tabMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentTab]);

  // Close context menu on scroll
  useEffect(() => {
    const handleScroll = () => setContextMenu(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getOrderedNavItems = () => {
    return [...navItemsConfig].sort(
      (a, b) => navTabOrder.indexOf(a.id) - navTabOrder.indexOf(b.id)
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={contextMenu.actions}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center bg-card border-r overflow-hidden"
        animate={{ width: sidebarCollapsed ? 48 : 64 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onDoubleClick={handleDoubleClickCollapse}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-2 right-1 z-10 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          style={{ opacity: sidebarCollapsed ? 0.6 : 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = sidebarCollapsed ? '0.6' : '0')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Nav Search Toggle */}
        <div className="mt-3 mb-1 w-full flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => setNavSearchOpen(!navSearchOpen)}
                className={`flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer ${
                  navSearchOpen ? 'bg-accent text-foreground' : ''
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <Search className="h-3.5 w-3.5" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col gap-0.5">
              <span className="font-medium">Search</span>
              <span className="text-[10px] text-muted-foreground">Pages, models, sessions</span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Nav Search Panel */}
        <NavSearch isOpen={navSearchOpen} onClose={() => setNavSearchOpen(false)} />

        {/* Nav Items */}
        <nav className="flex flex-1 flex-col items-center gap-1 mt-1 px-2 w-full">
          {getOrderedNavItems().map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            const badge = item.getBadge?.();

            return (
              <Reorder.Item
                key={item.id}
                value={item.id}
                asChild
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleNavClick(item.id)}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                      className={`relative flex items-center justify-center w-full rounded-lg transition-colors cursor-pointer ${
                        sidebarCollapsed ? 'h-10 w-10' : 'h-10'
                      } ${
                        isActive
                          ? 'bg-violet-600 text-white'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      drag
                      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      dragElastic={0.1}
                      onDragEnd={(_, info) => {
                        // Simple reorder based on drag direction
                        if (Math.abs(info.offset.y) > 20) {
                          const currentOrder = [...navTabOrder];
                          const currentIdx = currentOrder.indexOf(item.id);
                          const swapIdx = info.offset.y < 0
                            ? Math.max(0, currentIdx - 1)
                            : Math.min(currentOrder.length - 1, currentIdx + 1);
                          if (currentIdx !== swapIdx && swapIdx >= 0 && swapIdx < currentOrder.length) {
                            const newOrder = [...currentOrder];
                            [newOrder[currentIdx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[currentIdx]];
                            setNavTabOrder(newOrder);
                          }
                        }
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <motion.div
                          layoutId="desktop-active-nav"
                          className="absolute inset-0 rounded-lg bg-violet-600 -z-10"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      {/* Badge */}
                      {badge && badge.text && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className={`absolute ${
                            sidebarCollapsed ? '-top-0.5 -right-0.5' : '-top-0.5 right-1'
                          } h-4 min-w-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center`}
                        >
                          {badge.text}
                        </motion.span>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex flex-col gap-0.5 max-w-[200px]">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.description}</span>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">{item.shortcut}</kbd>
                        navigate
                      </span>
                      <span className="text-[10px] text-muted-foreground">{item.featureCount} features</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </Reorder.Item>
            );
          })}
        </nav>

        {/* Mini Widgets */}
        <div className={`px-2 w-full space-y-1 ${sidebarCollapsed ? 'px-1.5' : 'px-2'}`}>
          {/* Token Usage Widget */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-1 py-1 text-[9px] text-muted-foreground/70`}>
            {!sidebarCollapsed && (
              <>
                <span>Tokens</span>
                <span className="tabular-nums font-medium text-violet-500">
                  {(usageStats.totalTokens / 1000).toFixed(1)}K
                </span>
              </>
            )}
            {sidebarCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="tabular-nums text-[8px] font-medium text-violet-500">
                    {(usageStats.totalTokens / 1000).toFixed(0)}K
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="text-[10px]">Total tokens used: {usageStats.totalTokens.toLocaleString()}</span>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Active Provider Indicator */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-1.5'} px-1 py-1 text-[9px] text-muted-foreground/70`}>
            <Wifi className="h-2.5 w-2.5 text-green-500" />
            {!sidebarCollapsed && (
              <span className="truncate">Active</span>
            )}
          </div>

          {/* Current Time */}
          <div className="flex items-center justify-center px-1 py-1">
            <CurrentTimeWidget />
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`mt-auto space-y-1 ${sidebarCollapsed ? 'px-1.5' : 'px-2'} pb-2`}>
          {/* Command Palette Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={handleCommandPalette}
                className={`flex items-center justify-center ${sidebarCollapsed ? 'h-9 w-9' : 'h-10 w-full'} rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Command className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-medium">Command Palette</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">Ctrl</kbd>
                <span>+</span>
                <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">K</kbd>
              </span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* VD Logo */}
        <div className="py-2 border-t w-full flex justify-center">
          <span className="text-[10px] font-bold text-violet-500/60 tracking-[0.2em] select-none">
            {sidebarCollapsed ? 'V' : 'VD'}
          </span>
        </div>
      </motion.aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center justify-around bg-card/80 backdrop-blur-lg border-t">
        {navItemsConfig.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          const badge = item.getBadge?.();

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors cursor-pointer ${
                isActive ? 'text-violet-500' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobile-active-bar"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-violet-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon className="h-5 w-5" />
                {/* Badge for mobile */}
                {badge && badge.text && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-2 h-3.5 min-w-3.5 px-0.5 rounded-full bg-violet-500 text-white text-[8px] font-bold flex items-center justify-center"
                  >
                    {badge.text}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
