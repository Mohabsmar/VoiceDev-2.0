'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote, Plus, Search, MoreHorizontal, Trash2, Edit3, Pin, PinOff,
  Archive, Tag, FolderPlus, Palette, FileText, Code, CheckSquare, Type,
  Bold, Italic, Heading2, ListOrdered, List as ListIcon, Link, Quote,
  Download, Copy, Eye, Save, Clock, Hash, FolderOpen, X, ChevronDown,
  Check, RotateCcw, FileDown, Star, Bookmark, FileJson, Highlighter,
  Underline, Strikethrough, Image, AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Maximize2, Minimize2, Split, LayoutGrid, Columns3,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { Note, NotesFolder, ChecklistItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const NOTE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];
const NOTE_TEMPLATES = [
  { name: 'Blank', icon: FileText, content: '', type: 'note' as const },
  { name: 'Meeting Notes', icon: Users, content: '# Meeting Notes\n\n**Date:** \n**Attendees:** \n\n## Agenda\n- \n\n## Discussion\n\n## Action Items\n- [ ] ', type: 'note' as const },
  { name: 'Daily Journal', icon: BookOpen, content: `# Daily Journal - ${new Date().toLocaleDateString()}\n\n## Grateful for\n- \n\n## Today's Goals\n- [ ] \n\n## Reflections\n\n## Tomorrow\n- `, type: 'note' as const },
  { name: 'Code Snippet', icon: Code, content: '```\n// Your code here\n\n```', type: 'snippet' as const },
  { name: 'Checklist', icon: CheckSquare, content: '', type: 'checklist' as const },
  { name: 'Markdown', icon: FileText, content: '# Title\n\n## Section\n\nSome **bold** text and *italic* text.\n\n- List item 1\n- List item 2\n\n> A quote\n\n```code block```', type: 'markdown' as const },
];

