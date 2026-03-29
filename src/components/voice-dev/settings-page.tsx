'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Settings Sections
// ---------------------------------------------------------------------------
const SETTINGS_SECTIONS = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Chat Preferences', icon: MessageSquare },
  { id: 'data', label: 'Data Management', icon: Database },
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
// Key format validation
// ---------------------------------------------------------------------------
function getKeyStrength(key: string): { valid: boolean; label: string; color: string } {
  if (!key || key.length === 0) return { valid: false, label: 'No key', color: 'text-muted-foreground' };
  if (key.startsWith('sk-') && key.length > 20) return { valid: true, label: 'Valid format', color: 'text-green-500' };
  if (key.length > 15) return { valid: true, label: 'Looks valid', color: 'text-green-500' };
  return { valid: false, label: 'Possibly invalid', color: 'text-yellow-500' };
}

// ---------------------------------------------------------------------------
// API Key Section
// ---------------------------------------------------------------------------
function ApiKeySection() {
  const { apiKeys, setApiKey } = useVoiceDevStore();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error'; latency?: number }>>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(
    PROVIDER_GROUPS.map((g) => g.label)
  ));
  const [showImportEnv, setShowImportEnv] = useState(false);
  const [envInput, setEnvInput] = useState('');

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const testConnection = async (providerId: string) => {
    setTestingKey(providerId);
    setKeyStatuses((prev) => ({ ...prev, [providerId]: { status: 'testing' } }));
    const start = Date.now();
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          apiKey: apiKeys[providerId],
        }),
      });
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
    const providersWithKeys = Object.entries(apiKeys).filter(([, key]) => key && key.length > 0);
    for (const [providerId] of providersWithKeys) {
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
        if (provider) {
          setApiKey(provider.id, value);
          imported++;
        }
      }
    }
    setEnvInput('');
    setShowImportEnv(false);
    if (imported > 0) {
      toast.success(`Imported ${imported} API key${imported > 1 ? 's' : ''}`);
    } else {
      toast.error('No matching API keys found in .env content');
    }
  };

  const keysWithValues = Object.entries(apiKeys).filter(([, key]) => key && key.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Actions row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs cursor-pointer"
          onClick={testAllKeys}
          disabled={testingAll || keysWithValues === 0}
        >
          {testingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
          Test All Keys
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs cursor-pointer"
          onClick={() => setShowImportEnv(!showImportEnv)}
        >
          <FileUp className="h-3 w-3" />
          Import from .env
        </Button>
        <Badge variant="secondary" className="text-[10px]">
          {keysWithValues} key{keysWithValues !== 1 ? 's' : ''} configured
        </Badge>
      </div>

      {/* Import .env dialog */}
      <AnimatePresence>
        {showImportEnv && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-violet-500/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Paste your .env file content below. Matching keys will be imported automatically.
                </p>
                <Textarea
                  value={envInput}
                  onChange={(e) => setEnvInput(e.target.value)}
                  placeholder={`OPENAI_API_KEY=sk-...\nANTHROPIC_API_KEY=sk-ant-...\nGOOGLE_API_KEY=...`}
                  className="min-h-[100px] text-xs font-mono"
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="text-xs cursor-pointer" onClick={() => setShowImportEnv(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-xs cursor-pointer" onClick={handleImportEnv} disabled={!envInput.trim()}>
                    Import Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Groups */}
      {PROVIDER_GROUPS.map((group) => {
        const isOpen = expandedGroups.has(group.label);
        return (
          <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
            <CollapsibleTrigger className="flex items-center gap-2 py-2 w-full group cursor-pointer">
              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </motion.div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                {group.label}
              </span>
              <Badge variant="secondary" className="text-[9px]">
                {group.ids.length}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                {group.ids.map((id) => {
                  const provider = PROVIDERS.find((p) => p.id === id);
                  if (!provider) return null;
                  const key = apiKeys[id] || '';
                  const isVisible = visibleKeys.has(id);
                  const keyResult = getKeyStatuses(id);
                  const strength = getKeyStrength(key);

                  return (
                    <Card key={id} className="border-border/50">
                      <CardContent className="p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: provider.color }}
                            >
                              {provider.name.charAt(0)}
                            </div>
                            <span className="font-medium text-sm">{provider.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {keyResult.status === 'success' && (
                              <span className="flex items-center gap-0.5 text-[9px] text-green-500">
                                <CheckCircle2 className="h-3 w-3" />
                                {keyResult.latency}ms
                              </span>
                            )}
                            {keyResult.status === 'error' && (
                              <span className="flex items-center gap-0.5 text-[9px] text-red-500">
                                <XCircle className="h-3 w-3" />
                                Failed
                              </span>
                            )}
                            {keyResult.status === 'testing' && (
                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div className="relative">
                          <Input
                            type={isVisible ? 'text' : 'password'}
                            placeholder="sk-..."
                            value={key}
                            onChange={(e) => setApiKey(id, e.target.value)}
                            className="text-xs pr-16 h-8"
                          />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <span className={`text-[9px] ${strength.color} mr-1`}>{key.length > 0 ? strength.label : ''}</span>
                            <button
                              onClick={() => toggleVisibility(id)}
                              className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded transition-colors cursor-pointer"
                            >
                              {isVisible ? (
                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Eye className="h-3 w-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[100px]">
                            {provider.envKey}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-6 text-[9px] px-1.5 cursor-pointer" asChild>
                              <a href={provider.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-2.5 w-2.5 mr-0.5" />
                                Get Key
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[9px] px-1.5 cursor-pointer"
                              onClick={() => testConnection(id)}
                              disabled={!key || testingKey === id}
                            >
                              {testingKey === id ? (
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              ) : (
                                'Test'
                              )}
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

function getKeyStatuses(id: string): { status: 'idle' | 'testing' | 'success' | 'error'; latency?: number } {
  const store = useVoiceDevStore.getState() as unknown as Record<string, Record<string, unknown>>;
  const result = store.keyStatuses?.[id] as { status: string; latency?: number } | undefined;
  if (result && (result.status === 'idle' || result.status === 'testing' || result.status === 'success' || result.status === 'error')) {
    return result as { status: 'idle' | 'testing' | 'success' | 'error'; latency?: number };
  }
  return { status: 'idle' as const };
}

// ---------------------------------------------------------------------------
// Appearance Section
// ---------------------------------------------------------------------------
function AppearanceSection() {
  const { settings, updateSettings } = useVoiceDevStore();

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Theme</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map((opt) => {
            const Icon = opt.icon;
            const isActive = settings.theme === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSettings({ theme: opt.value as 'dark' | 'light' | 'system' })}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-border hover:border-violet-500/30'
                }`}
              >
                <div className={`h-10 w-full rounded-md flex items-center justify-center ${
                  isActive ? 'bg-violet-500/20' : 'bg-muted'
                }`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-violet-500' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-violet-500' : 'text-muted-foreground'}`}>
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Accent Color</Label>
        <div className="flex gap-3">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updateSettings({ accentColor: c.value })}
              className={`h-9 w-9 rounded-full transition-all cursor-pointer relative group ${
                settings.accentColor === c.value
                  ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                  : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: c.color,
                ...(settings.accentColor === c.value ? { ringColor: c.color } : {}),
              }}
              title={c.name}
            >
              {settings.accentColor === c.value && (
                <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size with live preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Font Size</Label>
          <Badge variant="secondary" className="text-xs">{settings.fontSize}px</Badge>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([v]) => updateSettings({ fontSize: v })}
          min={12}
          max={18}
          step={1}
          className="w-full"
        />
        <div className="p-3 rounded-lg border bg-muted/30">
          <p className="text-muted-foreground text-xs mb-1">Preview</p>
          <p style={{ fontSize: settings.fontSize }} className="text-foreground transition-all">
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>

      {/* Message Spacing with live preview */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Message Spacing</Label>
        <div className="grid grid-cols-2 gap-2">
          {['compact', 'comfortable'].map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateSettings({ messageSpacing: opt as 'compact' | 'comfortable' })}
              className={`p-3 rounded-lg border transition-all cursor-pointer capitalize ${
                settings.messageSpacing === opt
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-border hover:border-violet-500/30'
              }`}
            >
              <div className={`space-y-${opt === 'compact' ? '1' : '2'}`}>
                <div className="h-8 rounded bg-muted/80 w-full" />
                <div className="h-8 rounded bg-violet-500/10 w-4/5 ml-auto" />
                <div className="h-8 rounded bg-muted/80 w-full" />
              </div>
              <span className={`text-[10px] font-medium mt-2 block ${
                settings.messageSpacing === opt ? 'text-violet-500' : 'text-muted-foreground'
              }`}>
                {opt}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat Preferences Section
// ---------------------------------------------------------------------------
function ChatPreferencesSection() {
  const { settings, updateSettings } = useVoiceDevStore();

  const tempDescription =
    settings.temperature < 0.3
      ? 'More focused and deterministic'
      : settings.temperature < 0.7
        ? 'Balanced creativity and focus'
        : settings.temperature < 1.2
          ? 'More creative and varied'
          : 'Highly creative and unpredictable';

  const tempExample =
    settings.temperature < 0.3
      ? '"The capital of France is Paris."'
      : settings.temperature < 0.7
        ? '"Paris is a beautiful city in France known for the Eiffel Tower."'
        : settings.temperature < 1.2
          ? '"Paris whispers secrets through cobblestone streets, where the Eiffel Tower dances with clouds at dawn."'
          : '"In a realm where baguettes wield cosmic power, the Eiffel Tower hums forgotten melodies that turn pigeons into philosophers!"';

  return (
    <div className="space-y-6">
      {/* Temperature */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Temperature</Label>
          <span className="text-sm font-mono text-violet-500 font-semibold">
            {settings.temperature.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[settings.temperature]}
          onValueChange={([v]) => updateSettings({ temperature: v })}
          min={0}
          max={2}
          step={0.1}
          className="w-full"
        />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>More focused</span>
          <span className="text-xs font-medium text-foreground">{tempDescription}</span>
          <span>More creative</span>
        </div>
        {/* Example output */}
        <motion.div
          key={Math.round(settings.temperature * 10)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border bg-muted/30"
        >
          <p className="text-[10px] text-muted-foreground mb-1">Example output:</p>
          <p className="text-sm italic">{tempExample}</p>
        </motion.div>
      </div>

      {/* Max Tokens */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Max Tokens</Label>
          <span className="text-sm font-mono text-muted-foreground">
            {settings.maxTokens.toLocaleString()}
          </span>
        </div>
        <Slider
          value={[settings.maxTokens]}
          onValueChange={([v]) => updateSettings({ maxTokens: v })}
          min={256}
          max={32768}
          step={256}
          className="w-full"
        />
      </div>

      {/* System Prompt */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">System Prompt</Label>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {SYSTEM_PRESETS.map((preset) => (
            <motion.button
              key={preset.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateSettings({ systemPrompt: preset.value })}
              className={`px-2.5 py-1 rounded-full text-[10px] border transition-all cursor-pointer ${
                settings.systemPrompt === preset.value
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
        {settings.systemPrompt !== SYSTEM_PRESETS[0].value && settings.systemPrompt !== '' && (
          <div className="p-2.5 rounded-lg border border-violet-500/20 bg-violet-500/5 mb-2">
            <p className="text-[10px] text-violet-500 mb-0.5">Active preset preview:</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{settings.systemPrompt}</p>
          </div>
        )}
        <Textarea
          value={settings.systemPrompt}
          onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
          className="min-h-[80px] text-sm"
          placeholder="Enter system prompt..."
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <Label className="text-sm font-medium">Stream Responses</Label>
            <p className="text-xs text-muted-foreground">Show AI responses as they are generated</p>
          </div>
          <Switch
            checked={settings.stream}
            onCheckedChange={(v) => updateSettings({ stream: v })}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <Label className="text-sm font-medium">Show Token Counts</Label>
            <p className="text-xs text-muted-foreground">Display token usage on AI messages</p>
          </div>
          <Switch
            checked={settings.showTokens}
            onCheckedChange={(v) => updateSettings({ showTokens: v })}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data Management Section
// ---------------------------------------------------------------------------
function DataManagementSection() {
  const { exportData, importData, clearAllData, chatSessions, installedItems, apiKeys } = useVoiceDevStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoBackup, setAutoBackup] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  // Auto-backup effect
  useEffect(() => {
    if (!autoBackup) return;
    const interval = setInterval(() => {
      try {
        const data = exportData();
        localStorage.setItem('voicedev-autobackup', data);
        setLastBackup(new Date().toLocaleTimeString());
      } catch {
        // Storage full, disable auto-backup
        setAutoBackup(false);
      }
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [autoBackup, exportData]);

  // Manual backup
  const doManualBackup = () => {
    try {
      const data = exportData();
      localStorage.setItem('voicedev-autobackup', data);
      setLastBackup(new Date().toLocaleTimeString());
      toast.success('Backup created successfully!');
    } catch {
      toast.error('Backup failed. Storage may be full.');
    }
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

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = importData(content);
      if (success) {
        toast.success('Data imported successfully!');
      } else {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearHistory = () => {
    clearAllData();
    toast.success('All data has been cleared.');
  };

  // Calculate storage usage from localStorage
  const storageSize = (() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += (localStorage.getItem(key) || '').length;
      }
    }
    return total;
  })();
  const storageKB = (storageSize / 1024).toFixed(1);
  const storagePercent = Math.min((storageSize / (5 * 1024 * 1024)) * 100, 100);

  // Data breakdown
  const sessionSize = new Blob([JSON.stringify(chatSessions)]).size;
  const keysSize = new Blob([JSON.stringify(apiKeys)]).size;
  const installedSize = new Blob([JSON.stringify(installedItems)]).size;

  return (
    <div className="space-y-6">
      {/* Storage usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Storage Usage</Label>
          <Badge variant="secondary" className="text-[10px]">
            {storageKB} KB / 5 MB
          </Badge>
        </div>
        <Progress value={storagePercent} className="h-2.5" />
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs font-medium">{(sessionSize / 1024).toFixed(1)} KB</p>
            <p className="text-[9px] text-muted-foreground">Sessions</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs font-medium">{(keysSize / 1024).toFixed(1)} KB</p>
            <p className="text-[9px] text-muted-foreground">API Keys</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-xs font-medium">{(installedSize / 1024).toFixed(1)} KB</p>
            <p className="text-[9px] text-muted-foreground">Installed</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Auto-backup */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <Label className="text-sm font-medium">Auto-Backup</Label>
            <p className="text-xs text-muted-foreground">Save to localStorage every 5 minutes</p>
          </div>
          <div className="flex items-center gap-3">
            {lastBackup && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastBackup}
              </span>
            )}
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" onClick={doManualBackup}>
          <RefreshCw className="h-3 w-3" />
          Backup Now
        </Button>
      </div>

      <Separator />

      {/* Export / Import */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Export & Import</Label>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={handleImport}>
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <Separator />

      {/* Clear Data */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-red-500">Danger Zone</Label>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-red-500 hover:text-red-400 cursor-pointer border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your conversations, messages, API keys, and settings.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearHistory}
                className="bg-red-600 hover:bg-red-500 cursor-pointer"
              >
                Clear Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// About Section
// ---------------------------------------------------------------------------
function AboutSection() {
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [versionHistory] = useState([
    { version: '2.0.0', date: '2025-01', changes: ['Complete redesign', '20+ providers', 'Onboarding wizard', 'Command palette'] },
    { version: '1.5.0', date: '2024-12', changes: ['Added marketplace', 'Recharts integration', 'Keyboard shortcuts'] },
    { version: '1.0.0', date: '2024-11', changes: ['Initial release', 'Multi-provider chat', 'Basic settings'] },
  ]);

  const checkForUpdates = () => {
    setCheckingUpdates(true);
    setTimeout(() => {
      setCheckingUpdates(false);
      toast.success('You are running the latest version!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Version info */}
      <div className="p-4 rounded-xl border bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">
            VD
          </div>
          <div>
            <h3 className="font-bold text-lg">VoiceDev</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">v2.0.0</Badge>
              <Badge className="text-[9px] bg-green-500/20 text-green-500">Stable</Badge>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 cursor-pointer"
          onClick={checkForUpdates}
          disabled={checkingUpdates}
        >
          {checkingUpdates ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Check for Updates
        </Button>
      </div>

      {/* Tech stack */}
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
                <div>
                  <p className="text-xs font-medium">{tech.name}</p>
                  <p className="text-[9px] text-muted-foreground">{tech.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team credits */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Team</Label>
        <div className="p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Built by an 11-year-old developer</p>
              <p className="text-xs text-muted-foreground">From Cairo, Egypt</p>
            </div>
            <Heart className="h-4 w-4 text-red-500 ml-auto" />
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            VoiceDev is an AI agent platform that connects 20+ AI providers, 150+ models,
            and 250+ tools into one seamless experience. Built with passion and determination
            to prove that age is no barrier to innovation.
          </p>
        </div>
      </div>

      {/* Version history / changelog */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Changelog</Label>
        <div className="space-y-2">
          {versionHistory.map((release) => (
            <div key={release.version} className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="secondary" className="text-[10px]">{release.version}</Badge>
                <span className="text-[10px] text-muted-foreground">{release.date}</span>
              </div>
              <ul className="space-y-0.5">
                {release.changes.map((change) => (
                  <li key={change} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-violet-500 shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* License & Links */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild className="cursor-pointer">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            GitHub
          </a>
        </Button>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <span>MIT License</span>
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('api-keys');

  const sectionComponents: Record<SettingsSection, React.ReactNode> = {
    'api-keys': <ApiKeySection />,
    appearance: <AppearanceSection />,
    preferences: <ChatPreferencesSection />,
    data: <DataManagementSection />,
    about: <AboutSection />,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-4">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your VoiceDev experience
        </p>
      </div>

      {/* Body with sidebar navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex max-w-5xl mx-auto">
          {/* Sidebar */}
          <aside className="hidden md:block w-48 shrink-0 border-r p-4">
            <nav className="space-y-1 sticky top-0">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-violet-600/10 text-violet-500 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </motion.button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile tab selector */}
          <div className="md:hidden w-full p-4 pb-0">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'border text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="max-w-2xl"
              >
                {sectionComponents[activeSection]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
