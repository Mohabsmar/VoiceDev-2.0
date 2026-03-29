'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sun,
  Moon,
  Monitor,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
// Provider Groups
// ---------------------------------------------------------------------------
const PROVIDER_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: 'Major',
    ids: ['openai', 'anthropic', 'google', 'deepseek', 'xai'],
  },
  {
    label: 'Chinese',
    ids: ['zai', 'moonshot', 'minimax', 'qwen', 'siliconflow'],
  },
  {
    label: 'Fast',
    ids: ['groq', 'fireworks'],
  },
  {
    label: 'Specialized',
    ids: [
      'elevenlabs',
      'cohere',
      'replicate',
      'openrouter',
      'perplexity',
      'together',
      'ai21',
    ],
  },
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
// API Key Section
// ---------------------------------------------------------------------------
function ApiKeySection() {
  const { apiKeys, setApiKey } = useVoiceDevStore();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const testConnection = async (providerId: string) => {
    setTestingKey(providerId);
    setKeyStatuses((prev) => ({ ...prev, [providerId]: 'testing' }));
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          apiKey: apiKeys[providerId],
        }),
      });
      if (res.ok) {
        setKeyStatuses((prev) => ({ ...prev, [providerId]: 'success' }));
        toast.success('Connection successful!');
      } else {
        setKeyStatuses((prev) => ({ ...prev, [providerId]: 'error' }));
        toast.error('Connection failed. Check your API key.');
      }
    } catch {
      setKeyStatuses((prev) => ({ ...prev, [providerId]: 'error' }));
      toast.error('Connection test failed.');
    } finally {
      setTestingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {PROVIDER_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {group.label}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.ids.map((id) => {
              const provider = PROVIDERS.find((p) => p.id === id);
              if (!provider) return null;
              const key = apiKeys[id] || '';
              const isVisible = visibleKeys.has(id);
              const status = keyStatuses[id] || 'idle';

              return (
                <Card key={id} className="border-border/50">
                  <CardContent className="p-4 space-y-3">
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
                        {status === 'success' && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        )}
                        {status === 'error' && (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        {status === 'testing' && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
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
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {provider.envKey}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2 cursor-pointer"
                          asChild
                        >
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Get Key
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2 cursor-pointer"
                          onClick={() => testConnection(id)}
                          disabled={!key || testingKey === id}
                        >
                          {testingKey === id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
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
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default Model Section
// ---------------------------------------------------------------------------
function DefaultModelSection() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);
  const model = provider?.models.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Provider</Label>
          <Select
            value={selectedProvider}
            onValueChange={(v) => {
              setSelectedProvider(v);
              const p = PROVIDERS.find((p) => p.id === v);
              if (p && p.models.length > 0) setSelectedModel(p.models[0].id);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {provider?.models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {model && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{model.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {model.category}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {model.pricing}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Context Window: <strong className="text-foreground">{model.contextWindow.toLocaleString()}</strong> tokens</p>
              <p>Release: <strong className="text-foreground">{model.releaseDate}</strong></p>
              <div className="flex flex-wrap gap-1 mt-2">
                {model.features.map((f) => (
                  <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appearance Section
// ---------------------------------------------------------------------------
function AppearanceSection() {
  const { settings, updateSettings } = useVoiceDevStore();

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-2">
        <Label className="text-sm">Theme</Label>
        <div className="flex gap-2">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map((opt) => {
            const Icon = opt.icon;
            const isActive = settings.theme === opt.value;
            return (
              <Button
                key={opt.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={`gap-1.5 ${isActive ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'cursor-pointer'}`}
                onClick={() => updateSettings({ theme: opt.value as 'dark' | 'light' | 'system' })}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <Label className="text-sm">Accent Color</Label>
        <div className="flex gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updateSettings({ accentColor: c.value })}
              className={`h-8 w-8 rounded-full transition-all cursor-pointer ${
                settings.accentColor === c.value
                  ? 'ring-2 ring-offset-2 ring-offset-background'
                  : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: c.color,
                ...(settings.accentColor === c.value
                  ? { ringColor: c.color }
                  : {}),
              }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Font Size</Label>
          <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([v]) => updateSettings({ fontSize: v })}
          min={12}
          max={18}
          step={1}
          className="w-full"
        />
      </div>

      {/* Message Spacing */}
      <div className="space-y-2">
        <Label className="text-sm">Message Spacing</Label>
        <div className="flex gap-2">
          {['compact', 'comfortable'].map((opt) => (
            <Button
              key={opt}
              variant={settings.messageSpacing === opt ? 'default' : 'outline'}
              size="sm"
              className={`capitalize cursor-pointer ${
                settings.messageSpacing === opt
                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                  : ''
              }`}
              onClick={() =>
                updateSettings({
                  messageSpacing: opt as 'compact' | 'comfortable',
                })
              }
            >
              {opt}
            </Button>
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

  return (
    <div className="space-y-6">
      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Temperature</Label>
          <span className="text-sm font-mono text-muted-foreground">
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
        <p className="text-xs text-muted-foreground">{tempDescription}</p>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Max Tokens</Label>
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
      <div className="space-y-2">
        <Label className="text-sm">System Prompt</Label>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {SYSTEM_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => updateSettings({ systemPrompt: preset.value })}
              className={`px-2.5 py-1 rounded-full text-[10px] border transition-colors cursor-pointer ${
                settings.systemPrompt === preset.value
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Textarea
          value={settings.systemPrompt}
          onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
          className="min-h-[80px] text-sm"
          placeholder="Enter system prompt..."
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Stream Responses</Label>
            <p className="text-xs text-muted-foreground">
              Show AI responses as they are generated
            </p>
          </div>
          <Switch
            checked={settings.stream}
            onCheckedChange={(v) => updateSettings({ stream: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Show Token Counts</Label>
            <p className="text-xs text-muted-foreground">
              Display token usage on AI messages
            </p>
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
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearHistory = () => {
    clearAllData();
    toast.success('All data has been cleared.');
  };

  // Calculate storage usage (rough estimate)
  const storageSize = new Blob([
    JSON.stringify({ chatSessions, installedItems, apiKeys }),
  ]).size;
  const storageMB = (storageSize / (1024 * 1024)).toFixed(2);
  const storagePercent = Math.min((storageSize / (5 * 1024 * 1024)) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Storage usage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Storage Usage</Label>
          <span className="text-xs text-muted-foreground">
            {storageMB} MB / 5 MB
          </span>
        </div>
        <Progress value={storagePercent} className="h-2" />
      </div>

      <Separator />

      {/* Export / Import */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={handleImport}
        >
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

      <Separator />

      {/* Clear Data */}
      <div className="space-y-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-red-500 hover:text-red-400 cursor-pointer border-red-500/20 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
              Clear Chat History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your conversations, messages, and API keys.
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
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-muted-foreground">Version</span>
          <p className="font-medium">2.0.0</p>
        </div>
        <div>
          <span className="text-muted-foreground">Built With</span>
          <p className="font-medium">Next.js 15, TypeScript</p>
        </div>
        <div>
          <span className="text-muted-foreground">UI</span>
          <p className="font-medium">Tailwind CSS, shadcn/ui</p>
        </div>
        <div>
          <span className="text-muted-foreground">State</span>
          <p className="font-medium">Zustand</p>
        </div>
        <div>
          <span className="text-muted-foreground">AI SDK</span>
          <p className="font-medium">z-ai-web-dev-sdk</p>
        </div>
        <div>
          <span className="text-muted-foreground">License</span>
          <p className="font-medium">MIT</p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Built by</span>
        <span className="font-medium">An 11-year-old developer from Egypt</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        VoiceDev is an AI agent platform that connects 20+ AI providers, 150+ models,
        and 250+ tools into one seamless experience. Built with passion and determination
        to prove that age is no barrier to innovation.
      </p>

      <Button variant="outline" size="sm" asChild className="mt-2 cursor-pointer">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          GitHub
        </a>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card/50 backdrop-blur-sm px-4 py-4">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your VoiceDev experience
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-3xl mx-auto">
          <Accordion
            type="multiple"
            defaultValue={['api-keys', 'appearance', 'preferences']}
            className="space-y-3"
          >
            <AccordionItem value="api-keys" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                API Keys
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1">
                  <ApiKeySection />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="default-model" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Default Model
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1">
                  <DefaultModelSection />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="appearance" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Appearance
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1">
                  <AppearanceSection />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="preferences" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Chat Preferences
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1">
                  <ChatPreferencesSection />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Data Management
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1">
                  <DataManagementSection />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="about" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                About VoiceDev
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-1">
                  <AboutSection />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
