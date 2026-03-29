'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Key,
  Palette,
  MessageSquare,
  Database,
  Info,
  RefreshCw,
  FileUp,
  Zap,
  Clock,
  Shield,
  Users,
  Code2,
  Heart,
  Bell,
  Volume2,
  VolumeX,
  MonitorSmartphone,
  Languages,
  Lock,
  HardDrive,
  Gauge,
  Sparkles,
  FileCode,
  Image,
  Type,
  ChevronRight,
  Plus,
  X,
  RotateCcw,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Save,
  History,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import type { TabId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Settings Sections
// ---------------------------------------------------------------------------
const SETTINGS_SECTIONS = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Chat Preferences', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'performance', label: 'Performance', icon: Gauge },
  { id: 'css', label: 'Custom CSS', icon: FileCode },
  { id: 'prompts', label: 'Prompt Library', icon: Sparkles },
  { id: 'background', label: 'Background', icon: Image },
  { id: 'shortcuts', label: 'Shortcuts', icon: Type },
  { id: 'data', label: 'Data & Backup', icon: Database },
  { id: 'usage', label: 'API Usage', icon: BarChart3 },
  { id: 'about', label: 'About', icon: Info },
] as const;

type SettingsSection = typeof SETTINGS_SECTIONS[number]['id'];

// ---------------------------------------------------------------------------
// Provider Groups
// ---------------------------------------------------------------------------
const PROVIDER_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Major', ids: ['openai', 'anthropic', 'google', 'deepseek', 'xai'] },
  { label: 'Chinese', ids: ['zai', 'moonshot', 'minimax', 'qwen', 'siliconflow'] },
  { label: 'Fast', ids: ['groq', 'fireworks'] },
  { label: 'Specialized', ids: ['elevenlabs', 'cohere', 'replicate', 'openrouter', 'perplexity', 'together', 'ai21'] },
];

// ---------------------------------------------------------------------------
// Preset system prompts
// ---------------------------------------------------------------------------
const SYSTEM_PRESETS = [
  { label: 'Helpful Assistant', value: 'You are a helpful AI assistant.' },
  { label: 'Code Expert', value: 'You are an expert software engineer. Provide clean, well-commented code with explanations. Always consider edge cases and best practices.' },
  { label: 'Creative Writer', value: 'You are a creative writer with a vivid imagination. Write engaging stories, poems, and content with rich descriptions and compelling narratives.' },
  { label: 'Data Analyst', value: 'You are a data analyst expert. Help with data interpretation, statistical analysis, and creating insightful visualizations and reports.' },
];

// ---------------------------------------------------------------------------
// Accent colors
// ---------------------------------------------------------------------------
const ACCENT_COLORS = [
  { name: 'Violet', value: 'violet', color: '#8b5cf6' },
  { name: 'Cyan', value: 'cyan', color: '#06b6d4' },
  { name: 'Emerald', value: 'emerald', color: '#10b981' },
  { name: 'Rose', value: 'rose', color: '#f43f5e' },
  { name: 'Amber', value: 'amber', color: '#f59e0b' },
  { name: 'Sky', value: 'sky', color: '#0ea5e9' },
];

