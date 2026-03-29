'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Plus, Search, Settings, ExternalLink, Check, X, Eye, EyeOff, RefreshCw, Trash2, Globe, MessageSquare, FileText, Database, Palette, Gamepad2, Briefcase, Terminal, Code, Zap, Shield } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { Integration } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function IntegrationsPage() {
  const store = useVoiceDevStore();
  const { integrations, toggleIntegration, removeIntegration, updateIntegrationSettings, addIntegration } = store;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = [...integrations];
    if (categoryFilter !== 'all') items = items.filter(i => i.category === categoryFilter);
    if (search) { const q = search.toLowerCase(); items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)); }
    return items;
  }, [integrations, search, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(integrations.map(i => i.category));
    return Array.from(cats);
  }, [integrations]);

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const activeInt = settingsId ? integrations.find(i => i.id === settingsId) : null;

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <Link2 className="h-6 w-6 text-violet-500" /> Integrations
                <Badge variant="secondary" className="text-xs">{connectedCount}/{integrations.length} connected</Badge>
              </motion.h1>
              <p className="text-sm text-muted-foreground">Connect VoiceDev to your favorite tools and services</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Connected', value: connectedCount, icon: Check, color: 'text-green-400' },
              { label: 'Available', value: integrations.length, icon: Globe, color: 'text-blue-400' },
              { label: 'Categories', value: categories.length, icon: Zap, color: 'text-amber-400' },
              { label: 'Total Features', value: integrations.reduce((s, i) => s + i.features.length, 0), icon: Shield, color: 'text-violet-400' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card><CardContent className="p-3 text-center">
                  <stat.icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search integrations..." className="h-8 pl-8 text-xs" />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              <Badge variant={categoryFilter === 'all' ? 'default' : 'outline'} className="text-xs cursor-pointer shrink-0" onClick={() => setCategoryFilter('all')}>All</Badge>
              {categories.map(c => (
                <Badge key={c} variant={categoryFilter === c ? 'default' : 'outline'} className="text-xs cursor-pointer shrink-0" onClick={() => setCategoryFilter(c)}>{c}</Badge>
              ))}
            </div>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((int, i) => {
              const isConfigured = Object.keys(int.settings).length > 0;
              return (
                <motion.div key={int.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  className={cn("p-4 rounded-xl border transition-all",
                    int.status === 'connected' ? "border-green-500/30 bg-green-500/5" : "hover:border-violet-500/30"
                  )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{int.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          {int.name}
                          <Badge variant={int.status === 'connected' ? 'default' : 'outline'} className={cn("text-[9px] h-4", int.status === 'connected' && "bg-green-500")}>
                            {int.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">{int.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {int.features.map(f => <Badge key={f} variant="secondary" className="text-[9px] h-4">{f}</Badge>)}
                    <Badge variant="outline" className="text-[9px] h-4">{int.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={int.enabled ? 'default' : 'outline'} size="sm" className={cn("h-7 text-xs flex-1 gap-1.5", int.enabled && int.status === 'connected' && "bg-green-500 hover:bg-green-600")}
                      onClick={() => toggleIntegration(int.id)}>
                      {int.enabled && int.status === 'connected' ? <><Check className="h-3 w-3" /> Connected</> : <><ExternalLink className="h-3 w-3" /> Connect</>}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setSettingsId(int.id)}><Settings className="h-3 w-3" /></Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteConfirm(int.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={!!settingsId} onOpenChange={() => setSettingsId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{activeInt?.icon} {activeInt?.name} Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {activeInt?.features.length ? (
              <div><label className="text-xs text-muted-foreground">Available Features</label>
                <div className="flex flex-wrap gap-1 mt-1">{activeInt.features.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}</div>
              </div>
            ) : null}
            <div>
              <label className="text-xs text-muted-foreground">API Key / Token</label>
              <Input type="password" placeholder="Enter your API key..." className="h-8 text-sm" onBlur={(e) => {
                if (settingsId && e.target.value) updateIntegrationSettings(settingsId, { apiKey: e.target.value });
              }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Webhook URL (optional)</label>
              <Input placeholder="https://..." className="h-8 text-sm" onBlur={(e) => {
                if (settingsId && e.target.value) updateIntegrationSettings(settingsId, { webhookUrl: e.target.value });
              }} />
            </div>
            {activeInt?.id === 'github' && (
              <div><label className="text-xs text-muted-foreground">Repository Owner</label>
                <Input placeholder="username or org" className="h-8 text-sm" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsId(null)}>Close</Button>
            <Button onClick={() => { if (settingsId) toggleIntegration(settingsId); setSettingsId(null); }}>Save & Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Integration</DialogTitle><DialogDescription>Disconnect and remove this integration?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { removeIntegration(deleteConfirm); setDeleteConfirm(null); } }}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
