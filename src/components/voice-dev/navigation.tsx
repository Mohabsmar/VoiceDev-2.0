'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Store,
  Cpu,
  Settings,
  Keyboard,
  Command,
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

const navItems: {
  id: TabId;
  icon: React.ElementType;
  label: string;
  shortcut: string;
  getBadge?: () => { text: string; variant: 'default' | 'secondary' | 'outline' };
}[] = [
  {
    id: 'landing',
    icon: Home,
    label: 'Home',
    shortcut: '1',
  },
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'Chat',
    shortcut: '2',
  },
  {
    id: 'marketplace',
    icon: Store,
    label: 'Marketplace',
    shortcut: '3',
    getBadge: () => {
      const count = useVoiceDevStore.getState().installedItems.length;
      return count > 0
        ? { text: `${count}`, variant: 'default' as const }
        : { text: '', variant: 'secondary' as const };
    },
  },
  {
    id: 'providers',
    icon: Cpu,
    label: 'AI Providers',
    shortcut: '4',
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    shortcut: '5',
  },
];

export default function Navigation() {
  const { currentTab, setCurrentTab, installedItems } = useVoiceDevStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleNavClick = (tab: TabId) => {
    setCurrentTab(tab);
  };

  const handleCommandPalette = () => {
    // Trigger Ctrl+K via event
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true })
    );
  };

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

  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-16 flex-col items-center bg-card border-r py-4">
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            const badge = item.getBadge?.();

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <motion.div
                        layoutId="desktop-active-nav"
                        className="absolute inset-0 rounded-lg bg-violet-600 -z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    {/* Badge for marketplace */}
                    {badge && badge.text && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {badge.text}
                      </span>
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">{item.shortcut}</kbd>
                    to navigate
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Command Palette Button */}
        <div className="mt-auto space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={handleCommandPalette}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
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
        <div className="mt-2 mb-1">
          <span className="text-[10px] font-bold text-violet-500/60 tracking-[0.2em] select-none">
            VD
          </span>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center justify-around bg-card/80 backdrop-blur-lg border-t">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          const badge = item.getBadge?.();

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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
                  <span className="absolute -top-1 -right-2 h-3.5 min-w-3.5 px-0.5 rounded-full bg-violet-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {badge.text}
                  </span>
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
