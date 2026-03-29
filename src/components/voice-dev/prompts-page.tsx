'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Search, Edit3, Trash2, Copy, Download, Star, Filter,
  Tag, MoreHorizontal, X, Save, Check, Heart, Share2, Clock, Eye,
  ChevronDown, FolderOpen, Zap, TrendingUp, Users, Globe, Lock,
  Unlock, FileText, Sparkles, Code, MessageSquare, GraduationCap,
  Palette, Music, Briefcase, Gamepad2, Lightbulb, BookMarked,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { PromptTemplate, PromptVariable } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const PROMPT_CATEGORIES = [
  { id: 'writing', name: 'Writing', icon: FileText, color: '#8b5cf6' },
  { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
  { id: 'chat', name: 'Conversation', icon: MessageSquare, color: '#10b981' },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: '#f59e0b' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: '#06b6d4' },
  { id: 'business', name: 'Business', icon: Briefcase, color: '#ef4444' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: '#ec4899' },
  { id: 'general', name: 'General', icon: Lightbulb, color: '#6366f1' },
];

const DEFAULT_TEMPLATES: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>[] = [
  { name: 'Code Reviewer', description: 'Thorough code review with best practices', content: 'You are an expert code reviewer. Review the following code for:\n1. Bugs and potential issues\n2. Security vulnerabilities\n3. Performance optimizations\n4. Code style and best practices\n5. Testing recommendations\n\nProvide specific, actionable feedback.\n\nCode:\n{{code}}', category: 'coding', tags: ['code', 'review', 'best-practices'], isPublic: true, author: 'VoiceDev', variables: [{ name: 'code', label: 'Code to review', type: 'text', required: true }] },
  { name: 'Blog Writer', description: 'SEO-optimized blog post generator', content: 'Write a comprehensive blog post about: {{topic}}\n\nRequirements:\n- Tone: {{tone}}\n- Length: {{length}} words\n- Include an engaging introduction\n- Use headers and subheaders\n- Add actionable takeaways\n- Include a call-to-action\n\nTarget audience: {{audience}}', category: 'writing', tags: ['blog', 'seo', 'writing'], isPublic: true, author: 'VoiceDev', variables: [{ name: 'topic', label: 'Blog Topic', type: 'text', required: true }, { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Friendly', 'Authoritative'], default: 'Professional' }, { name: 'length', label: 'Word Count', type: 'number', default: '1500' }, { name: 'audience', label: 'Target Audience', type: 'text', default: 'Tech professionals' }] },
  { name: 'API Documentation', description: 'Generate API docs from code', content: 'Generate comprehensive API documentation for:\n{{code}}\n\nInclude:\n- Endpoint descriptions\n- Request/response formats\n- Authentication requirements\n- Error codes\n- Example requests with curl\n- Rate limiting info', category: 'coding', tags: ['api', 'docs', 'documentation'], isPublic: true, author: 'VoiceDev', variables: [{ name: 'code', label: 'API Code', type: 'text', required: true }] },
  { name: 'Meeting Summary', description: 'Summarize meeting transcripts', content: 'Summarize the following meeting transcript:\n\n{{transcript}}\n\nProvide:\n1. Key discussion points\n2. Decisions made\n3. Action items with assignees\n4. Follow-up dates\n5. Open questions', category: 'business', tags: ['meeting', 'summary', 'business'], isPublic: true, author: 'VoiceDev', variables: [{ name: 'transcript', label: 'Meeting Transcript', type: 'text', required: true }] },
  { name: 'Learning Plan', description: 'Create a personalized learning path', content: 'Create a detailed learning plan for {{subject}}\n\nCurrent level: {{level}}\nTime available: {{time}}\nLearning style: {{style}}\n\nInclude:\n- Weekly milestones\n- Recommended resources (free and paid)\n- Practice projects\n- Assessment checkpoints', category: 'education', tags: ['learning', 'education', 'planning'], isPublic: true, author: 'VoiceDev', variables: [{ name: 'subject', label: 'Subject', type: 'text', required: true }, { name: 'level', label: 'Current Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }, { name: 'time', label: 'Weekly Hours', type: 'number', default: '10' }, { name: 'style', label: 'Learning Style', type: 'select', options: ['Visual', 'Reading', 'Hands-on', 'Video'], default: 'Hands-on' }] },
  { name: 'Character Creator', description: 'Create detailed RPG characters', content: 'Create a detailed character for a {{genre}} story:\n\nName concept: {{concept}}\n\nInclude:\n- Full name and aliases\n- Backstory (2-3 paragraphs)\n- Personality traits and flaws\n- Special abilities/skills\n- Equipment/inventory\n- Relationships\n- Character arc suggestion', category: 'creative', tags: ['rpg', 'character', 'creative', 'story'], isPublic: true, author: 'VoiceDev', variables: [{ name: 'genre', label: 'Genre', type: 'select', options: ['Fantasy', 'Sci-Fi', 'Cyberpunk', 'Horror', 'Historical'], default: 'Fantasy' }, { name: 'concept', label: 'Name/Concept', type: 'text', required: true }] },
];

export default function PromptsPage() {
  const store = useVoiceDevStore();
  const { promptTemplates, createPromptTemplate, updatePromptTemplate, deletePromptTemplate } = store;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [createDialog, setCreateDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: '', description: '', content: '', category: 'general', tags: '', isPublic: true });
  const [showBuiltIn, setShowBuiltIn] = useState(true);

  const allPrompts = useMemo(() => {
    let prompts = [...promptTemplates];
    if (showBuiltIn) prompts = [...DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: `builtin-${i}`, createdAt: Date.now() - i * 100000, updatedAt: Date.now() - i * 100000, usageCount: Math.floor(Math.random() * 1000), rating: Math.floor(Math.random() * 3) + 3 } as PromptTemplate)), ...prompts];
    if (categoryFilter !== 'all') prompts = prompts.filter(p => p.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      prompts = prompts.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    switch (sortBy) {
      case 'newest': return prompts.sort((a, b) => b.createdAt - a.createdAt);
      case 'popular': return prompts.sort((a, b) => b.usageCount - a.usageCount);
      case 'rating': return prompts.sort((a, b) => b.rating - a.rating);
      case 'name': return prompts.sort((a, b) => a.name.localeCompare(b.name));
      default: return prompts;
    }
  }, [promptTemplates, search, categoryFilter, sortBy, showBuiltIn]);

  const handleCreate = () => {
    if (!newForm.name.trim() || !newForm.content.trim()) return;
    createPromptTemplate({
      name: newForm.name.trim(), description: newForm.description.trim(), content: newForm.content,
      category: newForm.category, tags: newForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic: newForm.isPublic, author: store.userName || 'User', variables: [],
    });
    setCreateDialog(false);
    setNewForm({ name: '', description: '', content: '', category: 'general', tags: '', isPublic: true });
  };

  const handleDuplicate = (template: PromptTemplate) => {
    createPromptTemplate({ ...template, name: `${template.name} (copy)`, author: store.userName || 'User' });
  };

  const handleUseInChat = (template: PromptTemplate) => {
    store.createSession();
    store.updateSettings({ systemPrompt: template.content });
    store.setCurrentTab('chat');
  };

  const activePreview = previewId ? allPrompts.find(p => p.id === previewId) : null;

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-violet-500" /> Prompt Library
                <Badge variant="secondary" className="text-xs">{allPrompts.length}</Badge>
              </motion.h1>
              <p className="text-sm text-muted-foreground">Create, share, and manage prompt templates</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowBuiltIn(!showBuiltIn)}>
                {showBuiltIn ? <Eye className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showBuiltIn ? 'Hide Built-in' : 'Show Built-in'}
              </Button>
              <Button className="h-8 text-xs gap-1.5" onClick={() => setCreateDialog(true)}>
                <Plus className="h-3 w-3" /> New Prompt
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search prompts..." className="h-8 pl-8 text-xs" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Used</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-0.5">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}><BookMarked className="h-3 w-3" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('list')}><FileText className="h-3 w-3" /></Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <Badge variant={categoryFilter === 'all' ? 'default' : 'outline'} className="text-xs cursor-pointer shrink-0" onClick={() => setCategoryFilter('all')}>All</Badge>
            {PROMPT_CATEGORIES.map(cat => {
              const count = allPrompts.filter(p => p.category === cat.id).length;
              if (count === 0 && categoryFilter !== cat.id) return null;
              return (
                <Badge key={cat.id} variant={categoryFilter === cat.id ? 'default' : 'outline'} className="text-xs cursor-pointer gap-1 shrink-0" onClick={() => setCategoryFilter(cat.id)} style={categoryFilter === cat.id ? { backgroundColor: cat.color } : { borderColor: cat.color }}>
                  <cat.icon className="h-3 w-3" /> {cat.name} ({count})
                </Badge>
              );
            })}
          </div>

          {/* Prompts Grid */}
          {allPrompts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No prompts found</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first prompt template</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPrompts.map((prompt, i) => {
                const cat = PROMPT_CATEGORIES.find(c => c.id === prompt.category);
                return (
                  <motion.div key={prompt.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                    className="p-4 rounded-xl border hover:border-violet-500/30 transition-all cursor-pointer group"
                    onClick={() => setPreviewId(prompt.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat?.color || '#888') + '20' }}>
                          {cat && <cat.icon className="h-4 w-4" style={{ color: cat?.color }} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">{prompt.name}</h3>
                          <p className="text-[10px] text-muted-foreground">{prompt.author}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-3 w-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUseInChat(prompt); }}><MessageSquare className="h-3 w-3 mr-2" /> Use in Chat</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(prompt); }}><Copy className="h-3 w-3 mr-2" /> Duplicate</DropdownMenuItem>
                          {!prompt.id.startsWith('builtin-') && <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(prompt.id); }}><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{prompt.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">{prompt.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[9px] h-4">{t}</Badge>)}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {prompt.isPublic && <Globe className="h-3 w-3" />}
                        {prompt.usageCount > 0 && <span>{prompt.usageCount} uses</span>}
                        {prompt.rating > 0 && <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" /> {prompt.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                    {prompt.variables && prompt.variables.length > 0 && (
                      <div className="mt-2 flex gap-1">{prompt.variables.map(v => <Badge key={v.name} variant="outline" className="text-[8px] h-4">{'{{' + v.name + '}}'}</Badge>)}</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1.5">
              {allPrompts.map((prompt, i) => {
                const cat = PROMPT_CATEGORIES.find(c => c.id === prompt.category);
                return (
                  <motion.div key={prompt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-violet-500/30 transition-colors cursor-pointer" onClick={() => setPreviewId(prompt.id)}>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (cat?.color || '#888') + '20' }}>
                      {cat && <cat.icon className="h-4 w-4" style={{ color: cat?.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prompt.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{prompt.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {prompt.rating > 0 && <span className="text-[10px] flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" /> {prompt.rating.toFixed(1)}</span>}
                      <span className="text-[10px] text-muted-foreground">{prompt.usageCount} uses</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activePreview?.name}</DialogTitle>
            <DialogDescription>{activePreview?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{activePreview?.category}</Badge>
              {activePreview?.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
              {activePreview?.variables?.map(v => <Badge key={v.name} variant="outline" className="gap-1"><Code className="h-2.5 w-2.5" /> {v.label} {v.required && '*'}</Badge>)}
            </div>
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">{activePreview?.content}</pre>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5" onClick={() => activePreview && handleUseInChat(activePreview)}><MessageSquare className="h-3.5 w-3.5" /> Use in Chat</Button>
              <Button variant="outline" className="gap-1.5" onClick={() => { if (activePreview) navigator.clipboard.writeText(activePreview.content); }}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Prompt Template</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Name *</label><Input value={newForm.name} onChange={(e) => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="My Prompt" /></div>
            <div><label className="text-xs text-muted-foreground">Description</label><Input value={newForm.description} onChange={(e) => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" /></div>
            <div><label className="text-xs text-muted-foreground">Category</label>
              <Select value={newForm.category} onValueChange={(v) => setNewForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROMPT_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs text-muted-foreground">Content *</label><Textarea value={newForm.content} onChange={(e) => setNewForm(f => ({ ...f, content: e.target.value }))} placeholder="Your prompt template... Use {{variable}} for placeholders" className="min-h-[150px] font-mono text-sm" /></div>
            <div><label className="text-xs text-muted-foreground">Tags (comma separated)</label><Input value={newForm.tags} onChange={(e) => setNewForm(f => ({ ...f, tags: e.target.value }))} placeholder="coding, review, best-practices" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="public" checked={newForm.isPublic} onChange={(e) => setNewForm(f => ({ ...f, isPublic: e.target.checked }))} className="rounded" />
              <label htmlFor="public" className="text-xs">Make public</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newForm.name.trim() || !newForm.content.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Prompt</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deletePromptTemplate(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
