'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Plus, X, Trash2, Copy, Search, ChevronDown, ArrowUp, RefreshCw, Maximize2, Minimize2, Settings, Play, Clock, Command, Hash, FolderOpen } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const COMMAND_HISTORY = [
  { cmd: 'help', output: 'Available commands:\n  help          - Show this help\n  clear         - Clear terminal\n  echo <text>   - Print text\n  date          - Show current date\n  whoami        - Show user info\n  ls            - List files\n  pwd           - Print working directory\n  cat <file>    - Read file contents\n  env           - Show environment variables\n  neofetch      - System info\n  voice-dev     - VoiceDev platform info' },
  { cmd: 'echo Hello, VoiceDev!', output: 'Hello, VoiceDev!' },
  { cmd: 'date', output: new Date().toString() },
  { cmd: 'whoami', output: 'voicedev-user' },
  { cmd: 'pwd', output: '/home/voicedev' },
  { cmd: 'ls', output: 'drwxr-xr-x  2 user user 4096 Mar 29 node_modules/\ndrwxr-xr-x  4 user user 4096 Mar 29 src/\ndrwxr-xr-x  2 user user 4096 Mar 29 public/\n-rw-r--r--  1 user user  500 Mar 29 package.json\n-rw-r--r--  1 user user  200 Mar 29 tsconfig.json\n-rw-r--r--  1 user user  150 Mar 29 next.config.js' },
  { cmd: 'env', output: 'NODE_ENV=production\nNEXT_PUBLIC_APP_NAME=VoiceDev\nNEXT_PUBLIC_VERSION=2.0\nPORT=3000\nDATABASE_URL=postgresql://...' },
  { cmd: 'neofetch', output: `   ╭──────────────────╮\n   │    VoiceDev 2.0   │\n   ╰──────────────────╯\n\n   OS: Web Browser\n   Runtime: Next.js 16\n   Shell: VoiceDev Terminal\n   Theme: Dark Violet\n   AI Providers: 20\n   Models: 154\n   Tools: 42\n   Plugins: ${12}\n   Uptime: ${Math.floor((Date.now() % 86400000) / 3600000)}h ${Math.floor((Date.now() % 3600000) / 60000)}m` },
];

function processCommand(cmd: string, sessions: string[]): { output: string; type: 'output' | 'error' } {
  const trimmed = cmd.trim();
  if (!trimmed) return { output: '', type: 'output' };
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  switch (command) {
    case 'help': return { output: COMMAND_HISTORY[0].output, type: 'output' };
    case 'clear': return { output: '__CLEAR__', type: 'output' };
    case 'echo': return { output: args || '', type: 'output' };
    case 'date': return { output: new Date().toString(), type: 'output' };
    case 'whoami': return { output: 'voicedev-user', type: 'output' };
    case 'pwd': return { output: '/home/voicedev', type: 'output' };
    case 'ls': return { output: COMMAND_HISTORY[5].output, type: 'output' };
    case 'env': return { output: COMMAND_HISTORY[6].output, type: 'output' };
    case 'neofetch': return { output: COMMAND_HISTORY[7].output, type: 'output' };
    case 'cat': return args ? { output: `Contents of ${args}:\n[File content would be displayed here]`, type: 'output' } : { output: 'Usage: cat <filename>', type: 'error' };
    case 'node': return { output: args === '-v' ? 'v22.0.0' : args === '-e' ? parts.slice(2).join(' ') : 'Welcome to Node.js v22.0.0.\nType ".exit" to exit the REPL.', type: 'output' };
    case 'python': case 'python3': return { output: args === '--version' ? 'Python 3.12.0' : 'Python 3.12.0 (main, interactive terminal)\nType "help" for more information.', type: 'output' };
    case 'voice-dev': return { output: 'VoiceDev 2.0 - The Ultimate AI Agent Platform\n20+ AI Providers | 154 Models | 42 Tools | 1000+ Features\nBuilt with Next.js, TypeScript, Tailwind CSS', type: 'output' };
    case 'history': return { output: COMMAND_HISTORY.map((c, i) => `  ${i + 1}  ${c.cmd}`).join('\n'), type: 'output' };
    case 'uname': return { output: 'VoiceDev OS 2.0 x86_64', type: 'output' };
    case 'uptime': return { output: `up ${Math.floor((Date.now() % 86400000) / 3600000)} hours, ${Math.floor((Date.now() % 3600000) / 60000)} minutes`, type: 'output' };
    default: return { output: `command not found: ${command}\nType 'help' for available commands.`, type: 'error' };
  }
}

