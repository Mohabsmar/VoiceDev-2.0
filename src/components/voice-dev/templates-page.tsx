'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutTemplate, Plus, Search, MoreHorizontal, Trash2, Copy, Star, MessageSquare, Code, Briefcase, GraduationCap, Palette, Gamepad2, Lightbulb, FileText, Sparkles, Globe, Zap, Clock, Tag, Eye, Download, BookOpen, Users, Heart, ArrowRight, Filter, Check, X } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { ChatTemplate } from '@/lib/types';
import { PROVIDERS } from '@/lib/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const TEMPLATE_CATEGORIES = [
  { id: 'general', name: 'General', icon: Lightbulb, color: '#6366f1' },
  { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
  { id: 'writing', name: 'Writing', icon: FileText, color: '#8b5cf6' },
  { id: 'business', name: 'Business', icon: Briefcase, color: '#ef4444' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: '#06b6d4' },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: '#f59e0b' },
];

const DEFAULT_TEMPLATES: Omit<ChatTemplate, 'id' | 'createdAt' | 'usageCount'>[] = [
  { name: 'Default Assistant', description: 'General-purpose helpful assistant', icon: '🤖', systemPrompt: 'You are a helpful, harmless, and honest AI assistant. Provide clear, accurate, and well-structured responses.', provider: 'openai', model: 'gpt-4o', temperature: 0.7, maxTokens: 4096, category: 'general', tags: ['default', 'helpful'], isPublic: true, author: 'VoiceDev' },
  { name: 'Code Expert', description: 'Expert programmer with deep knowledge', icon: '💻', systemPrompt: 'You are an expert software engineer. Provide clean, efficient, well-commented code. Explain your approach, consider edge cases, and suggest best practices. Use appropriate design patterns.', provider: 'openai', model: 'gpt-4o', temperature: 0.3, maxTokens: 8192, category: 'coding', tags: ['code', 'programming', 'expert'], isPublic: true, author: 'VoiceDev' },
  { name: 'Creative Writer', description: 'Engaging creative content generator', icon: '✍️', systemPrompt: 'You are a creative writer. Generate engaging, vivid, and emotionally resonant content. Use rich metaphors, sensory details, and compelling narratives.', provider: 'anthropic', model: 'claude-opus-4-20250514', temperature: 0.9, maxTokens: 4096, category: 'writing', tags: ['creative', 'writing', 'stories'], isPublic: true, author: 'VoiceDev' },
  { name: 'Data Analyst', description: 'Analyze and visualize data', icon: '📊', systemPrompt: 'You are a data analysis expert. Help users understand their data through clear explanations, statistical analysis, and actionable insights. Use tables and structured formats when appropriate.', provider: 'anthropic', model: 'claude-sonnet-4-20250514', temperature: 0.4, maxTokens: 4096, category: 'business', tags: ['data', 'analysis', 'statistics'], isPublic: true, author: 'VoiceDev' },
  { name: 'Math Tutor', description: 'Patient math teacher', icon: '🔢', systemPrompt: 'You are a patient math tutor. Explain concepts step by step, use examples, and encourage understanding rather than just giving answers. Adapt to the student\'s level.', provider: 'openai', model: 'gpt-4o', temperature: 0.5, maxTokens: 4096, category: 'education', tags: ['math', 'tutoring', 'education'], isPublic: true, author: 'VoiceDev' },
  { name: 'Fast Responder', description: 'Quick responses for simple tasks', icon: '⚡', systemPrompt: 'You are a concise assistant. Provide brief, accurate responses. Be direct and efficient.', provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024, category: 'general', tags: ['fast', 'concise', 'quick'], isPublic: true, author: 'VoiceDev' },
];

