'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, Plus, Trophy, ArrowLeft, ArrowRight, Vote, SkipForward, RefreshCw, Crown, Medal, Flame, Star, Zap, BarChart3, Filter, Search, ChevronDown, Play, Eye, X, CrownIcon, MessageSquare, Code, Clock, Sparkles } from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS, getAllModels } from '@/lib/providers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const ARENA_CATEGORIES = [
  { id: 'general', name: 'General', icon: MessageSquare },
  { id: 'coding', name: 'Coding', icon: Code },
  { id: 'creative', name: 'Creative', icon: Sparkles },
  { id: 'reasoning', name: 'Reasoning', icon: Flame },
  { id: 'vision', name: 'Vision', icon: Eye },
  { id: 'image', name: 'Image Gen', icon: Play },
];

const BATTLE_PROMPTS = [
  'Explain quantum computing to a 10-year-old.',
  'Write a haiku about artificial intelligence.',
  'What are the pros and cons of remote work?',
  'Debug this function: function sum(arr) { let total; for(i=0; i<arr.length; i++) { total += arr[i]; } return total; }',
  'Write a creative story beginning with "The last human on Earth sat alone in a room..."',
  'Solve: If a train travels at 120 km/h and another at 80 km/h in the opposite direction, when will they be 500 km apart if they started 100 km apart?',
];

