'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Store,
  Cpu,
  Settings,
  X,
  Keyboard,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { TabId } from '@/lib/types';

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'K'], label: 'Command Palette', description: 'Open the command palette' },
  { keys: ['1'], label: 'Home', description: 'Navigate to home page' },
  { keys: ['2'], label: 'Chat', description: 'Navigate to chat' },
  { keys: ['3'], label: 'Marketplace', description: 'Navigate to marketplace' },
  { keys: ['4'], label: 'Providers', description: 'Navigate to providers' },
  { keys: ['5'], label: 'Settings', description: 'Navigate to settings' },
  { keys: ['?'], label: 'Keyboard Shortcuts', description: 'Show this panel' },
];

const ICON_MAP: Record<string, React.ElementType> = {
  'Command Palette': Keyboard,
  Home: Home,
  Chat: MessageSquare,
  Marketplace: Store,
  Providers: Cpu,
  Settings: Settings,
  'Keyboard Shortcuts': Keyboard,
};

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const { setCurrentTab, currentTab } = useVoiceDevStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }

      // Number shortcuts (when not in input)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setCurrentTab]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-violet-500" />
                  <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-accent transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="p-3 space-y-1">
                {SHORTCUTS.map((shortcut) => {
                  const Icon = ICON_MAP[shortcut.label] || Keyboard;
                  return (
                    <div
                      key={shortcut.label}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{shortcut.label}</p>
                          <p className="text-[10px] text-muted-foreground">{shortcut.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {shortcut.keys.map((key, i) => (
                          <span key={i}>
                            <kbd className="inline-flex h-6 items-center rounded border bg-muted px-2 text-[10px] font-medium text-muted-foreground">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-[10px] mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t">
                <p className="text-[10px] text-muted-foreground text-center">
                  Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[9px] font-medium">?</kbd> to toggle this panel
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