export default function TerminalPage() {
  const store = useVoiceDevStore();
  const { terminalSessions, createTerminalSession, addTerminalLine, deleteTerminalSession, clearTerminalSession, commandHistory: storeHistory } = store;
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [commandIndex, setCommandIndex] = useState(-1);
  const [createDialog, setCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [fontSize, setFontSize] = useState(13);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Create default session if none
  useEffect(() => {
    if (terminalSessions.length === 0) {
      const id = createTerminalSession('Main Terminal');
      setActiveSessionId(id);
      // Add welcome message
      addTerminalLine(id, { type: 'system', content: 'Welcome to VoiceDev Terminal v2.0' });
      addTerminalLine(id, { type: 'system', content: 'Type "help" for available commands.' });
      addTerminalLine(id, { type: 'output', content: '' });
    } else if (!activeSessionId) {
      setActiveSessionId(terminalSessions[0].id);
    }
  }, [terminalSessions, activeSessionId, createTerminalSession, addTerminalLine]);

  const activeSession = terminalSessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeSession?.history.length]);

  const handleCommand = (cmd: string) => {
    if (!activeSessionId) return;
    addTerminalLine(activeSessionId, { type: 'input', content: cmd });

    const result = processCommand(cmd, terminalSessions.map(s => s.id));
    if (result.output === '__CLEAR__') {
      clearTerminalSession(activeSessionId);
    } else if (result.output) {
      result.output.split('\n').forEach(line => {
        addTerminalLine(activeSessionId, { type: result.type, content: line });
      });
    }
    addTerminalLine(activeSessionId, { type: 'output', content: '' });
    setInput('');
    setCommandIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const allCommands = [...storeHistory].reverse();
      const nextIndex = commandIndex + 1;
      if (nextIndex < allCommands.length) {
        setCommandIndex(nextIndex);
        setInput(allCommands[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const prevIndex = commandIndex - 1;
      if (prevIndex >= 0) {
        setCommandIndex(prevIndex);
        setInput([...storeHistory].reverse()[prevIndex]);
      } else {
        setCommandIndex(-1);
        setInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      if (activeSessionId) clearTerminalSession(activeSessionId);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createTerminalSession(newName.trim());
    setActiveSessionId(id);
    addTerminalLine(id, { type: 'system', content: `Terminal "${newName.trim()}" created.` });
    setCreateDialog(false);
    setNewName('');
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-[#0a0a0f] text-green-400">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#12121a] border-b border-green-500/20">
          <TerminalIcon className="h-4 w-4 text-green-400" />
          <span className="text-xs font-medium text-green-400">VoiceDev Terminal</span>
          <div className="flex-1" />
          <Select value={String(fontSize)} onValueChange={(v) => setFontSize(parseInt(v))}>
            <SelectTrigger className="w-14 h-6 text-[9px] bg-transparent border-green-500/20 text-green-400"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="11">11px</SelectItem><SelectItem value="12">12px</SelectItem><SelectItem value="13">13px</SelectItem><SelectItem value="14">14px</SelectItem><SelectItem value="16">16px</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/10" onClick={() => setCreateDialog(true)}><Plus className="h-3 w-3" /></Button>
          {activeSessionId && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/10" onClick={() => { if (activeSessionId) clearTerminalSession(activeSessionId); }}><RefreshCw className="h-3 w-3" /></Button>
          )}
        </div>

        {/* Session Tabs */}
        {terminalSessions.length > 1 && (
          <div className="flex items-center gap-0 px-2 bg-[#0f0f17] border-b border-green-500/10 overflow-x-auto">
            {terminalSessions.map(session => (
              <button key={session.id} onClick={() => setActiveSessionId(session.id)}
                className={cn("px-3 py-1.5 text-[10px] border-b-2 transition-colors cursor-pointer",
                  activeSessionId === session.id ? "text-green-400 border-green-400" : "text-muted-foreground border-transparent hover:text-green-400/60"
                )}>
                {session.name}
                <span className="ml-1.5 text-green-400/40 hover:text-red-400 cursor-pointer" onClick={(e) => { e.stopPropagation(); deleteTerminalSession(session.id); }}>×</span>
              </button>
            ))}
          </div>
        )}

        {/* Terminal Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono" style={{ fontSize }}>
          {activeSession?.history.map((line, i) => (
            <div key={i} className={cn("whitespace-pre-wrap leading-relaxed",
              line.type === 'input' && 'text-green-300',
              line.type === 'output' && 'text-gray-300',
              line.type === 'error' && 'text-red-400',
              line.type === 'system' && 'text-cyan-400 italic',
              line.type === 'info' && 'text-yellow-400'
            )}>
              {line.type === 'input' && <span className="text-green-500 mr-2">❯</span>}
              {line.content}
            </div>
          ))}
          {/* Input Line */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-500 shrink-0">❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-0 outline-none text-green-300 font-mono caret-green-400"
              placeholder="Type a command..."
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#12121a] border-t border-green-500/10 text-[9px] text-green-400/50">
          <div className="flex items-center gap-3">
            <span>{activeSession?.name}</span>
            <span>{activeSession?.history.length || 0} lines</span>
            <span>{storeHistory.length} commands in history</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Ctrl+L to clear</span>
            <span>↑↓ for history</span>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Terminal</DialogTitle></DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Terminal name..." onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
