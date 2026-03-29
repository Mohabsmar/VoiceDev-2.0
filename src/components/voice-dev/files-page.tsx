'use client';
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Upload, Plus, Search, Trash2, Star, Download, MoreHorizontal, File, FileText, Image, FileCode, FileArchive, Music, Video, Grid3X3, List, SortAsc, SortDesc, Eye, EyeOff, Copy, Rename, ChevronRight, FolderPlus, Filter, Hash, Clock, HardDrive, Scissors, Clipboard } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { VDFile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'cpp', 'c', 'cs'].includes(ext || '')) return FileCode;
  if (['json', 'yaml', 'yml', 'xml', 'toml'].includes(ext || '')) return FileCode;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return Image;
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) return Music;
  if (['mp4', 'avi', 'mkv', 'webm'].includes(ext || '')) return Video;
  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext || '')) return FileArchive;
  if (['md', 'txt', 'doc', 'docx', 'pdf'].includes(ext || '')) return FileText;
  return File;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const DEFAULT_FILES: VDFile[] = [
  { id: 'folder-src', name: 'src', type: 'folder', size: 0, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now(), parentId: null, starred: true, tags: ['project'] },
  { id: 'folder-public', name: 'public', type: 'folder', size: 0, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000, parentId: null, tags: ['project'] },
  { id: 'folder-docs', name: 'docs', type: 'folder', size: 0, createdAt: Date.now() - 86400000 * 3, updatedAt: Date.now() - 86400000 * 2, parentId: null, tags: ['docs'] },
  { id: 'folder-downloads', name: 'downloads', type: 'folder', size: 0, createdAt: Date.now() - 86400000 * 2, updatedAt: Date.now() - 86400000, parentId: null },
  { id: 'file-readme', name: 'README.md', type: 'file', mimeType: 'text/markdown', size: 4520, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000, parentId: 'folder-src', tags: ['docs', 'readme'], starred: true },
  { id: 'file-index', name: 'index.tsx', type: 'file', mimeType: 'text/typescript', size: 2340, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 3600000, parentId: 'folder-src', tags: ['code'] },
  { id: 'file-api', name: 'api.ts', type: 'file', mimeType: 'text/typescript', size: 5600, createdAt: Date.now() - 86400000 * 4, updatedAt: Date.now() - 7200000, parentId: 'folder-src', tags: ['code', 'api'] },
  { id: 'file-store', name: 'store.ts', type: 'file', mimeType: 'text/typescript', size: 8900, createdAt: Date.now() - 86400000 * 4, updatedAt: Date.now() - 86400000 * 2, parentId: 'folder-src', tags: ['code', 'state'] },
  { id: 'file-types', name: 'types.ts', type: 'file', mimeType: 'text/typescript', size: 3400, createdAt: Date.now() - 86400000 * 4, updatedAt: Date.now() - 86400000 * 2, parentId: 'folder-src', tags: ['code', 'types'] },
  { id: 'file-logo', name: 'logo.svg', type: 'file', mimeType: 'image/svg+xml', size: 1200, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000 * 5, parentId: 'folder-public', tags: ['assets', 'images'] },
  { id: 'file-favicon', name: 'favicon.ico', type: 'file', mimeType: 'image/x-icon', size: 4200, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000 * 5, parentId: 'folder-public', tags: ['assets'] },
  { id: 'file-guide', name: 'getting-started.md', type: 'file', mimeType: 'text/markdown', size: 6700, createdAt: Date.now() - 86400000 * 3, updatedAt: Date.now() - 86400000 * 2, parentId: 'folder-docs', tags: ['docs'] },
  { id: 'file-api-docs', name: 'api-reference.md', type: 'file', mimeType: 'text/markdown', size: 12000, createdAt: Date.now() - 86400000 * 3, updatedAt: Date.now() - 86400000 * 2, parentId: 'folder-docs', tags: ['docs', 'api'] },
  { id: 'file-config', name: 'config.json', type: 'file', mimeType: 'application/json', size: 890, createdAt: Date.now() - 86400000 * 4, updatedAt: Date.now() - 86400000 * 3, parentId: null, tags: ['config'] },
  { id: 'file-env', name: '.env.example', type: 'file', mimeType: 'text/plain', size: 340, createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000 * 5, parentId: null, tags: ['config', 'env'] },
];

