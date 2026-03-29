'use client';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, SortAsc, SortDesc, Trash2, Archive, Pin, PinOff, Copy,
  Download, MoreHorizontal, MessageSquare, Grid3X3, List, X, Check,
  Calendar, Tag, FolderOpen, ChevronDown, FileJson, FileText, FileSpreadsheet,
  Clock, Cpu, ArrowUpDown, Eye, EyeOff, RefreshCw, Import, CheckSquare,
  Square, TagIcon, FolderInput, Star, Hash, RotateCcw,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import type { ChatSession, TabId } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const store = useVoiceDevStore();
  const { chatSessions, currentSessionId, setCurrentSession, setCurrentTab, chatFolders, deleteSession, renameSession, archiveSession, unarchiveSession, pinSession, unpinSession, duplicateSession, exportSession, moveSessionToFolder, createFolder, addMessage } = store;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [providerFilter, setProviderFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [exportDialog, setExportDialog] = useState<string | null>(null);
  const [renameDialog, setRenameDialog] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewSession, setPreviewSession] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderFilter, setFolderFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [searchInMessages, setSearchInMessages] = useState(false);

  // Get all unique tags from sessions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    chatSessions.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [chatSessions]);

  // Filtered and sorted sessions
  const filteredSessions = useMemo(() => {
    let sessions = [...chatSessions];
    if (!showArchived) sessions = sessions.filter(s => !s.archived);
    if (providerFilter !== 'all') sessions = sessions.filter(s => s.provider === providerFilter);
    if (folderFilter !== 'all') {
      const folder = chatFolders.find(f => f.id === folderFilter);
      if (folder) sessions = sessions.filter(s => s.folderId === folderFilter);
    }
    if (tagFilter) sessions = sessions.filter(s => s.tags?.includes(tagFilter));
    if (search) {
      const q = search.toLowerCase();
      sessions = sessions.filter(s => {
        if (s.name.toLowerCase().includes(q)) return true;
        if (searchInMessages && s.messages.some(m => m.content.toLowerCase().includes(q))) return true;
        return false;
      });
    }
    // Pinned first
    const pinned = sessions.filter(s => s.pinned);
    const unpinned = sessions.filter(s => !s.pinned);
    const sortFn = (a: ChatSession, b: ChatSession) => {
      switch (sortBy) {
        case 'newest': return b.updatedAt - a.updatedAt;
        case 'oldest': return a.updatedAt - b.updatedAt;
        case 'most-messages': return b.messages.length - a.messages.length;
        case 'least-messages': return a.messages.length - b.messages.length;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    };
    pinned.sort(sortFn);
    unpinned.sort(sortFn);
    return [...pinned, ...unpinned];
  }, [chatSessions, search, sortBy, providerFilter, showArchived, folderFilter, tagFilter, searchInMessages, chatFolders]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSessions.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredSessions.map(s => s.id)));
  };

  const handleBatchDelete = () => {
    selectedIds.forEach(id => deleteSession(id));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleBatchArchive = () => {
    selectedIds.forEach(id => archiveSession(id));
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleExport = (id: string, format: string) => {
    const content = exportSession(id, format as 'json' | 'md' | 'txt' | 'csv');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDialog(null);
  };

  const handleRename = () => {
    if (renameDialog && renameValue.trim()) {
      renameSession(renameDialog, renameValue.trim());
      setRenameDialog(null);
      setRenameValue('');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        const id = `session-${Date.now()}`;
        store.setState(prev => ({
          chatSessions: [{
            id, name: data.name || 'Imported Chat', messages: data.messages || [],
            provider: data.provider || 'openai', model: data.model || 'gpt-4o',
            createdAt: data.createdAt || Date.now(), updatedAt: Date.now(),
          }, ...prev.chatSessions],
        }));
      } catch { /* invalid json */ }
    };
    input.click();
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), '#8b5cf6');
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const openSession = (id: string) => {
    setCurrentSession(id);
    setCurrentTab('chat');
  };

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-violet-500" /> History
              </motion.h1>
              <p className="text-sm text-muted-foreground">{chatSessions.length} conversations · {chatSessions.reduce((s, c) => s + c.messages.length, 0)} messages</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleImport}>
                <Import className="h-3 w-3" /> Import
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setSelectMode(!selectMode)}>
                <CheckSquare className="h-3 w-3" /> {selectMode ? 'Cancel' : 'Select'}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowArchived(!showArchived)}>
                {showArchived ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>
            </div>
          </div>

          {/* Batch Actions */}
          <AnimatePresence>
            {selectMode && selectedIds.size > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <span className="text-sm font-medium text-violet-400">{selectedIds.size} selected</span>
                <div className="flex-1" />
                <Button variant="destructive" size="sm" className="h-7 text-xs gap-1" onClick={handleBatchDelete}>
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleBatchArchive}>
                  <Archive className="h-3 w-3" /> Archive
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={toggleSelectAll}>
                  {selectedIds.size === filteredSessions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sessions..."
                className="h-8 pl-8 text-xs" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most-messages">Most Messages</SelectItem>
                <SelectItem value="least-messages">Least Messages</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Provider" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {PROVIDERS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Folder" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {chatFolders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {allTags.length > 0 && (
              <Select value={tagFilter} onValueChange={(v) => setTagFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Tag" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={searchInMessages ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0" onClick={() => setSearchInMessages(!searchInMessages)}>
                  <Hash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search in messages</TooltipContent>
            </Tooltip>
            <div className="flex gap-0.5">
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('list')}>
                <List className="h-3 w-3" />
              </Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}>
                <Grid3X3 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* New Folder */}
          {showNewFolder && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center gap-2">
              <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name..." className="h-8 text-xs flex-1" onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} />
              <Button size="sm" className="h-8 text-xs" onClick={handleCreateFolder}>Create</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            </motion.div>
          )}

          {/* Sessions */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No conversations found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              <Button className="mt-4" onClick={() => { store.createSession(); setCurrentTab('chat'); }}>Start a Chat</Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-1.5">
              {filteredSessions.map((session, i) => {
                const provider = PROVIDERS.find(p => p.id === session.provider);
                const isSelected = selectedIds.has(session.id);
                return (
                  <motion.div key={session.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className={cn("flex items-center gap-3 p-3 rounded-lg border hover:border-violet-500/30 transition-all cursor-pointer group",
                      session.id === currentSessionId ? "border-violet-500/50 bg-violet-500/5" : "",
                      isSelected ? "border-violet-500 bg-violet-500/10" : "",
                      session.archived ? "opacity-60" : ""
                    )}
                    onClick={() => selectMode ? toggleSelect(session.id) : openSession(session.id)}>
                    {selectMode && (
                      <button className="shrink-0" onClick={(e) => { e.stopPropagation(); toggleSelect(session.id); }}>
                        {isSelected ? <CheckSquare className="h-4 w-4 text-violet-500" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    )}
                    {session.pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: provider?.color + '20' }}>
                      <Cpu className="h-4 w-4" style={{ color: provider?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{session.name}</p>
                        {session.archived && <Badge variant="outline" className="text-[9px] h-4">Archived</Badge>}
                        {session.tags?.map(t => <Badge key={t} variant="secondary" className="text-[9px] h-4">{t}</Badge>)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{session.messages.length} messages</span>
                        <span>·</span>
                        <span>{provider?.name}</span>
                        <span>·</span>
                        <span>{session.model}</span>
                        <span>·</span>
                        <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setPreviewSession(session.id); }}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview</TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-3 w-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { openSession(session.id); }}>
                            <MessageSquare className="h-3.5 w-3.5 mr-2" /> Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setRenameDialog(session.id); setRenameValue(session.name); }}>
                            <SortAsc className="h-3.5 w-3.5 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => session.pinned ? unpinSession(session.id) : pinSession(session.id)}>
                            {session.pinned ? <PinOff className="h-3.5 w-3.5 mr-2" /> : <Pin className="h-3.5 w-3.5 mr-2" />}
                            {session.pinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateSession(session.id)}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Export</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleExport(session.id, 'json')}><FileJson className="h-3.5 w-3.5 mr-2" /> JSON</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(session.id, 'md')}><FileText className="h-3.5 w-3.5 mr-2" /> Markdown</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(session.id, 'txt')}><FileText className="h-3.5 w-3.5 mr-2" /> Plain Text</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(session.id, 'csv')}><FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> CSV</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Move to Folder</DropdownMenuLabel>
                          {chatFolders.map(f => (
                            <DropdownMenuItem key={f.id} onClick={() => moveSessionToFolder(session.id, f.id)}>
                              <FolderOpen className="h-3.5 w-3.5 mr-2" /> {f.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => session.archived ? unarchiveSession(session.id) : archiveSession(session.id)}>
                            {session.archived ? <Eye className="h-3.5 w-3.5 mr-2" /> : <Archive className="h-3.5 w-3.5 mr-2" />}
                            {session.archived ? 'Unarchive' : 'Archive'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(session.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSessions.map((session, i) => {
                const provider = PROVIDERS.find(p => p.id === session.provider);
                return (
                  <motion.div key={session.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                    className={cn("p-4 rounded-lg border hover:border-violet-500/30 transition-all cursor-pointer",
                      session.id === currentSessionId ? "border-violet-500/50 bg-violet-500/5" : "",
                      session.archived ? "opacity-60" : ""
                    )}
                    onClick={() => openSession(session.id)}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium truncate flex items-center gap-1.5">
                        {session.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                        {session.name}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0"><MoreHorizontal className="h-3 w-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setRenameDialog(session.id); setRenameValue(session.name); }}>Rename</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateSession(session.id)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(session.id, 'json')}>Export JSON</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(session.id, 'md')}>Export Markdown</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(session.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                      <Badge variant="outline" className="text-[9px] h-4" style={{ borderColor: provider?.color }}>{provider?.name}</Badge>
                      <span>{session.messages.length} msgs</span>
                      <span>{session.model}</span>
                    </div>
                    {session.messages.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.messages[session.messages.length - 1]?.content.slice(0, 120)}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">{new Date(session.updatedAt).toLocaleString()}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Folder Management */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowNewFolder(!showNewFolder)}>
              <FolderInput className="h-3 w-3" /> New Folder
            </Button>
            {chatFolders.map(f => (
              <Badge key={f.id} variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-accent"
                style={{ borderColor: f.color }} onClick={() => setFolderFilter(f.id === folderFilter ? 'all' : f.id)}>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
                {f.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewSession} onOpenChange={() => setPreviewSession(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{chatSessions.find(s => s.id === previewSession)?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {chatSessions.find(s => s.id === previewSession)?.messages.slice(0, 10).map((m) => (
              <div key={m.id} className={cn("p-3 rounded-lg text-sm", m.role === 'user' ? "bg-primary/10 ml-8" : "bg-muted mr-8")}>
                <Badge variant="outline" className="text-[9px] mb-1">{m.role}</Badge>
                <p className="text-xs whitespace-pre-wrap">{m.content.slice(0, 500)}{m.content.length > 500 ? '...' : ''}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Session</DialogTitle></DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRename()} className="text-sm" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>This action cannot be undone. The session and all its messages will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) deleteSession(deleteConfirm); setDeleteConfirm(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
