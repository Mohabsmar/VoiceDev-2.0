'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Workflow as WorkflowIcon, Plus, Play, Pause, Trash2, Edit3, Copy,
  MoreHorizontal, Search, Filter, Settings, Clock, ArrowRight, Zap,
  Save, X, Check, RotateCcw, BarChart3, GitBranch, Cpu, Code,
  Globe, Database, Timer, Repeat, ArrowDown, ArrowUp, Layers, Box,
  FormInput, AlertTriangle, RefreshCw, Download, Upload, Eye,
  type LucideIcon,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import type { Workflow, WorkflowNode, WorkflowEdge } from '@/lib/types';
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

const NODE_TYPES: { type: WorkflowNode['type']; label: string; icon: LucideIcon; color: string; description: string }[] = [
  { type: 'input', label: 'Input', icon: FormInput, color: '#3b82f6', description: 'Start point for data' },
  { type: 'llm', label: 'LLM Call', icon: Cpu, color: '#8b5cf6', description: 'Call an AI model' },
  { type: 'http', label: 'HTTP Request', icon: Globe, color: '#06b6d4', description: 'Make API calls' },
  { type: 'code', label: 'Code Block', icon: Code, color: '#10b981', description: 'Run custom code' },
  { type: 'condition', label: 'Condition', icon: AlertTriangle, color: '#f59e0b', description: 'Branching logic' },
  { type: 'transform', label: 'Transform', icon: Layers, color: '#ec4899', description: 'Transform data' },
  { type: 'database', label: 'Database', icon: Database, color: '#6366f1', description: 'Query database' },
  { type: 'delay', label: 'Delay', icon: Timer, color: '#14b8a6', description: 'Wait or schedule' },
  { type: 'loop', label: 'Loop', icon: Repeat, color: '#f97316', description: 'Iterate over items' },
  { type: 'output', label: 'Output', icon: Eye, color: '#ef4444', description: 'End point for results' },
];

