'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Plus, Search, ToggleLeft, ToggleRight, Trash2, Settings, MoreHorizontal, Download, Star, Shield, Zap, Eye, Globe, Lock, Check, X, Filter, Power, PowerOff, RefreshCw, ExternalLink } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { Plugin } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const AVAILABLE_PLUGINS: Plugin[] = [
  { id: 'code-runner', name: 'Code Runner', description: 'Execute code snippets in multiple languages', version: '2.1.0', author: 'VoiceDev', enabled: false, settings: { timeout: 30000, memory: '256MB' }, permissions: ['execute', 'filesystem:read'], hooks: ['onMessage', 'onCommand'], createdAt: Date.now(), icon: '⚡' },
  { id: 'web-search', name: 'Web Search', description: 'Search the web and retrieve real-time information', version: '1.5.0', author: 'VoiceDev', enabled: false, settings: { engine: 'google', maxResults: 5 }, permissions: ['network'], hooks: ['onMessage'], createdAt: Date.now(), icon: '🔍' },
  { id: 'image-gen', name: 'Image Generator', description: 'Generate images from text descriptions', version: '3.0.0', author: 'VoiceDev', enabled: false, settings: { defaultSize: '1024x1024', quality: 'high' }, permissions: ['network', 'storage:write'], hooks: ['onMessage', 'onCommand'], createdAt: Date.now(), icon: '🎨' },
  { id: 'file-manager', name: 'File Manager', description: 'Advanced file management and operations', version: '1.2.0', author: 'VoiceDev', enabled: false, settings: { autoSave: true, maxFileSize: '50MB' }, permissions: ['filesystem:read', 'filesystem:write'], hooks: ['onMessage', 'onCommand'], createdAt: Date.now(), icon: '📁' },
  { id: 'git-tools', name: 'Git Tools', description: 'Git operations and repository management', version: '2.0.0', author: 'VoiceDev', enabled: false, settings: { autoCommit: false, branch: 'main' }, permissions: ['filesystem:read', 'filesystem:write', 'network'], hooks: ['onCommand'], createdAt: Date.now(), icon: '🔀' },
  { id: 'database', name: 'Database Connector', description: 'Connect and query databases', version: '1.8.0', author: 'VoiceDev', enabled: false, settings: { type: 'postgresql' }, permissions: ['network', 'filesystem:read'], hooks: ['onMessage', 'onCommand'], createdAt: Date.now(), icon: '🗄️' },
  { id: 'api-monitor', name: 'API Monitor', description: 'Monitor and log API calls', version: '1.0.0', author: 'VoiceDev', enabled: false, settings: { logLevel: 'info', retention: 7 }, permissions: ['network'], hooks: ['onRequest', 'onResponse'], createdAt: Date.now(), icon: '📊' },
  { id: 'encryptor', name: 'Encryptor', description: 'Encrypt and decrypt sensitive data', version: '1.3.0', author: 'VoiceDev', enabled: false, settings: { algorithm: 'AES-256' }, permissions: ['crypto'], hooks: ['onMessage'], createdAt: Date.now(), icon: '🔐' },
  { id: 'scheduler', name: 'Scheduler', description: 'Schedule tasks and reminders', version: '1.1.0', author: 'VoiceDev', enabled: false, settings: { timezone: 'UTC' }, permissions: ['system'], hooks: ['onStartup', 'onTimer'], createdAt: Date.now(), icon: '⏰' },
  { id: 'translator', name: 'Translator', description: 'Translate text between languages', version: '2.2.0', author: 'VoiceDev', enabled: false, settings: { defaultLang: 'en', engine: 'google' }, permissions: ['network'], hooks: ['onMessage', 'onCommand'], createdAt: Date.now(), icon: '🌐' },
  { id: 'formatter', name: 'Code Formatter', description: 'Auto-format code in multiple languages', version: '1.4.0', author: 'VoiceDev', enabled: false, settings: { tabSize: 2, semi: true }, permissions: [], hooks: ['onMessage'], createdAt: Date.now(), icon: '✨' },
  { id: 'linter', name: 'Linter', description: 'Lint code for errors and style issues', version: '1.6.0', author: 'VoiceDev', enabled: false, settings: { rules: 'recommended' }, permissions: [], hooks: ['onMessage'], createdAt: Date.now(), icon: '🧹' },
];