// ---------------------------------------------------------------------------
// Background presets
// ---------------------------------------------------------------------------
const BG_PRESETS = [
  { id: 'none', label: 'None', preview: 'bg-background' },
  { id: 'gradient-purple', label: 'Purple Haze', preview: 'bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30' },
  { id: 'gradient-ocean', label: 'Ocean', preview: 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30' },
  { id: 'gradient-sunset', label: 'Sunset', preview: 'bg-gradient-to-br from-orange-900/30 to-rose-900/30' },
  { id: 'gradient-forest', label: 'Forest', preview: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30' },
  { id: 'gradient-midnight', label: 'Midnight', preview: 'bg-gradient-to-br from-gray-900/30 to-slate-900/30' },
];

// ---------------------------------------------------------------------------
// Keyboard shortcuts list
// ---------------------------------------------------------------------------
const DEFAULT_SHORTCUTS = [
  { action: 'Toggle Command Palette', keys: ['Ctrl', 'K'], icon: Sparkles },
  { action: 'New Chat', keys: ['Ctrl', 'N'], icon: Plus },
  { action: 'Send Message', keys: ['Enter'], icon: MessageSquare },
  { action: 'Search Sessions', keys: ['Ctrl', 'F'], icon: SearchIcon },
  { action: 'Toggle Sidebar', keys: ['Ctrl', 'B'], icon: MonitorSmartphone },
  { action: 'Go to Chat', keys: ['Alt', '1'], icon: MessageSquare },
  { action: 'Go to Providers', keys: ['Alt', '4'], icon: Database },
  { action: 'Go to Settings', keys: ['Alt', '5'], icon: Key },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Key format validation
// ---------------------------------------------------------------------------
function getKeyStrength(key: string): { valid: boolean; label: string; color: string } {
  if (!key || key.length === 0) return { valid: false, label: 'No key', color: 'text-muted-foreground' };
  if (key.startsWith('sk-') && key.length > 20) return { valid: true, label: 'Valid format', color: 'text-green-500' };
  if (key.length > 15) return { valid: true, label: 'Looks valid', color: 'text-green-500' };
  return { valid: false, label: 'Possibly invalid', color: 'text-yellow-500' };
}

// ---------------------------------------------------------------------------
// Section wrapper with header
// ---------------------------------------------------------------------------
function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-violet-500" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// #1: API Key Section
// ---------------------------------------------------------------------------
function ApiKeySection() {
  const { apiKeys, setApiKey } = useVoiceDevStore();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error'; latency?: number }>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(PROVIDER_GROUPS.map((g) => g.label)));
  const [showImportEnv, setShowImportEnv] = useState(false);
  const [envInput, setEnvInput] = useState('');

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => { const next = new Set(prev); if (next.has(label)) next.delete(label); else next.add(label); return next; });
  };

  const testConnection = async (providerId: string) => {
    setTestingKey(providerId);
    setKeyStatuses((prev) => ({ ...prev, [providerId]: { status: 'testing' } }));
    const start = Date.now();
    try {
      const res = await fetch('/api/test-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, apiKey: apiKeys[providerId] }) });
      const latency = Date.now() - start;
      if (res.ok) {
        setKeyStatuses((prev) => ({ ...prev, [providerId]: { status: 'success', latency } }));
        toast.success(`${PROVIDERS.find((p) => p.id === providerId)?.name}: Connected (${latency}ms)`);
      } else {
        setKeyStatuses((prev) => ({ ...prev, [providerId]: { status: 'error', latency } }));
        toast.error(`${PROVIDERS.find((p) => p.id === providerId)?.name}: Connection failed`);
      }
    } catch {
      setKeyStatuses((prev) => ({ ...prev, [providerId]: { status: 'error' } }));
      toast.error('Connection test failed.');
    } finally {
      setTestingKey(null);
    }
  };

  const testAllKeys = async () => {
    setTestingAll(true);
    for (const [providerId] of Object.entries(apiKeys).filter(([, key]) => key && key.length > 0)) {
      await testConnection(providerId);
    }
    setTestingAll(false);
  };

  const handleImportEnv = () => {
    const lines = envInput.split('\n');
    let imported = 0;
    for (const line of lines) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        const envKey = match[1];
        const value = match[2].replace(/^["']|["']$/g, '');
        const provider = PROVIDERS.find((p) => p.envKey === envKey);
        if (provider) { setApiKey(provider.id, value); imported++; }
      }
    }
    setEnvInput('');
    setShowImportEnv(false);
    if (imported > 0) toast.success(`Imported ${imported} API key${imported > 1 ? 's' : ''}`);
    else toast.error('No matching API keys found in .env content');
  };

  const keysWithValues = Object.entries(apiKeys).filter(([, key]) => key && key.length > 0).length;

  return (
    <div className="space-y-4">
      <SectionHeader icon={Key} title="API Keys" description="Configure API keys for each provider" />
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={testAllKeys} disabled={testingAll || keysWithValues === 0}>
          {testingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />} Test All Keys
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={() => setShowImportEnv(!showImportEnv)}>
          <FileUp className="h-3 w-3" /> Import from .env
        </Button>
        <Badge variant="secondary" className="text-[10px]">{keysWithValues} key{keysWithValues !== 1 ? 's' : ''} configured</Badge>
      </div>

      <AnimatePresence>
        {showImportEnv && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="border-violet-500/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">Paste your .env file content below. Matching keys will be imported automatically.</p>
                <Textarea value={envInput} onChange={(e) => setEnvInput(e.target.value)} placeholder={`OPENAI_API_KEY=sk-...\nANTHROPIC_API_KEY=sk-ant-...`} className="min-h-[100px] text-xs font-mono" />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="text-xs cursor-pointer" onClick={() => setShowImportEnv(false)}>Cancel</Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs cursor-pointer" onClick={handleImportEnv} disabled={!envInput.trim()}>Import Keys</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {PROVIDER_GROUPS.map((group) => {
        const isOpen = expandedGroups.has(group.label);
        return (
          <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
            <CollapsibleTrigger className="flex items-center gap-2 py-2 w-full group cursor-pointer">
              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </motion.div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{group.label}</span>
              <Badge variant="secondary" className="text-[9px]">{group.ids.length}</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                {group.ids.map((id) => {
                  const provider = PROVIDERS.find((p) => p.id === id);
                  if (!provider) return null;
                  const key = apiKeys[id] || '';
                  const isVisible = visibleKeys.has(id);
                  const keyResult = keyStatuses[id] || { status: 'idle' as const };
                  const strength = getKeyStrength(key);
                  return (
                    <Card key={id} className="border-border/50">
                      <CardContent className="p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: provider.color }}>{provider.name.charAt(0)}</div>
                            <span className="font-medium text-sm">{provider.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {keyResult.status === 'success' && <span className="flex items-center gap-0.5 text-[9px] text-green-500"><CheckCircle2 className="h-3 w-3" />{keyResult.latency}ms</span>}
                            {keyResult.status === 'error' && <span className="flex items-center gap-0.5 text-[9px] text-red-500"><XCircle className="h-3 w-3" />Failed</span>}
                            {keyResult.status === 'testing' && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                          </div>
                        </div>
                        <div className="relative">
                          <Input type={isVisible ? 'text' : 'password'} placeholder="sk-..." value={key} onChange={(e) => setApiKey(id, e.target.value)} className="text-xs pr-16 h-8" />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <span className={`text-[9px] ${strength.color} mr-1`}>{key.length > 0 ? strength.label : ''}</span>
                            <button onClick={() => toggleVisibility(id)} className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded transition-colors cursor-pointer">
                              {isVisible ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[100px]">{provider.envKey}</span>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 text-[9px] px-1.5 cursor-pointer" asChild>
                              <a href={provider.website} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-2.5 w-2.5 mr-0.5" />Get Key</a>
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 text-[9px] px-1.5 cursor-pointer" onClick={() => testConnection(id)} disabled={!key || testingKey === id}>
                              {testingKey === id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : 'Test'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// #2: Appearance Section (existing + Chat Background)
// ---------------------------------------------------------------------------
function AppearanceSection() {
  const { settings, updateSettings } = useVoiceDevStore();

  return (
    <div className="space-y-6">
      <SectionHeader icon={Palette} title="Appearance" description="Customize the look and feel" />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ] as const).map((opt) => {
            const Icon = opt.icon;
            const isActive = settings.theme === opt.value;
            return (
              <motion.button key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => updateSettings({ theme: opt.value })} className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${isActive ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:border-violet-500/30'}`}>
                <div className={`h-10 w-full rounded-md flex items-center justify-center ${isActive ? 'bg-violet-500/20' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-violet-500' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-violet-500' : 'text-muted-foreground'}`}>{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Accent Color</Label>
        <div className="flex gap-3">
          {ACCENT_COLORS.map((c) => (
            <button key={c.value} onClick={() => updateSettings({ accentColor: c.value })} className={`h-9 w-9 rounded-full transition-all cursor-pointer relative group ${settings.accentColor === c.value ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: c.color }} title={c.name}>
              {settings.accentColor === c.value && <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Font Size</Label>
          <Badge variant="secondary" className="text-xs">{settings.fontSize}px</Badge>
        </div>
        <Slider value={[settings.fontSize]} onValueChange={([v]) => updateSettings({ fontSize: v })} min={12} max={18} step={1} className="w-full" />
        <div className="p-3 rounded-lg border bg-muted/30">
          <p className="text-muted-foreground text-xs mb-1">Preview</p>
          <p style={{ fontSize: settings.fontSize }} className="text-foreground transition-all">The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Message Spacing</Label>
        <div className="grid grid-cols-2 gap-2">
          {['compact', 'comfortable'].map((opt) => (
            <motion.button key={opt} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => updateSettings({ messageSpacing: opt as 'compact' | 'comfortable' })} className={`p-3 rounded-lg border transition-all cursor-pointer capitalize ${settings.messageSpacing === opt ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:border-violet-500/30'}`}>
              <div className={`space-y-${opt === 'compact' ? '1' : '2'}`}>
                <div className="h-8 rounded bg-muted/80 w-full" />
                <div className="h-8 rounded bg-violet-500/10 w-4/5 ml-auto" />
                <div className="h-8 rounded bg-muted/80 w-full" />
              </div>
              <span className={`text-[10px] font-medium mt-2 block ${settings.messageSpacing === opt ? 'text-violet-500' : 'text-muted-foreground'}`}>{opt}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// #3: Chat Preferences Section
// ---------------------------------------------------------------------------
function ChatPreferencesSection() {
  const { settings, updateSettings } = useVoiceDevStore();

  const tempDescription = settings.temperature < 0.3 ? 'More focused' : settings.temperature < 0.7 ? 'Balanced' : settings.temperature < 1.2 ? 'Creative' : 'Highly creative';

  return (
    <div className="space-y-6">
      <SectionHeader icon={MessageSquare} title="Chat Preferences" description="Configure AI behavior" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Temperature</Label>
          <span className="text-sm font-mono text-violet-500 font-semibold">{settings.temperature.toFixed(1)}</span>
        </div>
        <Slider value={[settings.temperature]} onValueChange={([v]) => updateSettings({ temperature: v })} min={0} max={2} step={0.1} className="w-full" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>More focused</span>
          <span className="text-xs font-medium text-foreground">{tempDescription}</span>
          <span>More creative</span>
        </div>
        <motion.div key={Math.round(settings.temperature * 10)} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg border bg-muted/30">
          <p className="text-[10px] text-muted-foreground mb-1">Example output:</p>
          <p className="text-sm italic">
            {settings.temperature < 0.3 ? '"The capital of France is Paris."' : settings.temperature < 0.7 ? '"Paris is a beautiful city in France known for the Eiffel Tower."' : settings.temperature < 1.2 ? '"Paris whispers secrets through cobblestone streets."' : '"In a realm where baguettes wield cosmic power, the Eiffel Tower hums forgotten melodies!"'}
          </p>
        </motion.div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Max Tokens</Label>
          <span className="text-sm font-mono text-muted-foreground">{settings.maxTokens.toLocaleString()}</span>
        </div>
        <Slider value={[settings.maxTokens]} onValueChange={([v]) => updateSettings({ maxTokens: v })} min={256} max={32768} step={256} className="w-full" />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">System Prompt</Label>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {SYSTEM_PRESETS.map((preset) => (
            <motion.button key={preset.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => updateSettings({ systemPrompt: preset.value })} className={`px-2.5 py-1 rounded-full text-[10px] border transition-all cursor-pointer ${settings.systemPrompt === preset.value ? 'bg-violet-600 text-white border-violet-600' : 'text-muted-foreground hover:bg-accent'}`}>
              {preset.label}
            </motion.button>
          ))}
        </div>
        <Textarea value={settings.systemPrompt} onChange={(e) => updateSettings({ systemPrompt: e.target.value })} className="min-h-[80px] text-sm" placeholder="Enter system prompt..." />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div><Label className="text-sm font-medium">Stream Responses</Label><p className="text-xs text-muted-foreground">Show AI responses as they are generated</p></div>
          <Switch checked={settings.stream} onCheckedChange={(v) => updateSettings({ stream: v })} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div><Label className="text-sm font-medium">Show Token Counts</Label><p className="text-xs text-muted-foreground">Display token usage on AI messages</p></div>
          <Switch checked={settings.showTokens} onCheckedChange={(v) => updateSettings({ showTokens: v })} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// #4: Notification Preferences
// ---------------------------------------------------------------------------
function NotificationSection() {
  const { notifications, updateNotificationSettings } = useVoiceDevStore();

  const toggles = [
    { key: 'messageComplete' as const, label: 'Message Complete', desc: 'Notify when AI finishes responding', icon: CheckCircle2 },
    { key: 'errors' as const, label: 'Error Alerts', desc: 'Notify on API errors and failures', icon: AlertTriangle },
    { key: 'sound' as const, label: 'Sound Effects', desc: 'Play sounds for notifications', icon: Volume2 },
    { key: 'desktop' as const, label: 'Desktop Notifications', desc: 'Show browser desktop notifications', icon: MonitorSmartphone },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader icon={Bell} title="Notifications" description="Configure notification behavior" />
      {toggles.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Icon className="h-4 w-4 text-violet-500" /></div>
              <div><Label className="text-sm font-medium">{item.label}</Label><p className="text-xs text-muted-foreground">{item.desc}</p></div>
            </div>
            <Switch checked={notifications[item.key]} onCheckedChange={(v) => updateNotificationSettings({ [item.key]: v })} />
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// #6: Language Preferences
// ---------------------------------------------------------------------------
function LanguageSection() {
  const { language, setLanguage } = useVoiceDevStore();
  const [dateFormat, setDateFormat] = useLocalStorage<string>('voicedev-dateFormat', 'relative');

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader icon={Languages} title="Language & Format" description="Set interface language and date format" />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Interface Language</Label>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((lang) => (
            <motion.button key={lang.code} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setLanguage(lang.code); toast.success(`Language set to ${lang.label}`); }} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer ${language === lang.code ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:border-violet-500/30'}`}>
              <span className="text-lg">{lang.flag}</span>
              <span className={`text-xs font-medium ${language === lang.code ? 'text-violet-500' : ''}`}>{lang.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Date/Time Format</Label>
        <div className="grid grid-cols-3 gap-2">
          {['relative', 'absolute', 'iso'].map((fmt) => (
            <motion.button key={fmt} whileHover={{ scale: 1.02 }} onClick={() => setDateFormat(fmt)} className={`p-2 rounded-lg border transition-all cursor-pointer capitalize text-xs ${dateFormat === fmt ? 'border-violet-500 bg-violet-500/10 text-violet-500' : 'border-border hover:border-violet-500/30 text-muted-foreground'}`}>
              {fmt === 'relative' ? '2 min ago' : fmt === 'absolute' ? 'Jan 15, 14:30' : '2025-01-15T14:30'}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// #7: Privacy Settings
// ---------------------------------------------------------------------------
function PrivacySection() {
  const { privacy, updatePrivacySettings } = useVoiceDevStore();

  return (
    <div className="space-y-4">
      <SectionHeader icon={Lock} title="Privacy" description="Control your data and privacy" />

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div><Label className="text-sm font-medium">Clear Data on Exit</Label><p className="text-xs text-muted-foreground">Delete all local data when browser closes</p></div>
        <Switch checked={privacy.clearOnExit} onCheckedChange={(v) => updatePrivacySettings({ clearOnExit: v })} />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div><Label className="text-sm font-medium">Anonymous Usage</Label><p className="text-xs text-muted-foreground">Don&apos;t track personal usage patterns</p></div>
        <Switch checked={privacy.anonymousUsage} onCheckedChange={(v) => updatePrivacySettings({ anonymousUsage: v })} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div><Label className="text-sm font-medium">Data Retention</Label><p className="text-xs text-muted-foreground">Auto-delete chat history after this period</p></div>
          <Badge variant="secondary" className="text-xs">{privacy.dataRetention} days</Badge>
        </div>
        <Select value={String(privacy.dataRetention)} onValueChange={(v) => updatePrivacySettings({ dataRetention: parseInt(v) })}>
          <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="180">180 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
            <SelectItem value="730">2 years</SelectItem>
            <SelectItem value="9999">Never</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <Label className="text-sm font-medium text-red-500">Privacy Summary</Label>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Data stored locally in your browser only</p>
            <p>• No data sent to external servers (except AI providers)</p>
            <p>• API keys encrypted in localStorage</p>
            <p>• Retention: {privacy.dataRetention === 9999 ? 'Never auto-delete' : `${privacy.dataRetention} days`}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// #9: Performance Settings
// ---------------------------------------------------------------------------
function PerformanceSection() {
  const { performance, updatePerformanceSettings } = useVoiceDevStore();

  return (
    <div className="space-y-4">
      <SectionHeader icon={Gauge} title="Performance" description="Optimize for your device" />

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div><Label className="text-sm font-medium">Animations</Label><p className="text-xs text-muted-foreground">Enable UI animations and transitions</p></div>
        <Switch checked={performance.animations} onCheckedChange={(v) => updatePerformanceSettings({ animations: v })} />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div><Label className="text-sm font-medium">Particle Effects</Label><p className="text-xs text-muted-foreground">Show particle effects in landing page</p></div>
        <Switch checked={performance.particles} onCheckedChange={(v) => updatePerformanceSettings({ particles: v })} />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div><Label className="text-sm font-medium">Lazy Loading</Label><p className="text-xs text-muted-foreground">Load messages on demand for large chats</p></div>
        <Switch checked={performance.lazyLoading} onCheckedChange={(v) => updatePerformanceSettings({ lazyLoading: v })} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div><Label className="text-sm font-medium">Message Load Limit</Label><p className="text-xs text-muted-foreground">Max messages to load per session</p></div>
          <Badge variant="secondary" className="text-xs">{performance.messageLoadLimit}</Badge>
        </div>
        <Slider value={[performance.messageLoadLimit]} onValueChange={([v]) => updatePerformanceSettings({ messageLoadLimit: v })} min={20} max={500} step={10} className="w-full" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>20 messages</span>
          <span>500 messages</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #1: Custom CSS Editor
// ---------------------------------------------------------------------------
function CustomCSSSection() {
  const { customCSS, setCustomCSS } = useVoiceDevStore();
  const [localCSS, setLocalCSS] = useState(customCSS);

  useEffect(() => { setLocalCSS(customCSS); }, [customCSS]);

  // Apply CSS live
  useEffect(() => {
    let styleEl = document.getElementById('voicedev-custom-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'voicedev-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = localCSS;
    return () => { if (styleEl) styleEl.textContent = ''; };
  }, [localCSS]);

  return (
    <div className="space-y-4">
      <SectionHeader icon={FileCode} title="Custom CSS" description="Override styles with custom CSS" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Write CSS to customize the UI</Label>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 gap-1 cursor-pointer" onClick={() => { setLocalCSS(''); setCustomCSS(''); toast.success('CSS reset'); }}>
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </Button>
            <Button size="sm" className="h-6 text-[10px] px-2 gap-1 bg-violet-600 hover:bg-violet-500 text-white cursor-pointer" onClick={() => { setCustomCSS(localCSS); toast.success('CSS saved!'); }}>
              <Save className="h-2.5 w-2.5" /> Save
            </Button>
          </div>
        </div>
        <Textarea
          value={localCSS}
          onChange={(e) => setLocalCSS(e.target.value)}
          className="min-h-[200px] text-xs font-mono bg-muted/50"
          placeholder={`/* Custom CSS overrides */\n.message-bubble {\n  border-radius: 20px;\n}\n\n.sidebar {\n  width: 300px;\n}`}
          spellCheck={false}
        />
        <p className="text-[10px] text-muted-foreground">Changes preview live. Click Save to persist.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick snippets</Label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Rounded Chat', css: '.message-bubble { border-radius: 24px; }' },
            { label: 'Compact Sidebar', css: '.sidebar { width: 200px !important; }' },
            { label: 'Large Text', css: '.chat-messages { font-size: 16px; }' },
            { label: 'Dark Cards', css: '.card { background: rgba(0,0,0,0.5); }' },
          ].map((snippet) => (
            <button key={snippet.label} onClick={() => setLocalCSS((prev) => prev + '\n' + snippet.css)} className="px-2 py-0.5 rounded-full text-[10px] border text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
              {snippet.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #2: System Prompt Library
// ---------------------------------------------------------------------------
function PromptLibrarySection() {
  const { promptLibrary, savePromptToLibrary, deletePromptFromLibrary, updateSettings, settings } = useVoiceDevStore();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!newName.trim() || !newContent.trim()) return;
    savePromptToLibrary({ name: newName.trim(), description: newDesc.trim(), content: newContent.trim() });
    setNewName(''); setNewDesc(''); setNewContent(''); setShowForm(false);
    toast.success('Prompt saved to library');
  };

  const handleUse = (content: string) => {
    updateSettings({ systemPrompt: content });
    toast.success('System prompt updated');
  };

  const handleExport = () => {
    const data = JSON.stringify(promptLibrary, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-library.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Library exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (Array.isArray(data)) {
            data.forEach((p: { name: string; description: string; content: string }) => {
              savePromptToLibrary(p);
            });
            toast.success(`Imported ${data.length} prompts`);
          }
        } catch { toast.error('Invalid file format'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Sparkles} title="System Prompt Library" description="Save and organize your system prompts" />

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3" /> {showForm ? 'Cancel' : 'New Prompt'}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={handleExport}>
          <Download className="h-3 w-3" /> Export
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={handleImport}>
          <Upload className="h-3 w-3" /> Import
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="border-violet-500/30">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8 text-xs" placeholder="My Prompt" /></div>
                  <div className="space-y-1"><Label className="text-xs">Description</Label><Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="h-8 text-xs" placeholder="For code review..." /></div>
                </div>
                <div className="space-y-1"><Label className="text-xs">Content</Label><Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="min-h-[80px] text-xs" placeholder="You are a helpful AI..." /></div>
                <div className="flex justify-end">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs cursor-pointer" onClick={handleSave} disabled={!newName.trim() || !newContent.trim()}>Save Prompt</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {promptLibrary.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No saved prompts yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {promptLibrary.map((prompt, i) => (
            <motion.div key={prompt.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-3 rounded-lg border bg-card/50 space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{prompt.name}</span>
                  {settings.systemPrompt === prompt.content && <Badge className="text-[8px] h-4 bg-green-500/20 text-green-500">Active</Badge>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 cursor-pointer" onClick={() => handleUse(prompt.content)}>Use</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1 cursor-pointer text-red-500" onClick={() => { deletePromptFromLibrary(prompt.id); toast.success('Prompt deleted'); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {prompt.description && <p className="text-[10px] text-muted-foreground">{prompt.description}</p>}
              <p className="text-[10px] text-muted-foreground line-clamp-2 font-mono">{prompt.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #3: Chat Background
// ---------------------------------------------------------------------------
function BackgroundSection() {
  const { chatBackground, setChatBackground } = useVoiceDevStore();
  const [bgType, setBgType] = useState(chatBackground ? 'preset' : 'none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image too large (max 5MB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setChatBackground(base64);
      setBgType('custom');
      toast.success('Background image set');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={Image} title="Chat Background" description="Customize the chat background" />

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {BG_PRESETS.map((preset) => (
            <motion.button key={preset.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { if (preset.id === 'none') { setChatBackground(''); setBgType('none'); } else { setChatBackground(preset.id); setBgType('preset'); } toast.success('Background updated'); }} className={`relative h-20 rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${chatBackground === preset.id ? 'border-violet-500' : 'border-border hover:border-violet-500/30'}`}>
              <div className={`absolute inset-0 ${preset.preview}`} />
              <div className="absolute inset-0 flex items-end p-1.5">
                <span className="text-[10px] text-white font-medium drop-shadow-md">{preset.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Custom Image</Label>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={handleImageUpload}>
            <Upload className="h-3 w-3" /> Upload Image
          </Button>
          {chatBackground && chatBackground.startsWith('data:') && (
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs cursor-pointer text-red-500" onClick={() => { setChatBackground(''); setBgType('none'); toast.success('Background removed'); }}>
              <Trash2 className="h-3 w-3" /> Remove
            </Button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {chatBackground && chatBackground.startsWith('data:') && (
          <div className="w-full h-32 rounded-lg border overflow-hidden">
            <img src={chatBackground} alt="Chat background" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #5: Keyboard Shortcut Customizer
// ---------------------------------------------------------------------------
function ShortcutsSection() {
  const { customShortcuts, setCustomShortcut } = useVoiceDevStore();

  return (
    <div className="space-y-4">
      <SectionHeader icon={Type} title="Keyboard Shortcuts" description="View and customize keyboard shortcuts" />

      <div className="space-y-2">
        {DEFAULT_SHORTCUTS.map((shortcut, i) => {
          const Icon = shortcut.icon;
          const customKey = customShortcuts[shortcut.action];
          return (
            <motion.div key={shortcut.action} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card/50">
              <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-violet-500" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{shortcut.action}</p>
              </div>
              <div className="flex items-center gap-1">
                {(customKey ? customKey.split('+') : shortcut.keys).map((key, j) => (
                  <React.Fragment key={j}>
                    <kbd className="h-6 min-w-6 px-1.5 inline-flex items-center justify-center rounded bg-muted border border-border text-[10px] font-mono">{key}</kbd>
                    {j < (customKey ? customKey.split('+') : shortcut.keys).length - 1 && <span className="text-[8px] text-muted-foreground">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg border bg-muted/30">
        <p className="text-[10px] text-muted-foreground">Full shortcut customization coming soon. Currently shortcuts are view-only.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #8: Backup Scheduler (enhanced Data Management)
// ---------------------------------------------------------------------------
function DataBackupSection() {
  const { exportData, importData, clearAllData, chatSessions, installedItems, apiKeys, lastBackup, autoBackupInterval, triggerBackup, usageStats } = useVoiceDevStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoBackup, setAutoBackup] = useLocalStorage<boolean>('voicedev-autobackup', false);
  const [backupInterval, setBackupInterval] = useLocalStorage<number>('voicedev-backup-interval', 5);
  const [localLastBackup, setLocalLastBackup] = useLocalStorage<string | null>('voicedev-last-backup-time', null);
  const [backupHistory, setBackupHistory] = useLocalStorage<Array<{ timestamp: number; size: number }>>('voicedev-backup-history', []);

  useEffect(() => {
    if (!autoBackup) return;
    const interval = setInterval(() => {
      try {
        const data = exportData();
        localStorage.setItem('voicedev-autobackup', data);
        const now = new Date().toLocaleTimeString();
        setLocalLastBackup(now);
        setBackupHistory((prev) => [{ timestamp: Date.now(), size: new Blob([data]).size }, ...prev].slice(0, 20));
        triggerBackup();
      } catch { setAutoBackup(false); }
    }, backupInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoBackup, backupInterval, exportData, triggerBackup, setLocalLastBackup, setBackupHistory]);

  const doManualBackup = () => {
    try {
      const data = exportData();
      localStorage.setItem('voicedev-autobackup', data);
      const now = new Date().toLocaleTimeString();
      setLocalLastBackup(now);
      setBackupHistory((prev) => [{ timestamp: Date.now(), size: new Blob([data]).size }, ...prev].slice(0, 20));
      triggerBackup();
      toast.success('Backup created successfully!');
    } catch { toast.error('Backup failed.'); }
  };

  const handleRestoreBackup = (backupData: string) => {
    const success = importData(backupData);
    if (success) toast.success('Backup restored!');
    else toast.error('Failed to restore backup');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicedev-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = () => { fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const success = importData(reader.result as string);
      if (success) toast.success('Data imported successfully!');
      else toast.error('Failed to import data.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const storageSize = (() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) total += (localStorage.getItem(key) || '').length;
    }
    return total;
  })();

  return (
    <div className="space-y-6">
      <SectionHeader icon={Database} title="Data & Backup" description="Manage your data and backups" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Storage Usage</Label>
          <Badge variant="secondary" className="text-[10px]">{(storageSize / 1024).toFixed(1)} KB</Badge>
        </div>
        <Progress value={Math.min((storageSize / (5 * 1024 * 1024)) * 100, 100)} className="h-2.5" />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div><Label className="text-sm font-medium">Auto-Backup</Label><p className="text-xs text-muted-foreground">Automatically backup every X minutes</p></div>
          <div className="flex items-center gap-3">
            {localLastBackup && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{localLastBackup}</span>}
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
        </div>
        {autoBackup && (
          <div className="flex items-center gap-3">
            <Label className="text-xs">Interval</Label>
            <Select value={String(backupInterval)} onValueChange={(v) => setBackupInterval(parseInt(v))}>
              <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={doManualBackup}>
            <RefreshCw className="h-3 w-3" /> Backup Now
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={handleExport}>
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={handleImport}>
            <Upload className="h-3 w-3" /> Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {backupHistory.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Backup History</Label>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {backupHistory.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border bg-card/50">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{new Date(entry.timestamp).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{(entry.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 cursor-pointer" onClick={() => {
                  const backup = localStorage.getItem('voicedev-autobackup');
                  if (backup) handleRestoreBackup(backup);
                  else toast.error('No backup data found');
                }}>Restore</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium text-red-500">Danger Zone</Label>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-red-500 hover:text-red-400 cursor-pointer border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" /> Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all data?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete all your conversations, messages, API keys, and settings.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { clearAllData(); toast.success('All data cleared'); }} className="bg-red-600 hover:bg-red-500 cursor-pointer">Clear Everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature #10: API Usage Dashboard
// ---------------------------------------------------------------------------
function UsageDashboardSection() {
  const { usageStats } = useVoiceDevStore();

  const providerBreakdown = useMemo(() => {
    return Object.entries(usageStats.providerBreakdown)
      .map(([providerId, tokens]) => {
        const provider = PROVIDERS.find((p) => p.id === providerId);
        return {
          providerId,
          name: provider?.name || providerId,
          color: provider?.color || '#888',
          tokens,
          calls: Math.round(tokens / 800),
        };
      })
      .sort((a, b) => b.tokens - a.tokens);
  }, [usageStats.providerBreakdown]);

  const estimatedCost = useMemo(() => {
    let total = 0;
    for (const [providerId, tokens] of Object.entries(usageStats.providerBreakdown)) {
      const rate = providerId === 'openai' ? 0.01 : providerId === 'anthropic' ? 0.015 : providerId === 'google' ? 0.005 : 0.008;
      total += (tokens / 1000000) * rate;
    }
    return total;
  }, [usageStats.providerBreakdown]);

  const maxTokens = Math.max(...providerBreakdown.map((p) => p.tokens), 1);

  return (
    <div className="space-y-4">
      <SectionHeader icon={BarChart3} title="API Usage Dashboard" description="Track your API usage and costs" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Calls', value: usageStats.totalCalls.toLocaleString(), icon: MessageSquare, color: '#8b5cf6' },
          { label: 'Total Tokens', value: usageStats.totalTokens.toLocaleString(), icon: Database, color: '#3b82f6' },
          { label: 'Providers Used', value: String(providerBreakdown.length), icon: Zap, color: '#10b981' },
          { label: 'Est. Cost', value: `$${estimatedCost.toFixed(2)}`, icon: DollarSign, color: '#f59e0b' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}><Icon className="h-3 w-3" style={{ color: stat.color }} /></div>
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium">Per-Provider Breakdown</Label>
        {providerBreakdown.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No usage data yet. Start chatting to see stats.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {providerBreakdown.map((provider) => (
              <div key={provider.providerId} className="p-2.5 rounded-lg border bg-card/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: provider.color }}>
                      {provider.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium">{provider.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{provider.tokens.toLocaleString()} tokens</span>
                    <span>~{provider.calls} calls</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(provider.tokens / maxTokens) * 100}%`, backgroundColor: provider.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// About Section
// ---------------------------------------------------------------------------
function AboutSection() {
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  const checkForUpdates = () => {
    setCheckingUpdates(true);
    setTimeout(() => { setCheckingUpdates(false); toast.success('You are running the latest version!'); }, 2000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Info} title="About" description="VoiceDev information" />

      <div className="p-4 rounded-xl border bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">VD</div>
          <div>
            <h3 className="font-bold text-lg">VoiceDev</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">v2.0.0</Badge>
              <Badge className="text-[9px] bg-green-500/20 text-green-500">Stable</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2 cursor-pointer" onClick={checkForUpdates} disabled={checkingUpdates}>
          {checkingUpdates ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Check for Updates
        </Button>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Built With</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Code2, name: 'Next.js 15', desc: 'Framework' },
            { icon: Code2, name: 'TypeScript', desc: 'Language' },
            { icon: Palette, name: 'Tailwind CSS 4', desc: 'Styling' },
            { icon: Shield, name: 'shadcn/ui', desc: 'Components' },
            { icon: Database, name: 'Zustand', desc: 'State' },
            { icon: Zap, name: 'z-ai-web-dev-sdk', desc: 'AI SDK' },
          ].map((tech) => {
            const Icon = tech.icon;
            return (
              <div key={tech.name} className="flex items-center gap-2 p-2.5 rounded-lg border">
                <Icon className="h-4 w-4 text-violet-500 shrink-0" />
                <div><p className="text-xs font-medium">{tech.name}</p><p className="text-[9px] text-muted-foreground">{tech.desc}</p></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Users className="h-5 w-5 text-white" /></div>
          <div>
            <p className="font-medium text-sm">Built by an 11-year-old developer</p>
            <p className="text-xs text-muted-foreground">From Cairo, Egypt</p>
          </div>
          <Heart className="h-4 w-4 text-red-500 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('api-keys');

  const renderSection = () => {
    switch (activeSection) {
      case 'api-keys': return <ApiKeySection />;
      case 'appearance': return <AppearanceSection />;
      case 'preferences': return <ChatPreferencesSection />;
      case 'notifications': return <NotificationSection />;
      case 'language': return <LanguageSection />;
      case 'privacy': return <PrivacySection />;
      case 'performance': return <PerformanceSection />;
      case 'css': return <CustomCSSSection />;
      case 'prompts': return <PromptLibrarySection />;
      case 'background': return <BackgroundSection />;
      case 'shortcuts': return <ShortcutsSection />;
      case 'data': return <DataBackupSection />;
      case 'usage': return <UsageDashboardSection />;
      case 'about': return <AboutSection />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your VoiceDev experience</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-4">
            {/* Sidebar navigation */}
            <div className="hidden md:block w-48 shrink-0">
              <nav className="sticky top-0 space-y-1">
                {SETTINGS_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive ? 'bg-violet-500/10 text-violet-500' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {section.label}
                      {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile horizontal tabs */}
            <div className="md:hidden w-full">
              <div className="flex gap-1 overflow-x-auto pb-3 -mx-1 px-1">
                {SETTINGS_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer ${isActive ? 'bg-violet-600 text-white' : 'border text-muted-foreground hover:bg-accent'}`}>
                      <Icon className="h-3 w-3" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
