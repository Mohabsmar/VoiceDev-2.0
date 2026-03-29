'use client';
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Plus, X, Save, FileText, Download, Copy, Trash2, Play, Settings, ChevronDown, Search, Eye, Edit3, Maximize2, Split, Undo2, Redo2, FileCode, FileJson, FileType, Terminal, WrapText, AlignLeft, SearchCode, Replace, Globe, Lock, Bookmark, Hash } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js' }, { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'python', name: 'Python', ext: '.py' }, { id: 'html', name: 'HTML', ext: '.html' },
  { id: 'css', name: 'CSS', ext: '.css' }, { id: 'json', name: 'JSON', ext: '.json' },
  { id: 'markdown', name: 'Markdown', ext: '.md' }, { id: 'sql', name: 'SQL', ext: '.sql' },
  { id: 'bash', name: 'Shell', ext: '.sh' }, { id: 'rust', name: 'Rust', ext: '.rs' },
  { id: 'go', name: 'Go', ext: '.go' }, { id: 'java', name: 'Java', ext: '.java' },
  { id: 'cpp', name: 'C++', ext: '.cpp' }, { id: 'csharp', name: 'C#', ext: '.cs' },
  { id: 'ruby', name: 'Ruby', ext: '.rb' }, { id: 'php', name: 'PHP', ext: '.php' },
  { id: 'swift', name: 'Swift', ext: '.swift' }, { id: 'kotlin', name: 'Kotlin', ext: '.kt' },
  { id: 'yaml', name: 'YAML', ext: '.yaml' }, { id: 'xml', name: 'XML', ext: '.xml' },
  { id: 'plaintext', name: 'Plain Text', ext: '.txt' },
];

const SNIPPETS = [
  { name: 'Hello World (JS)', lang: 'javascript', code: 'console.log("Hello, World!");' },
  { name: 'Hello World (Python)', lang: 'python', code: 'print("Hello, World!")' },
  { name: 'React Component', lang: 'typescript', code: "import React from 'react';\n\ninterface Props {\n  title: string;\n}\n\nexport default function Component({ title }: Props) {\n  return <h1>{title}</h1>;\n}" },
  { name: 'Express Server', lang: 'javascript', code: "const express = require('express');\nconst app = express();\nconst PORT = 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello!' });\n});\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});" },
  { name: 'Fetch API', lang: 'typescript', code: "async function fetchData<T>(url: string): Promise<T> {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  return response.json();\n}" },
  { name: 'Python Class', lang: 'python', code: "class DataProcessor:\n    def __init__(self, data):\n        self.data = data\n        self.processed = []\n\n    def process(self):\n        for item in self.data:\n            result = self._transform(item)\n            self.processed.append(result)\n        return self.processed\n\n    def _transform(self, item):\n        return {**item, 'processed': True}" },
];