export default function WorkflowsPage() {
  const store = useVoiceDevStore();
  const { workflows, createWorkflow, updateWorkflow, deleteWorkflow, runWorkflow } = store;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialog, setCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowView, setWorkflowView] = useState<'visual' | 'json'>('visual');
  const [showNodePalette, setShowNodePalette] = useState(false);

  const filteredWorkflows = useMemo(() => {
    let filtered = [...workflows];
    if (statusFilter !== 'all') filtered = filtered.filter(w => w.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.tags?.some(t => t.toLowerCase().includes(q)));
    }
    return filtered;
  }, [workflows, search, statusFilter]);

  const handleCreate = () => {
    if (newName.trim()) {
      const id = createWorkflow(newName.trim(), newDesc.trim());
      setEditingWorkflow(id);
      setCreateDialog(false);
      setNewName('');
      setNewDesc('');
    }
  };

  const handleAddNode = (type: WorkflowNode['type']) => {
    if (!editingWorkflow) return;
    const wf = store.getState().workflows.find(w => w.id === editingWorkflow);
    if (!wf) return;
    const nodeType = NODE_TYPES.find(n => n.type === type)!;
    const node: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      label: nodeType.label,
      config: {},
      position: { x: 100 + wf.nodes.length * 200, y: 200 + Math.random() * 100 },
    };
    updateWorkflow(editingWorkflow, { nodes: [...wf.nodes, node] });
    setShowNodePalette(false);
  };

  const handleRemoveNode = (nodeId: string) => {
    if (!editingWorkflow) return;
    const wf = store.getState().workflows.find(w => w.id === editingWorkflow);
    if (!wf) return;
    updateWorkflow(editingWorkflow, {
      nodes: wf.nodes.filter(n => n.id !== nodeId),
      edges: wf.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    });
  };

  const handleDuplicateWorkflow = (id: string) => {
    const wf = store.getState().workflows.find(w => w.id === id);
    if (!wf) return;
    const newId = createWorkflow(`${wf.name} (copy)`, wf.description);
    updateWorkflow(newId, { nodes: wf.nodes.map(n => ({ ...n, id: `node-${Date.now()}-${Math.random().toString(36).slice(2)}` })), edges: [...wf.edges], tags: wf.tags });
  };

  const handleExportWorkflow = (wf: Workflow) => {
    const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${wf.name}.json`; a.click();
  };

  const activeWorkflow = editingWorkflow ? workflows.find(w => w.id === editingWorkflow) : null;
  const activeNode = selectedNode ? activeWorkflow?.nodes.find(n => n.id === selectedNode) : null;

  const statusColors: Record<string, string> = { draft: 'bg-gray-500', active: 'bg-green-500', paused: 'bg-amber-500', archived: 'bg-red-500' };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col md:flex-row overflow-hidden">
        {/* Workflow List */}
        <div className={cn("flex flex-col border-r bg-card/50", editingWorkflow ? "hidden md:flex md:w-72" : "flex-1 md:w-72")}>
          <div className="p-3 border-b space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <WorkflowIcon className="h-5 w-5 text-violet-500" /> Workflows
                <Badge variant="secondary" className="text-[10px]">{workflows.length}</Badge>
              </h2>
              <Button size="sm" className="h-7 w-7 p-0" variant="outline" onClick={() => setCreateDialog(true)}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workflows..." className="h-8 pl-8 text-xs" />
            </div>
            <div className="flex gap-1.5">
              {['all', 'draft', 'active', 'paused', 'archived'].map(s => (
                <Badge key={s} variant={statusFilter === s ? 'default' : 'outline'} className="text-[10px] cursor-pointer capitalize" onClick={() => setStatusFilter(s)}>{s}</Badge>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
            {filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <WorkflowIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No workflows yet</p>
                <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setCreateDialog(true)}>
                  <Plus className="h-3 w-3 mr-1" /> Create Workflow
                </Button>
              </div>
            ) : (
              filteredWorkflows.map((wf, i) => (
                <motion.div key={wf.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={cn("p-3 rounded-lg border cursor-pointer transition-all hover:border-violet-500/30",
                    editingWorkflow === wf.id ? "border-violet-500 bg-violet-500/5" : ""
                  )} onClick={() => { setEditingWorkflow(wf.id); setSelectedNode(null); }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-2 w-2 rounded-full", statusColors[wf.status])} />
                        <h3 className="text-xs font-medium truncate">{wf.name}</h3>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{wf.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Box className="h-2.5 w-2.5" /> {wf.nodes.length} nodes</span>
                        <span className="flex items-center gap-0.5"><Play className="h-2.5 w-2.5" /> {wf.runCount} runs</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0"><MoreHorizontal className="h-3 w-3" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); runWorkflow(wf.id); }}><Play className="h-3 w-3 mr-2" /> Run</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateWorkflow(wf.id); }}><Copy className="h-3 w-3 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExportWorkflow(wf); }}><Download className="h-3 w-3 mr-2" /> Export</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(wf.id); }}><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {wf.tags && wf.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">{wf.tags.map(t => <Badge key={t} variant="secondary" className="text-[8px] h-4">{t}</Badge>)}</div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Workflow Editor */}
        {editingWorkflow && activeWorkflow ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 p-2 border-b">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingWorkflow(null)}>
                <ArrowUp className="h-3 w-3 rotate-[-90deg] mr-1" /> Back
              </Button>
              <h3 className="text-sm font-medium flex-1">{activeWorkflow.name}</h3>
              <Badge variant="outline" className="text-[10px] gap-1" style={{ borderColor: statusColors[activeWorkflow.status] }}>
                <div className={cn("h-1.5 w-1.5 rounded-full", statusColors[activeWorkflow.status])} />
                {activeWorkflow.status}
              </Badge>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowNodePalette(true)}>
                <Plus className="h-3 w-3" /> Add Node
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1" variant="default" onClick={() => runWorkflow(editingWorkflow)}>
                <Play className="h-3 w-3" /> Run
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1" variant="outline" onClick={() => handleExportWorkflow(activeWorkflow)}>
                <Download className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Canvas */}
              <div className="flex-1 overflow-auto custom-scrollbar relative bg-muted/20 p-8">
                {activeWorkflow.nodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <WorkflowIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Empty Workflow</h3>
                    <p className="text-sm text-muted-foreground mt-1">Add nodes to build your automation</p>
                    <Button className="mt-4" onClick={() => setShowNodePalette(true)}><Plus className="h-4 w-4 mr-2" /> Add First Node</Button>
                  </div>
                ) : (
                  <div className="relative min-h-full">
                    {/* Nodes */}
                    {activeWorkflow.nodes.map((node, i) => {
                      const nodeType = NODE_TYPES.find(n => n.type === node.type);
                      const Icon = nodeType?.icon || Box;
                      return (
                        <motion.div key={node.id}
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                          className={cn("absolute p-3 rounded-xl border shadow-md cursor-move min-w-[140px] transition-colors",
                            selectedNode === node.id ? "border-violet-500 ring-2 ring-violet-500/20" : "hover:border-violet-500/50"
                          )}
                          style={{ left: node.position.x, top: node.position.y }}
                          onClick={() => setSelectedNode(node.id)}>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: nodeType?.color + '20' }}>
                              <Icon className="h-4 w-4" style={{ color: nodeType?.color }} />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{node.label}</p>
                              <p className="text-[10px] text-muted-foreground">{nodeType?.description}</p>
                            </div>
                          </div>
                          {/* Connection Points */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-violet-500 border-2 border-background" />
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-background" />
                          {/* Delete */}
                          <button className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); handleRemoveNode(node.id); }}>
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      );
                    })}

                    {/* Visual Edges */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                      {activeWorkflow.edges.map((edge) => {
                        const source = activeWorkflow.nodes.find(n => n.id === edge.source);
                        const target = activeWorkflow.nodes.find(n => n.id === edge.target);
                        if (!source || !target) return null;
                        const sx = source.position.x + 70, sy = source.position.y + 60;
                        const tx = target.position.x + 70, ty = target.position.y;
                        const midY = (sy + ty) / 2;
                        return (
                          <g key={edge.id}>
                            <path d={`M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray={edge.condition ? "5,5" : "none"} opacity="0.6" />
                            <circle cx={tx} cy={ty} r="4" fill="#8b5cf6" />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>

              {/* Node Properties Panel */}
              {activeNode && (
                <div className="w-64 border-l p-3 space-y-3 overflow-y-auto custom-scrollbar bg-card/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold">Node Properties</h4>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedNode(null)}><X className="h-3 w-3" /></Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Label</label>
                      <Input value={activeNode.label} onChange={(e) => updateWorkflow(editingWorkflow!, { nodes: activeWorkflow.nodes.map(n => n.id === activeNode.id ? { ...n, label: e.target.value } : n) })} className="h-7 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Type</label>
                      <Badge variant="outline" className="text-[10px]">{activeNode.type}</Badge>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Position</label>
                      <p className="text-xs font-mono text-muted-foreground">x: {activeNode.position.x}, y: {activeNode.position.y}</p>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium">Configuration</label>
                      {activeNode.type === 'llm' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Provider</label><Input className="h-7 text-xs" placeholder="openai" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Model</label><Input className="h-7 text-xs" placeholder="gpt-4o" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Prompt Template</label><textarea className="w-full h-20 text-xs bg-muted rounded-md p-2 border-0 resize-none" placeholder="Enter prompt..." /></div>
                          <div><label className="text-[10px] text-muted-foreground">Temperature</label><Input type="number" step="0.1" min="0" max="2" defaultValue="0.7" className="h-7 text-xs" /></div>
                        </div>
                      )}
                      {activeNode.type === 'http' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Method</label>
                            <Select defaultValue="GET"><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem><SelectItem value="DELETE">DELETE</SelectItem></SelectContent></Select>
                          </div>
                          <div><label className="text-[10px] text-muted-foreground">URL</label><Input className="h-7 text-xs" placeholder="https://api.example.com" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Headers (JSON)</label><textarea className="w-full h-16 text-xs bg-muted rounded-md p-2 border-0 resize-none font-mono" placeholder='{"Authorization": "Bearer ..."}' /></div>
                        </div>
                      )}
                      {activeNode.type === 'code' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Language</label>
                            <Select defaultValue="javascript"><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="javascript">JavaScript</SelectItem><SelectItem value="python">Python</SelectItem><SelectItem value="typescript">TypeScript</SelectItem></SelectContent></Select>
                          </div>
                          <div><label className="text-[10px] text-muted-foreground">Code</label><textarea className="w-full h-32 text-xs bg-muted rounded-md p-2 border-0 resize-none font-mono" placeholder="// Your code here" /></div>
                        </div>
                      )}
                      {activeNode.type === 'condition' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Condition Expression</label><textarea className="w-full h-16 text-xs bg-muted rounded-md p-2 border-0 resize-none font-mono" placeholder="result.success === true" /></div>
                          <p className="text-[10px] text-muted-foreground">True → Continue | False → Skip</p>
                        </div>
                      )}
                      {activeNode.type === 'delay' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Delay (ms)</label><Input type="number" defaultValue="1000" className="h-7 text-xs" /></div>
                        </div>
                      )}
                      {activeNode.type === 'transform' && (
                        <div><label className="text-[10px] text-muted-foreground">Transform Script</label><textarea className="w-full h-24 text-xs bg-muted rounded-md p-2 border-0 resize-none font-mono" placeholder="// Transform data here\nreturn data.map(...)" /></div>
                      )}
                      {activeNode.type === 'loop' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Source Variable</label><Input className="h-7 text-xs" placeholder="items" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Iterator Name</label><Input className="h-7 text-xs" placeholder="item" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Max Iterations</label><Input type="number" defaultValue="100" className="h-7 text-xs" /></div>
                        </div>
                      )}
                      {activeNode.type === 'input' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Input Name</label><Input className="h-7 text-xs" placeholder="query" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Default Value</label><Input className="h-7 text-xs" placeholder="Hello" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Required</label><Badge variant="outline" className="text-[10px]">Yes</Badge></div>
                        </div>
                      )}
                      {activeNode.type === 'output' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Output Variable</label><Input className="h-7 text-xs" placeholder="result" /></div>
                          <div><label className="text-[10px] text-muted-foreground">Format</label>
                            <Select defaultValue="json"><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="json">JSON</SelectItem><SelectItem value="text">Text</SelectItem><SelectItem value="file">File</SelectItem></SelectContent></Select>
                          </div>
                        </div>
                      )}
                      {activeNode.type === 'database' && (
                        <div className="space-y-1.5">
                          <div><label className="text-[10px] text-muted-foreground">Connection</label><Input className="h-7 text-xs" placeholder="postgresql://..." /></div>
                          <div><label className="text-[10px] text-muted-foreground">Query</label><textarea className="w-full h-16 text-xs bg-muted rounded-md p-2 border-0 resize-none font-mono" placeholder="SELECT * FROM ..." /></div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <Button variant="destructive" size="sm" className="w-full h-7 text-xs gap-1" onClick={() => handleRemoveNode(activeNode.id)}>
                      <Trash2 className="h-3 w-3" /> Remove Node
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <WorkflowIcon className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Select or Create a Workflow</h3>
              <p className="text-sm text-muted-foreground mt-1">Build powerful automations with a visual editor</p>
            </div>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Workflow</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Name</label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My Workflow" className="text-sm" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} /></div>
              <div><label className="text-xs text-muted-foreground">Description</label><Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this workflow do?" className="text-sm" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Node Palette */}
        <Dialog open={showNodePalette} onOpenChange={setShowNodePalette}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Node</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {NODE_TYPES.map((nt) => {
                const Icon = nt.icon;
                return (
                  <Button key={nt.type} variant="outline" className="h-auto p-3 flex flex-col items-center gap-2 text-xs hover:border-violet-500/50" onClick={() => handleAddNode(nt.type)}>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: nt.color + '20' }}>
                      <Icon className="h-4 w-4" style={{ color: nt.color }} />
                    </div>
                    <span className="font-medium">{nt.label}</span>
                    <span className="text-[10px] text-muted-foreground">{nt.description}</span>
                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Workflow</DialogTitle><DialogDescription>This will permanently delete this workflow.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteWorkflow(deleteConfirm); if (editingWorkflow === deleteConfirm) setEditingWorkflow(null); setDeleteConfirm(null); } }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}