export default function TemplatesPage() {
  const store = useVoiceDevStore();
  const { chatTemplates, createChatTemplate, deleteChatTemplate, useChatTemplate, createSession, setCurrentTab, updateSettings } = store;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: '', description: '', systemPrompt: '', provider: 'openai', model: 'gpt-4o', temperature: '0.7', maxTokens: '4096', category: 'general', tags: '', icon: '📝' });

  const allTemplates = useMemo(() => {
    let templates = [...DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `dt-${i}`, createdAt: Date.now(), usageCount: Math.floor(Math.random() * 500) } as ChatTemplate)), ...chatTemplates];
    if (categoryFilter !== 'all') templates = templates.filter(t => t.category === categoryFilter);
    if (search) { const q = search.toLowerCase(); templates = templates.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tg => tg.toLowerCase().includes(q))); }
    return templates;
  }, [chatTemplates, search, categoryFilter]);

  const handleUse = (template: ChatTemplate) => {
    createSession(template.provider, template.model);
    updateSettings({ systemPrompt: template.systemPrompt, temperature: template.temperature, maxTokens: template.maxTokens });
    useChatTemplate(template.id);
    setCurrentTab('chat');
  };

  const handleCreate = () => {
    if (!newForm.name.trim() || !newForm.systemPrompt.trim()) return;
    createChatTemplate({
      name: newForm.name.trim(), description: newForm.description.trim(), icon: newForm.icon,
      systemPrompt: newForm.systemPrompt, provider: newForm.provider, model: newForm.model,
      temperature: parseFloat(newForm.temperature), maxTokens: parseInt(newForm.maxTokens),
      category: newForm.category, tags: newForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic: true, author: store.userName || 'User',
    });
    setCreateDialog(false);
    setNewForm({ name: '', description: '', systemPrompt: '', provider: 'openai', model: 'gpt-4o', temperature: '0.7', maxTokens: '4096', category: 'general', tags: '', icon: '📝' });
  };

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <LayoutTemplate className="h-6 w-6 text-violet-500" /> Chat Templates
                <Badge variant="secondary" className="text-xs">{allTemplates.length}</Badge>
              </motion.h1>
              <p className="text-sm text-muted-foreground">Pre-configured chat setups for different use cases</p>
            </div>
            <Button className="h-8 text-xs gap-1.5" onClick={() => setCreateDialog(true)}><Plus className="h-3 w-3" /> New Template</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="h-8 pl-8 text-xs" />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              <Badge variant={categoryFilter === 'all' ? 'default' : 'outline'} className="text-xs cursor-pointer shrink-0" onClick={() => setCategoryFilter('all')}>All</Badge>
              {TEMPLATE_CATEGORIES.map(cat => (
                <Badge key={cat.id} variant={categoryFilter === cat.id ? 'default' : 'outline'} className="text-xs cursor-pointer gap-1 shrink-0"
                  onClick={() => setCategoryFilter(cat.id)} style={categoryFilter === cat.id ? { backgroundColor: cat.color } : { borderColor: cat.color }}>
                  <cat.icon className="h-3 w-3" /> {cat.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allTemplates.map((template, i) => {
              const provider = PROVIDERS.find(p => p.id === template.provider);
              const cat = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
              return (
                <motion.div key={template.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                  className="p-4 rounded-xl border hover:border-violet-500/30 transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium">{template.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span style={{ color: provider?.color }}>{provider?.name}</span>
                          <span>·</span>
                          <span>{template.model}</span>
                        </div>
                      </div>
                    </div>
                    {template.id.startsWith('dt-') ? null : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-3 w-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(template.id)}><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map(t => <Badge key={t} variant="secondary" className="text-[9px] h-4">{t}</Badge>)}
                    <Badge variant="outline" className="text-[9px] h-4 gap-0.5"><Clock className="h-2 w-2" /> {template.usageCount} uses</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                    <span>Temp: {template.temperature}</span>
                    <span>·</span>
                    <span>Tokens: {template.maxTokens.toLocaleString()}</span>
                  </div>
                  <Button className="w-full h-8 text-xs gap-1.5" onClick={() => handleUse(template)}>
                    <MessageSquare className="h-3 w-3" /> Use Template
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Chat Template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1"><label className="text-xs text-muted-foreground">Name</label><Input value={newForm.name} onChange={(e) => setNewForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="w-16"><label className="text-xs text-muted-foreground">Icon</label><Input value={newForm.icon} onChange={(e) => setNewForm(f => ({ ...f, icon: e.target.value }))} className="text-center text-lg" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Description</label><Input value={newForm.description} onChange={(e) => setNewForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-muted-foreground">Provider</label>
                <Select value={newForm.provider} onValueChange={(v) => setNewForm(f => ({ ...f, provider: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROVIDERS.slice(0, 10).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">Model</label>
                <Select value={newForm.model} onValueChange={(v) => setNewForm(f => ({ ...f, model: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROVIDERS.find(p => p.id === newForm.provider)?.models.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>) || []}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs text-muted-foreground">Temperature</label><Input type="number" step="0.1" min="0" max="2" value={newForm.temperature} onChange={(e) => setNewForm(f => ({ ...f, temperature: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Max Tokens</label><Input type="number" value={newForm.maxTokens} onChange={(e) => setNewForm(f => ({ ...f, maxTokens: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground">Category</label>
                <Select value={newForm.category} onValueChange={(v) => setNewForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">System Prompt</label><Textarea value={newForm.systemPrompt} onChange={(e) => setNewForm(f => ({ ...f, systemPrompt: e.target.value }))} className="min-h-[120px] font-mono text-sm" /></div>
            <div><label className="text-xs text-muted-foreground">Tags (comma separated)</label><Input value={newForm.tags} onChange={(e) => setNewForm(f => ({ ...f, tags: e.target.value }))} placeholder="general, helpful" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newForm.name.trim() || !newForm.systemPrompt.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Template</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteChatTemplate(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