export default function PluginsPage() {
  const store = useVoiceDevStore();
  const { plugins, installPlugin, uninstallPlugin, togglePlugin, updatePluginSettings } = store;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [settingsPlugin, setSettingsPlugin] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');

  const allPlugins = useMemo(() => {
    const installed = new Set(plugins.map(p => p.id));
    const merged = [...AVAILABLE_PLUGINS.map(p => ({ ...p, enabled: installed.has(p.id) ? (plugins.find(ip => ip.id === p.id)?.enabled ?? false) : false }))];
    let filtered = merged;
    if (statusFilter === 'enabled') filtered = filtered.filter(p => p.enabled);
    if (statusFilter === 'disabled') filtered = filtered.filter(p => !p.enabled);
    if (statusFilter === 'installed') filtered = filtered.filter(p => installed.has(p.id));
    if (search) { const q = search.toLowerCase(); filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)); }
    switch (sortBy) {
      case 'name': return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'version': return filtered.sort((a, b) => b.version.localeCompare(a.version));
      default: return filtered;
    }
  }, [plugins, search, statusFilter, sortBy]);

  const handleInstall = (plugin: Plugin) => {
    installPlugin({ ...plugin, enabled: true });
  };

  const handleUninstall = (id: string) => {
    uninstallPlugin(id);
  };

  const pluginSettings = settingsPlugin ? plugins.find(p => p.id === settingsPlugin) || AVAILABLE_PLUGINS.find(p => p.id === settingsPlugin) : null;

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <Puzzle className="h-6 w-6 text-violet-500" /> Plugins
                <Badge variant="secondary" className="text-xs">{allPlugins.length} available · {plugins.filter(p => p.enabled).length} active</Badge>
              </motion.h1>
              <p className="text-sm text-muted-foreground">Extend VoiceDev with powerful plugins</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plugins..." className="h-8 pl-8 text-xs" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="version">Version</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPlugins.map((plugin, i) => {
              const isInstalled = plugins.some(p => p.id === plugin.id);
              return (
                <motion.div key={plugin.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  className={cn("p-4 rounded-xl border transition-all", plugin.enabled ? "border-green-500/30 bg-green-500/5" : "hover:border-violet-500/30")}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{plugin.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-1.5">
                          {plugin.name}
                          {plugin.enabled && <Badge className="text-[8px] h-4 bg-green-500"><Check className="h-2 w-2 mr-0.5" /> Active</Badge>}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">v{plugin.version} by {plugin.author}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-3 w-3" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isInstalled ? (
                          <>
                            <DropdownMenuItem onClick={() => togglePlugin(plugin.id)}>{plugin.enabled ? <PowerOff className="h-3 w-3 mr-2" /> : <Power className="h-3 w-3 mr-2" />}{plugin.enabled ? 'Disable' : 'Enable'}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSettingsPlugin(plugin.id)}><Settings className="h-3 w-3 mr-2" /> Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(plugin.id)}><Trash2 className="h-3 w-3 mr-2" /> Uninstall</DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => handleInstall(plugin)}><Download className="h-3 w-3 mr-2" /> Install</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{plugin.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {plugin.permissions.map(p => <Badge key={p} variant="outline" className="text-[8px] h-4"><Shield className="h-2 w-2 mr-0.5" /> {p}</Badge>)}
                    {plugin.hooks.map(h => <Badge key={h} variant="secondary" className="text-[8px] h-4"><Zap className="h-2 w-2 mr-0.5" /> {h}</Badge>)}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isInstalled ? (
                      <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={() => handleInstall(plugin)}><Download className="h-3 w-3" /> Install</Button>
                    ) : (
                      <Button size="sm" variant={plugin.enabled ? 'outline' : 'default'} className={cn("h-7 text-xs flex-1 gap-1", plugin.enabled && "text-green-500 border-green-500/30")} onClick={() => togglePlugin(plugin.id)}>
                        {plugin.enabled ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        {plugin.enabled ? 'Enabled' : 'Enable'}
                      </Button>
                    )}
                    {isInstalled && (
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setSettingsPlugin(plugin.id)}><Settings className="h-3 w-3" /></Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={!!settingsPlugin} onOpenChange={() => setSettingsPlugin(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pluginSettings?.icon} {pluginSettings?.name} Settings
            </DialogTitle>
            <DialogDescription>v{pluginSettings?.version}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {pluginSettings && Object.entries(pluginSettings.settings || {}).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <Input defaultValue={String(value)} className="h-8 text-sm" onBlur={(e) => {
                  if (settingsPlugin) updatePluginSettings(settingsPlugin, { ...pluginSettings.settings, [key]: e.target.value });
                }} />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Permissions</label>
              <div className="flex flex-wrap gap-1">
                {pluginSettings?.permissions.map(p => <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>)}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hooks</label>
              <div className="flex flex-wrap gap-1">
                {pluginSettings?.hooks.map(h => <Badge key={h} variant="secondary" className="text-[10px]">{h}</Badge>)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsPlugin(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Uninstall Plugin</DialogTitle><DialogDescription>Remove this plugin and its settings?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { handleUninstall(deleteConfirm); setDeleteConfirm(null); } }}>Uninstall</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