export default function EditorPage() {
  const store = useVoiceDevStore();
  const { editorFiles, editorTabs, createEditorFile, updateEditorFile, deleteEditorFile, openEditorTab, closeEditorTab } = store;
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('javascript');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [wordWrap, setWordWrap] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [findReplace, setFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [fontSize, setFontSize] = useState(13);
  const [showMinimap, setShowMinimap] = useState(false);

  const activeTab = editorTabs.find(t => t.id === activeTabId);
  const activeFile = activeTab ? editorFiles.find(f => f.id === activeTab.fileId) : null;

  const lineCount = useMemo(() => activeFile ? activeFile.content.split('\n').length : 0, [activeFile]);
  const charCount = activeFile?.content.length || 0;
  const wordCount = activeFile ? activeFile.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const cursorLine = 1;
  const cursorCol = 1;

  const handleCreate = () => {
    if (!newFileName.trim()) return;
    const lang = newFileLang;
    createEditorFile(newFileName.trim(), lang, LANGUAGES.find(l => l.id === lang)?.id === 'markdown' ? '# ' + newFileName.trim() : '');
    setCreateDialog(false);
    setNewFileName('');
  };

  const handleNewFromSnippet = (snippet: typeof SNIPPETS[0]) => {
    const name = snippet.name + LANGUAGES.find(l => l.id === snippet.lang)?.ext;
    createEditorFile(name, snippet.lang, snippet.code);
    setShowSnippets(false);
    const lastTab = store.getState().editorTabs[store.getState().editorTabs.length - 1];
    if (lastTab) setActiveTabId(lastTab.id);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleContentChange = (content: string) => {
    if (!activeTab) return;
    updateEditorFile(activeTab.fileId, content);
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background">
        {/* Editor Toolbar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-card/50">
          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setCreateDialog(true)}><Plus className="h-3 w-3" /> New</Button>
          <Button size="sm" className="h-7 text-xs gap-1" variant="outline" onClick={() => setShowSnippets(true)}><FileCode className="h-3 w-3" /> Snippets</Button>
          <div className="flex-1" />
          <Tooltip><TooltipTrigger asChild>
            <Button variant={findReplace ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setFindReplace(!findReplace)}><SearchCode className="h-3 w-3" /></Button>
          </TooltipTrigger><TooltipContent>Find & Replace</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button variant={wordWrap ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setWordWrap(!wordWrap)}><WrapText className="h-3 w-3" /></Button>
          </TooltipTrigger><TooltipContent>Word Wrap</TooltipContent></Tooltip>
          <Select value={String(fontSize)} onValueChange={(v) => setFontSize(parseInt(v))}>
            <SelectTrigger className="w-16 h-7 text-[10px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10px</SelectItem><SelectItem value="12">12px</SelectItem><SelectItem value="13">13px</SelectItem><SelectItem value="14">14px</SelectItem><SelectItem value="16">16px</SelectItem><SelectItem value="18">18px</SelectItem><SelectItem value="20">20px</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-[10px]">{editorFiles.length} files</Badge>
        </div>

        {/* Find & Replace Bar */}
        <AnimatePresence>
          {findReplace && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
              <Search className="h-3 w-3 text-muted-foreground" />
              <Input value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Find..." className="h-6 text-xs flex-1" />
              <Replace className="h-3 w-3 text-muted-foreground" />
              <Input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Replace..." className="h-6 text-xs flex-1" />
              <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => {
                if (activeFile && findText) {
                  updateEditorFile(activeTab!.fileId, activeFile.content.replaceAll(findText, replaceText));
                }
              }}>Replace All</Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setFindReplace(false)}><X className="h-3 w-3" /></Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        {editorTabs.length > 0 && (
          <div className="flex items-center overflow-x-auto custom-scrollbar border-b bg-card/30 px-1">
            {editorTabs.map(tab => (
              <div key={tab.id} onClick={() => handleTabClick(tab.id)}
                className={cn("flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r transition-colors shrink-0 group",
                  activeTabId === tab.id ? "bg-background border-b-2 border-b-violet-500 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}>
                <FileCode className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[100px]">{tab.name}</span>
                {tab.modified && <div className="h-2 w-2 rounded-full bg-amber-400" />}
                <button className="h-4 w-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-accent cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); closeEditorTab(tab.id); if (activeTabId === tab.id) setActiveTabId(editorTabs[0]?.id || null); }}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeFile ? (
            <>
              {/* Line Numbers */}
              <div className="w-12 bg-muted/20 border-r overflow-hidden py-3 shrink-0">
                <div className="space-y-0 px-2 text-right">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="text-[10px] leading-[20px] text-muted-foreground/50 font-mono select-none">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* Code Area */}
              <textarea
                value={activeFile.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 bg-background p-3 font-mono text-sm resize-none focus:outline-none leading-[20px] selection:bg-violet-500/30"
                style={{ fontSize, tabSize: 2, whiteSpace: wordWrap ? 'pre-wrap' : 'pre', overflowWrap: wordWrap ? 'break-word' : 'normal' }}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
              {/* Minimap (simple) */}
              {showMinimap && (
                <div className="w-24 bg-muted/10 border-l overflow-hidden py-3 px-1 shrink-0 hidden lg:block">
                  <div className="text-[2px] leading-[3px] font-mono text-muted-foreground/30 whitespace-pre-wrap break-words select-none pointer-events-none" style={{ transform: 'scaleX(0.3) scaleY(0.15)', transformOrigin: 'top left' }}>
                    {activeFile.content}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Code className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground">No file open</h3>
                <p className="text-sm text-muted-foreground mt-1">Create a new file or open a snippet</p>
                <div className="flex gap-2 mt-4 justify-center">
                  <Button onClick={() => setCreateDialog(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New File</Button>
                  <Button variant="outline" onClick={() => setShowSnippets(true)} className="gap-1.5"><FileCode className="h-3.5 w-3.5" /> Snippets</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        {activeFile && (
          <div className="flex items-center justify-between px-3 py-1.5 border-t bg-card/50 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><FileCode className="h-2.5 w-2.5" /> {activeFile.language}</span>
              <span>Ln {cursorLine}, Col {cursorCol}</span>
              <span>{lineCount} lines</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
              <span>UTF-8</span>
              <span className={activeFile.saved ? "text-green-400" : "text-amber-400"}>{activeFile.saved ? 'Saved' : 'Modified'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New File</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">File Name</label><Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="script.js" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} /></div>
            <div><label className="text-xs text-muted-foreground">Language</label>
              <Select value={newFileLang} onValueChange={setNewFileLang}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name} ({l.ext})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newFileName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snippets Dialog */}
      <Dialog open={showSnippets} onOpenChange={setShowSnippets}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Code Snippets</DialogTitle></DialogHeader>
          <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
            {SNIPPETS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="p-3 rounded-lg border hover:border-violet-500/30 cursor-pointer transition-colors" onClick={() => handleNewFromSnippet(s)}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{s.name}</h4>
                  <Badge variant="outline" className="text-[9px]">{s.lang}</Badge>
                </div>
                <pre className="text-[10px] text-muted-foreground mt-1 line-clamp-2 font-mono">{s.code}</pre>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete File</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Permanently delete this file?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteEditorFile(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}