export default function ArenaPage() {
  const store = useVoiceDevStore();
  const { arenaBattles, createArenaBattle, voteArenaBattle, favoriteModels } = store;
  const [category, setCategory] = useState('general');
  const [selectedModelA, setSelectedModelA] = useState('');
  const [selectedModelB, setSelectedModelB] = useState('');
  const [prompt, setPrompt] = useState('');
  const [battleMode, setBattleMode] = useState<'quick' | 'custom'>('quick');
  const [showResults, setShowResults] = useState(false);
  const [currentBattleId, setCurrentBattleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'battle' | 'history' | 'leaderboard'>('battle');

  const llmModels = useMemo(() => getAllModels().filter(m => m.category === 'LLM' || m.category === 'Reasoning'), []);

  const handleQuickBattle = () => {
    const randomPrompt = BATTLE_PROMPTS[Math.floor(Math.random() * BATTLE_PROMPTS.length)];
    const shuffled = [...llmModels].sort(() => Math.random() - 0.5);
    const modelA = shuffled[0];
    const modelB = shuffled[1];
    if (!modelA || !modelB) return;
    const id = createArenaBattle(modelA.id, modelB.id, randomPrompt, category);
    setCurrentBattleId(id);
    setPrompt(randomPrompt);
    setSelectedModelA(modelA.id);
    setSelectedModelB(modelB.id);
    setShowResults(true);
  };

  const handleCustomBattle = () => {
    if (!selectedModelA || !selectedModelB || !prompt.trim()) return;
    if (selectedModelA === selectedModelB) return;
    const id = createArenaBattle(selectedModelA, selectedModelB, prompt.trim(), category);
    setCurrentBattleId(id);
    setShowResults(true);
  };

  const handleVote = (vote: 'A' | 'B' | 'tie') => {
    if (!currentBattleId) return;
    voteArenaBattle(currentBattleId, vote);
  };

  const handleNewBattle = () => {
    setShowResults(false);
    setCurrentBattleId(null);
    setPrompt('');
  };

  const currentBattle = currentBattleId ? arenaBattles.find(b => b.id === currentBattleId) : null;

  // Leaderboard
  const leaderboard = useMemo(() => {
    const wins: Record<string, number> = {};
    const total: Record<string, number> = {};
    arenaBattles.forEach(b => {
      if (!b.winner) return;
      if (b.winner === 'A') { wins[b.modelA] = (wins[b.modelA] || 0) + 1; total[b.modelA] = (total[b.modelA] || 0) + 1; total[b.modelB] = (total[b.modelB] || 0) + 1; }
      else if (b.winner === 'B') { wins[b.modelB] = (wins[b.modelB] || 0) + 1; total[b.modelA] = (total[b.modelA] || 0) + 1; total[b.modelB] = (total[b.modelB] || 0) + 1; }
      else { total[b.modelA] = (total[b.modelA] || 0) + 1; total[b.modelB] = (total[b.modelB] || 0) + 1; }
    });
    return Object.entries(wins)
      .map(([modelId, wins]) => ({ modelId, wins, total: total[modelId] || 0, rate: ((wins / (total[modelId] || 1)) * 100).toFixed(1) }))
      .sort((a, b) => b.wins - a.wins);
  }, [arenaBattles]);

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <Swords className="h-6 w-6 text-violet-500" /> Model Arena
                <Badge variant="secondary" className="text-xs">{arenaBattles.length} battles</Badge>
              </motion.h1>
              <p className="text-sm text-muted-foreground">Compare AI models head-to-head and vote for the best</p>
            </div>
          </div>

          {/* View Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="battle" className="gap-1.5"><Swords className="h-3 w-3" /> Battle</TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5"><Clock className="h-3 w-3" /> History</TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-1.5"><Trophy className="h-3 w-3" /> Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="battle" className="space-y-4">
              {/* Category & Mode */}
              <div className="flex flex-wrap gap-2">
                {ARENA_CATEGORIES.map(cat => (
                  <Badge key={cat.id} variant={category === cat.id ? 'default' : 'outline'} className="text-xs cursor-pointer gap-1" onClick={() => setCategory(cat.id)}>
                    <cat.icon className="h-3 w-3" /> {cat.name}
                  </Badge>
                ))}
              </div>

              {/* Battle Mode */}
              {viewMode === 'battle' && !showResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quick Battle */}
                  <Card className="hover:border-violet-500/30 cursor-pointer" onClick={handleQuickBattle}>
                    <CardContent className="p-6 text-center">
                      <Zap className="h-10 w-10 text-violet-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold">Quick Battle</h3>
                      <p className="text-sm text-muted-foreground mt-1">Random models, random prompt. Just click and vote!</p>
                      <Button className="mt-4 gap-1.5"><Play className="h-4 w-4" /> Start Quick Battle</Button>
                    </CardContent>
                  </Card>

                  {/* Custom Battle */}
                  <Card>
                    <CardContent className="p-6 space-y-3">
                      <div className="text-center">
                        <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold">Custom Battle</h3>
                        <p className="text-sm text-muted-foreground mt-1">Choose your models and prompt</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Model A</label>
                        <Select value={selectedModelA} onValueChange={setSelectedModelA}>
                          <SelectTrigger><SelectValue placeholder="Select model..." /></SelectTrigger>
                          <SelectContent>{llmModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.providerId})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Model B</label>
                        <Select value={selectedModelB} onValueChange={setSelectedModelB}>
                          <SelectTrigger><SelectValue placeholder="Select model..." /></SelectTrigger>
                          <SelectContent>{llmModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.providerId})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Prompt</label>
                        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter your prompt..." className="min-h-[80px] text-sm" />
                      </div>
                      <Button className="w-full gap-1.5" disabled={!selectedModelA || !selectedModelB || !prompt.trim() || selectedModelA === selectedModelB} onClick={handleCustomBattle}>
                        <Swords className="h-4 w-4" /> Start Battle
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Battle Results / Voting */}
              {showResults && currentBattle && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Prompt */}
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Prompt</p>
                      <p className="text-sm font-medium">{currentBattle.prompt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{category}</Badge>
                        <Badge variant="outline" className="text-[10px]">{new Date(currentBattle.createdAt).toLocaleString()}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Models Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B'].map(side => {
                      const modelId = side === 'A' ? currentBattle.modelA : currentBattle.modelB;
                      const model = getAllModels().find(m => m.id === modelId);
                      const provider = PROVIDERS.find(p => p.id === model?.providerId);
                      const votes = side === 'A' ? currentBattle.votes.a : currentBattle.votes.b;
                      const totalVotes = currentBattle.votes.a + currentBattle.votes.b + currentBattle.votes.tie;
                      const votePercent = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(0) : '0';
                      return (
                        <Card key={side} className={cn("hover:border-violet-500/30 transition-colors",
                          currentBattle.winner === side ? "border-green-500/50 bg-green-500/5" : ""
                        )}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: (provider?.color || '#888') + '20', color: provider?.color }}>
                                  {side}
                                </div>
                                <div>
                                  <CardTitle className="text-sm">{model?.name || modelId}</CardTitle>
                                  <CardDescription className="text-[10px]">{provider?.name}</CardDescription>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-[10px]">{votePercent}%</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="bg-muted rounded-lg p-3 min-h-[120px]">
                              <p className="text-xs text-muted-foreground italic">Response from {model?.name}</p>
                              <p className="text-sm mt-2 line-clamp-6">
                                {side === 'A' ? currentBattle.responseA || 'Response will appear when you use the chat API.' : currentBattle.responseB || 'Response will appear when you use the chat API.'}
                              </p>
                            </div>
                            <Button className="w-full gap-1.5" variant={currentBattle.winner === side ? 'default' : 'outline'}
                              onClick={() => handleVote(side as 'A' | 'B')}>
                              <Crown className="h-3.5 w-3.5" /> Vote for {model?.name}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Vote Actions */}
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="lg" className="gap-2" onClick={() => handleVote('tie')}>
                      <SkipForward className="h-4 w-4" /> It's a Tie
                    </Button>
                    <Button size="lg" className="gap-2" onClick={handleNewBattle}>
                      <RefreshCw className="h-4 w-4" /> New Battle
                    </Button>
                  </div>

                  {/* Vote Summary */}
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{currentBattle.votes.a}</p>
                      <p className="text-xs text-muted-foreground">Model A</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-muted-foreground">{currentBattle.votes.tie}</p>
                      <p className="text-xs text-muted-foreground">Ties</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{currentBattle.votes.b}</p>
                      <p className="text-xs text-muted-foreground">Model B</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-2">
              {arenaBattles.length === 0 ? (
                <div className="text-center py-12">
                  <Swords className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No battles yet. Start your first battle!</p>
                </div>
              ) : (
                arenaBattles.slice().reverse().map((battle, i) => {
                  const modelA = getAllModels().find(m => m.id === battle.modelA);
                  const modelB = getAllModels().find(m => m.id === battle.modelB);
                  return (
                    <motion.div key={battle.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:border-violet-500/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{battle.category}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(battle.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs line-clamp-1">{battle.prompt}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className={cn("font-medium", battle.winner === 'A' ? "text-green-400" : "")}>{modelA?.name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className={cn("font-medium", battle.winner === 'B' ? "text-green-400" : "")}>{modelB?.name}</span>
                          {battle.winner && <Badge variant="secondary" className="text-[9px]">{battle.winner === 'tie' ? 'Tie' : `${battle.winner} wins`}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                        <span>{battle.votes.a + battle.votes.b + battle.votes.tie} votes</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No data yet. Start battling to build the leaderboard!</p>
                </div>
              ) : (
                leaderboard.map((entry, i) => {
                  const model = getAllModels().find(m => m.id === entry.modelId);
                  const provider = PROVIDERS.find(p => p.id === model?.providerId);
                  return (
                    <motion.div key={entry.modelId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 p-3 rounded-lg border">
                      <span className="text-lg font-bold w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: (provider?.color || '#888') + '20', color: provider?.color }}>
                        {model?.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{model?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{provider?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{entry.wins}W / {entry.total}B</p>
                        <p className="text-[10px] text-muted-foreground">{entry.rate}% win rate</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}


