'use client';

import { motion } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Store,
  Cpu,
  Settings,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { TabId } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: 'landing', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'marketplace', icon: Store, label: 'Marketplace' },
  { id: 'providers', icon: Cpu, label: 'Providers' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Navigation() {
  const { currentTab, setCurrentTab } = useVoiceDevStore();

  const handleNavClick = (tab: TabId) => {
    setCurrentTab(tab);
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-16 flex-col items-center bg-card border-r py-4">
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
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
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <motion.div
                        layoutId="desktop-active-nav"
                        className="absolute inset-0 rounded-lg bg-violet-600 -z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="mt-auto mb-2">
          <span className="text-xs font-bold text-violet-500 tracking-widest select-none">
            VD
          </span>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center justify-around bg-card/80 backdrop-blur-lg border-t">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors cursor-pointer ${
                isActive ? 'text-violet-500' : 'text-muted-foreground'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-dot"
                  className="absolute top-0 w-8 h-0.5 rounded-full bg-violet-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