export default function FilesPage() {
  const store = useVoiceDevStore();
  const { files, uploadFile, deleteFile, renameFile, toggleFileStar, moveFile } = store;
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showStarred, setShowStarred] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [renameDialog, setRenameDialog] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

  // Merge default files with store files
  const allFiles = useMemo(() => {
    const storeIds = new Set(files.map(f => f.id));
    const merged = [...files];
    DEFAULT_FILES.forEach(df => { if (!storeIds.has(df.id)) merged.push(df); });
    return merged;
  }, [files]);

  const filteredFiles = useMemo(() => {
    let items = allFiles.filter(f => f.parentId === currentFolder);
    if (showStarred) items = items.filter(f => f.starred);
    if (typeFilter === 'folders') items = items.filter(f => f.type === 'folder');
    else if (typeFilter === 'files') items = items.filter(f => f.type === 'file');
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(f => f.name.toLowerCase().includes(q) || f.tags?.some(t => t.toLowerCase().includes(q)));
    }
    switch (sortBy) {
      case 'name': return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'size': return items.sort((a, b) => b.size - a.size);
      case 'date': return items.sort((a, b) => b.updatedAt - a.updatedAt);
      case 'type': return items.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
      default: return items;
    }
  }, [allFiles, currentFolder, showStarred, typeFilter, search, sortBy]);

  const totalSize = useMemo(() => allFiles.reduce((sum, f) => sum + f.size, 0), [allFiles]);
  const fileCount = allFiles.filter(f => f.type === 'file').length;
  const folderCount = allFiles.filter(f => f.type === 'folder').length;
  const starredCount = allFiles.filter(f => f.starred).length;

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const fileList = (e.target as HTMLInputElement).files;
      if (!fileList) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        uploadFile({
          name: file.name,
          type: 'file',
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          parentId: currentFolder,
          tags: [],
          starred: false,
        });
      }
    };
    input.click();
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    uploadFile({ name: newFolderName.trim(), type: 'folder', size: 0, parentId: currentFolder, tags: [], starred: false });
    setNewFolderDialog(false);
    setNewFolderName('');
  };

  const handleRename = () => {
    if (renameDialog && renameValue.trim()) {
      renameFile(renameDialog, renameValue.trim());
      setRenameDialog(null);
    }
  };

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
    if (folderId) {
      const buildPath = (id: string, path: string[]): string[] => {
        const folder = allFiles.find(f => f.id === id);
        if (!folder || !folder.parentId) return [...path, folder.name];
        return buildPath(folder.parentId, [...path, folder.name]);
      };
      setBreadcrumbs(buildPath(folderId, []).reverse());
    } else {
      setBreadcrumbs([]);
    }
  };

  const handleDuplicate = (file: VDFile) => {
    uploadFile({ ...file, name: `${file.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() });
  };

  const previewItem = previewFile ? allFiles.find(f => f.id === previewFile) : null;

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-violet-500" /> Files
                </motion.h1>
                <p className="text-sm text-muted-foreground">{folderCount} folders · {fileCount} files · {formatSize(totalSize)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowStarred(!showStarred)}>
                  <Star className={cn("h-3 w-3", showStarred && "fill-amber-400 text-amber-400")} /> {showStarred ? 'All' : 'Starred'} ({starredCount})
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setNewFolderDialog(true)}>
                  <FolderPlus className="h-3 w-3" /> New Folder
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleUpload}>
                  <Upload className="h-3 w-3" /> Upload
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Files', value: fileCount, icon: File },
                { label: 'Folders', value: folderCount, icon: FolderOpen },
                { label: 'Starred', value: starredCount, icon: Star },
                { label: 'Total Size', value: formatSize(totalSize), icon: HardDrive },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card><CardContent className="p-3 text-center">
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-violet-400" />
                    <p className="text-lg font-bold tabular-nums">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </CardContent></Card>
                </motion.div>
              ))}
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <button className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => handleNavigate(null)}>Root</button>
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <button className="text-muted-foreground hover:text-foreground cursor-pointer">{crumb}</button>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="h-8 pl-8 text-xs" />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="folders">Folders</SelectItem>
                  <SelectItem value="files">Files</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-0.5">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}><Grid3X3 className="h-3 w-3" /></Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('list')}><List className="h-3 w-3" /></Button>
              </div>
            </div>

            {/* File List */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No files found</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload files or create a new folder</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredFiles.map((file, i) => {
                  const Icon = file.type === 'folder' ? FolderOpen : getFileIcon(file.name);
                  return (
                    <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                      className={cn("p-3 rounded-lg border hover:border-violet-500/30 transition-all cursor-pointer group",
                        file.starred && "border-amber-500/30 bg-amber-500/5"
                      )}
                      onClick={() => file.type === 'folder' ? handleNavigate(file.id) : setPreviewFile(file.id)}
                      onDoubleClick={() => file.type === 'folder' ? handleNavigate(file.id) : store.setCurrentTab('editor')}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Icon className={cn("h-5 w-5", file.type === 'folder' ? "text-amber-400" : "text-violet-400")} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-3 w-3" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleFileStar(file.id); }}>{file.starred ? 'Remove from Starred' : 'Add to Starred'}</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameDialog(file.id); setRenameValue(file.name); }}>Rename</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(file); }}>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if (file.type === 'folder') handleNavigate(file.id); else setPreviewFile(file.id); }}>Preview</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(file.id); }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        {file.type === 'file' && <span>{formatSize(file.size)}</span>}
                        <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {file.tags?.length > 0 && (
                        <div className="flex gap-0.5 mt-1 overflow-hidden">{file.tags.slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-[8px] h-4">{t}</Badge>)}</div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredFiles.map((file, i) => {
                  const Icon = file.type === 'folder' ? FolderOpen : getFileIcon(file.name);
                  return (
                    <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => file.type === 'folder' ? handleNavigate(file.id) : setPreviewFile(file.id)}>
                      <Icon className={cn("h-4 w-4 shrink-0", file.type === 'folder' ? "text-amber-400" : "text-violet-400")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                      </div>
                      {file.starred && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
                      {file.type === 'file' && <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{formatSize(file.size)}</span>}
                      <span className="text-[10px] text-muted-foreground shrink-0 w-24 text-right">{new Date(file.updatedAt).toLocaleDateString()}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-3 w-3" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleFileStar(file.id); }}>{file.starred ? 'Unstar' : 'Star'}</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameDialog(file.id); setRenameValue(file.name); }}>Rename</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(file.id); }}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader><DialogTitle>{previewItem?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>Type: {previewItem?.mimeType || 'unknown'}</span>
              <span>Size: {previewItem ? formatSize(previewItem.size) : '0 B'}</span>
              <span>Modified: {previewItem ? new Date(previewItem.updatedAt).toLocaleString() : ''}</span>
            </div>
            {previewItem?.tags && previewItem.tags.length > 0 && (
              <div className="flex gap-1">{previewItem.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
            )}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-mono">File preview would be rendered here. Click "Open in Editor" to view and edit the full content.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewFile(null)}>Close</Button>
            <Button onClick={() => { setPreviewFile(null); store.setCurrentTab('editor'); }}>Open in Editor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Rename</DialogTitle></DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRename()} />
          <DialogFooter><Button variant="outline" onClick={() => setRenameDialog(null)}>Cancel</Button><Button onClick={handleRename}>Rename</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent><DialogHeader><DialogTitle>Delete File</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button><Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteFile(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent><DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader>
          <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name..." onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
          <DialogFooter><Button variant="outline" onClick={() => setNewFolderDialog(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}