function Users(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

export default function NotesPage() {
  const store = useVoiceDevStore();
  const { notes, notesFolders, createNote, updateNote, deleteNote, createNotesFolder, deleteNotesFolder } = store;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredNotes = useMemo(() => {
    let filtered = [...notes];
    if (!showArchived) filtered = filtered.filter(n => !n.archived);
    if (selectedFolder !== 'all') filtered = filtered.filter(n => n.folderId === selectedFolder);
    if (typeFilter !== 'all') filtered = filtered.filter(n => n.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags?.some(t => t.toLowerCase().includes(q)));
    }
    const sortFn = (a: Note, b: Note) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      switch (sortBy) {
        case 'updated': return b.updatedAt - a.updatedAt;
        case 'created': return b.createdAt - a.createdAt;
        case 'title': return a.title.localeCompare(b.title);
        case 'color': return (a.color || '').localeCompare(b.color || '');
        default: return 0;
      }
    };
    return filtered.sort(sortFn);
  }, [notes, search, sortBy, selectedFolder, showArchived, typeFilter]);

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleNewNote = useCallback((template?: typeof NOTE_TEMPLATES[number]) => {
    const id = createNote({
      title: template?.name || 'Untitled Note',
      content: template?.content || '',
      type: template?.type || 'note',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      folderId: selectedFolder !== 'all' ? selectedFolder : undefined,
      tags: [],
      pinned: false,
      archived: false,
      checklistItems: template?.type === 'checklist' ? [
        { id: 'cl-1', text: '', checked: false },
      ] : undefined,
    });
    setEditingNote(id);
    const note = store.getState().notes.find(n => n.id === id);
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
    }
    setShowTemplates(false);
  }, [createNote, selectedFolder, store]);

  const handleSave = useCallback(() => {
    if (editingNote) {
      updateNote(editingNote, { title: editTitle, content: editContent });
    }
  }, [editingNote, editTitle, editContent, updateNote]);

  const handleExportNote = useCallback((note: Note, format: string) => {
    let content = '';
    if (format === 'md' || format === 'txt') {
      content = `# ${note.title}\n\n${note.content}`;
    } else {
      content = JSON.stringify(note, null, 2);
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.${format}`;
    a.click();
  }, []);

  const handleAddTag = useCallback((noteId: string) => {
    if (tagInput.trim()) {
      const note = store.getState().notes.find(n => n.id === noteId);
      const tags = [...(note?.tags || []), tagInput.trim()];
      updateNote(noteId, { tags });
      setTagInput('');
    }
  }, [tagInput, store, updateNote]);

  const handleRemoveTag = useCallback((noteId: string, tag: string) => {
    const note = store.getState().notes.find(n => n.id === noteId);
    updateNote(noteId, { tags: (note?.tags || []).filter(t => t !== tag) });
  }, [store, updateNote]);

  const toggleChecklistItem = useCallback((noteId: string, itemId: string) => {
    const note = store.getState().notes.find(n => n.id === noteId);
    if (!note?.checklistItems) return;
    updateNote(noteId, {
      checklistItems: note.checklistItems.map(ci => ci.id === itemId ? { ...ci, checked: !ci.checked } : ci),
    });
  }, [store, updateNote]);

  const addChecklistItem = useCallback((noteId: string) => {
    const note = store.getState().notes.find(n => n.id === noteId);
    if (!note) return;
    updateNote(noteId, {
      checklistItems: [...(note.checklistItems || []), { id: `cl-${Date.now()}`, text: '', checked: false }],
    });
  }, [store, updateNote]);

  // Auto-save
  useEffect(() => {
    if (!editingNote) return;
    const timer = setTimeout(handleSave, 2000);
    return () => clearTimeout(timer);
  }, [editContent, editTitle, editingNote, handleSave]);

  // Keyboard shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); handleNewNote(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleNewNote]);

  const activeNote = editingNote ? notes.find(n => n.id === editingNote) : null;

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar / Notes List */}
        <div className={cn("flex flex-col border-r bg-card/50", editingNote ? "hidden md:flex md:w-80" : "flex-1 md:w-80")}>
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-violet-500" /> Notes
                <Badge variant="secondary" className="text-[10px]">{filteredNotes.length}</Badge>
              </h2>
              <div className="flex gap-1">
                <Button size="sm" className="h-7 w-7 p-0" variant="outline" onClick={() => setShowTemplates(true)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="h-8 pl-8 text-xs" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 shrink-0" onClick={() => setShowArchived(!showArchived)}>
                {showArchived ? 'All' : 'Archive'}
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-24 h-6 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-24 h-6 text-[10px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="snippet">Snippet</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-0.5 shrink-0">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setViewMode('grid')}><LayoutGrid className="h-3 w-3" /></Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-6 w-6 p-0" onClick={() => setViewMode('list')}><Columns3 className="h-3 w-3" /></Button>
              </div>
            </div>
            {/* Folders */}
            <div className="flex gap-1 flex-wrap">
              <Badge variant={selectedFolder === 'all' ? 'default' : 'outline'} className="text-[10px] cursor-pointer" onClick={() => setSelectedFolder('all')}>All</Badge>
              {notesFolders.map(f => (
                <Badge key={f.id} variant={selectedFolder === f.id ? 'default' : 'outline'} className="text-[10px] cursor-pointer gap-1"
                  onClick={() => setSelectedFolder(selectedFolder === f.id ? 'all' : f.id)} style={selectedFolder === f.id ? { backgroundColor: f.color } : { borderColor: f.color }}>
                  <FolderOpen className="h-2.5 w-2.5" /> {f.name}
                </Badge>
              ))}
              <Badge variant="outline" className="text-[10px] cursor-pointer gap-1" onClick={() => setShowNewFolder(!showNewFolder)}>
                <FolderPlus className="h-2.5 w-2.5" /> New
              </Badge>
            </div>
            {showNewFolder && (
              <div className="flex gap-1">
                <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name..." className="h-6 text-[10px] flex-1" onKeyDown={(e) => e.key === 'Enter' && newFolderName.trim() && (createNotesFolder(newFolderName.trim(), '#3b82f6'), setNewFolderName(''), setShowNewFolder(false))} />
                <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => { if (newFolderName.trim()) { createNotesFolder(newFolderName.trim(), '#3b82f6'); setNewFolderName(''); setShowNewFolder(false); } }}>Add</Button>
              </div>
            )}
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <StickyNote className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notes yet</p>
                <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => handleNewNote()}>
                  <Plus className="h-3 w-3 mr-1" /> Create Note
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-1.5">
                {filteredNotes.map((note, i) => (
                  <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className={cn("p-3 rounded-lg border cursor-pointer transition-all hover:border-violet-500/30",
                      editingNote === note.id ? "border-violet-500 bg-violet-500/5" : ""
                    )}
                    onClick={() => { setEditingNote(note.id); setEditTitle(note.title); setEditContent(note.content); setPreviewMode(false); }}
                    style={{ borderLeftColor: note.color || undefined, borderLeftWidth: 3 }}>
                    <div className="flex items-start justify-between">
                      <h3 className="text-xs font-medium truncate flex-1">{note.title}</h3>
                      {note.pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0 ml-1" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{note.content.slice(0, 100)}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="outline" className="text-[8px] h-4">{note.type}</Badge>
                      {note.tags?.slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-[8px] h-4">{t}</Badge>)}
                      <span className="text-[9px] text-muted-foreground ml-auto">{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredNotes.map((note, i) => (
                  <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                    className={cn("flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors text-xs",
                      editingNote === note.id ? "bg-violet-500/10" : ""
                    )}
                    onClick={() => { setEditingNote(note.id); setEditTitle(note.title); setEditContent(note.content); setPreviewMode(false); }}>
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: note.color }} />
                    <span className="font-medium truncate flex-1">{note.title}</span>
                    <span className="text-[10px] text-muted-foreground">{wordCount(note.content)}w</span>
                    {note.pinned && <Pin className="h-2.5 w-2.5 text-amber-500 shrink-0" />}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        {editingNote && activeNote && (
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {/* Editor Toolbar */}
            <div className="flex items-center gap-1.5 p-2 border-b flex-wrap">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingNote(null)}>
                <ChevronDown className="h-3 w-3 rotate-90 mr-1" /> Back
              </Button>
              <div className="flex-1" />
              <Badge variant="outline" className="text-[10px]">{wordCount(editContent)} words · {editContent.length} chars</Badge>
              {activeNote.type !== 'checklist' && (
                <Button variant={previewMode ? 'default' : 'ghost'} size="sm" className="h-7 text-[10px] gap-1" onClick={() => setPreviewMode(!previewMode)}>
                  {previewMode ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1"><Palette className="h-3 w-3" /> Color</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex gap-1 p-2">
                  {NOTE_COLORS.map(c => (
                    <button key={c} className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer" style={{ backgroundColor: c, borderColor: activeNote.color === c ? 'white' : 'transparent' }} onClick={() => updateNote(editingNote!, { color: c })} />
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1"><Download className="h-3 w-3" /> Export</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportNote(activeNote, 'md')}>Markdown</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportNote(activeNote, 'txt')}>Plain Text</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportNote(activeNote, 'json')}>JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => updateNote(editingNote!, { pinned: !activeNote.pinned })}>
                {activeNote.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => updateNote(editingNote!, { archived: !activeNote.archived })}>
                <Archive className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive" onClick={() => setDeleteConfirm(editingNote)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Title */}
            <div className="px-4 pt-3">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                className="border-0 text-lg font-bold p-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40"
                placeholder="Note title..." />
            </div>

            {/* Tags */}
            <div className="px-4 pt-1 flex items-center gap-1 flex-wrap">
              {activeNote.tags?.map(t => (
                <Badge key={t} variant="secondary" className="text-[10px] h-5 gap-1 cursor-pointer" onClick={() => handleRemoveTag(editingNote!, t)}>
                  {t} <X className="h-2 w-2" />
                </Badge>
              ))}
              {editingTags === editingNote ? (
                <div className="flex items-center gap-1">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." className="h-5 text-[10px] w-20 p-0 px-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(editingNote!)} />
                  <Button size="sm" className="h-5 w-5 p-0" onClick={() => handleAddTag(editingNote!)}><Check className="h-2.5 w-2.5" /></Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-0.5 px-1" onClick={() => setEditingTags(editingNote)}>
                  <Tag className="h-2.5 w-2.5" /> Add tag
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3">
              {previewMode ? (
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">{editContent}</div>
              ) : activeNote.type === 'checklist' ? (
                <div className="space-y-2">
                  {activeNote.checklistItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <button onClick={() => toggleChecklistItem(editingNote!, item.id)}
                        className={cn("h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                          item.checked ? "bg-violet-500 border-violet-500 text-white" : "border-muted-foreground/40"
                        )}>
                        {item.checked && <Check className="h-3 w-3" />}
                      </button>
                      <Input value={item.text} onChange={(e) => {
                        const items = activeNote.checklistItems!.map(ci => ci.id === item.id ? { ...ci, text: e.target.value } : ci);
                        updateNote(editingNote!, { checklistItems: items });
                      }} className="border-0 text-sm p-0 focus-visible:ring-0 bg-transparent" placeholder="Checklist item..." />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-violet-400" onClick={() => addChecklistItem(editingNote!)}>
                    <Plus className="h-3 w-3" /> Add item
                  </Button>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-[300px] bg-transparent text-sm resize-none focus:outline-none font-mono leading-relaxed placeholder:text-muted-foreground/30"
                  placeholder="Start writing..."
                />
              )}
            </div>

            {/* Status Bar */}
            <div className="px-4 py-2 border-t flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{activeNote.type}</span>
                <span>·</span>
                <span>{wordCount(editContent)} words</span>
                <span>·</span>
                <span>{editContent.length} chars</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Created {new Date(activeNote.createdAt).toLocaleString()}</span>
                <span>·</span>
                <span>Saved {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Templates Dialog */}
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Note</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {NOTE_TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <Button key={t.name} variant="outline" className="h-auto p-3 flex flex-col items-center gap-2 text-xs hover:border-violet-500/50"
                    onClick={() => handleNewNote(t)}>
                    <Icon className="h-6 w-6 text-violet-400" />
                    <span>{t.name}</span>
                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Note</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteNote(deleteConfirm); setEditingNote(null); setDeleteConfirm(null); } }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button (mobile) */}
        {!editingNote && (
          <motion.button onClick={() => setShowTemplates(true)}
            className="md:hidden fixed bottom-20 right-4 h-12 w-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg z-30"
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Plus className="h-6 w-6" />
          </motion.button>
        )}
      </div>
    </TooltipProvider>
  );
}
