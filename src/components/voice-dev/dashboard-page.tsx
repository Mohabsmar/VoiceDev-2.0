'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Zap, MessageSquare,
  Cpu, BarChart3, PieChart, RefreshCw, Download, Calendar, Filter,
  Trophy, Flame, Target, Star, Clock, ArrowUpRight, ArrowDownRight,
  Brain, Sparkles, Shield, Rocket, ChevronRight, Eye, MousePointer,
  GitBranch, Hash, Boxes, Layers, Grid3X3, List, Settings2,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { getAllModels, getTotalModelCount, PROVIDERS } from '@/lib/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, BarChart, Bar,
  Area, AreaChart, Legend,
} from 'recharts';

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function DashboardPage() {
  const store = useVoiceDevStore();
  const { usageStats, chatSessions, userProfile, activityLog, dashboardWidgets, toggleDashboardWidget } = store;
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [chartType, setChartType] = useState('area');
  const [exportFormat, setExportFormat] = useState('');

  // Computed stats
  const stats = useMemo(() => {
    const totalMessages = chatSessions.reduce((sum, s) => sum + s.messages.length, 0);
    const totalTokens = usageStats.totalTokens;
    const totalSessions = chatSessions.length;
    const activeProviders = Object.keys(store.apiKeys).filter(k => store.apiKeys[k]).length;
    const avgLatency = usageStats.avgLatency || 0;
    const costEstimate = usageStats.monthlyCost || 0;
    const streakDays = userProfile.stats.streakDays;
    const longestStreak = userProfile.stats.longestStreak;
    return { totalMessages, totalTokens, totalSessions, activeProviders, avgLatency, costEstimate, streakDays, longestStreak };
  }, [chatSessions, usageStats, store.apiKeys, userProfile.stats]);

  // Usage chart data
  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
    const data = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 86400000);
      const key = date.toISOString().split('T')[0];
      const tokens = usageStats.dailyUsage[key] || 0;
      data.push({
        date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        tokens,
        calls: Math.floor(tokens / 500),
        cost: (tokens / 1000000) * 0.003,
      });
    }
    return data;
  }, [usageStats.dailyUsage, timeRange]);

  // Provider breakdown for pie chart
  const providerData = useMemo(() => {
    return Object.entries(usageStats.providerBreakdown)
      .filter(([, tokens]) => tokens > 0)
      .map(([id, tokens]) => {
        const provider = PROVIDERS.find(p => p.id === id);
        return { name: provider?.name || id, value: tokens, color: provider?.color || '#888', calls: Math.floor(tokens / 500) };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [usageStats.providerBreakdown]);

  // Model leaderboard
  const modelLeaderboard = useMemo(() => {
    const modelUsage: Record<string, { count: number; tokens: number; provider: string }> = {};
    chatSessions.forEach(s => {
      const key = `${s.provider}:${s.model}`;
      if (!modelUsage[key]) modelUsage[key] = { count: 0, tokens: 0, provider: s.provider };
      modelUsage[key].count += s.messages.length;
      modelUsage[key].tokens += s.messages.reduce((sum, m) => sum + (m.tokenCount || 500), 0);
    });
    return Object.entries(modelUsage)
      .map(([key, val]) => ({ model: key.split(':')[1], provider: key.split(':')[0], ...val }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [chatSessions]);

  // Top categories
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    getAllModels().forEach(m => { cats[m.category] = (cats[m.category] || 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, []);

  // Weekly heatmap data
  const heatmapData = useMemo(() => {
    const data = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const key = date.toISOString().split('T')[0];
      data.push({ date: key, value: usageStats.dailyUsage[key] || 0, day: date.toLocaleDateString('en', { weekday: 'short' }) });
    }
    return data;
  }, [usageStats.dailyUsage]);

  const maxHeatmap = Math.max(...heatmapData.map(d => d.value), 1);

  const handleExport = (format: string) => {
    const data = { stats, chartData, providerData, modelLeaderboard };
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'voicedev-dashboard.json'; a.click();
    } else if (format === 'csv') {
      const rows = [['Metric', 'Value'], ...Object.entries(stats).map(([k, v]) => [k, v])];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'voicedev-dashboard.csv'; a.click();
    }
  };

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const statCards = [
    { label: 'Total Sessions', value: stats.totalSessions, icon: MessageSquare, color: 'violet', change: '+12%', up: true },
    { label: 'Total Messages', value: stats.totalMessages, icon: Activity, color: 'blue', change: '+8%', up: true },
    { label: 'Tokens Used', value: stats.totalTokens, icon: Hash, color: 'cyan', format: 'token', change: '+15%', up: true },
    { label: 'API Calls', value: usageStats.totalCalls, icon: Zap, color: 'amber', change: '+5%', up: true },
    { label: 'Active Providers', value: stats.activeProviders, icon: Cpu, color: 'emerald', suffix: '/20' },
    { label: 'Est. Monthly Cost', value: stats.costEstimate, icon: DollarSign, color: 'green', format: 'currency', change: '-3%', up: false },
    { label: 'Current Streak', value: stats.streakDays, icon: Flame, color: 'orange', suffix: ' days' },
    { label: 'Models Available', value: getTotalModelCount(), icon: Brain, color: 'purple' },
  ];

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar" key={refreshKey}>
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-violet-500" /> Dashboard
              </motion.h1>
              <p className="text-sm text-muted-foreground mt-1">Your VoiceDev usage analytics and insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 gap-1.5 text-xs">
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
              <Select value={exportFormat} onValueChange={handleExport}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Export" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">Export JSON</SelectItem>
                  <SelectItem value="csv">Export CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:border-violet-500/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", `bg-${card.color}-500/10`)}>
                          <Icon className={cn("h-4 w-4 text-${card.color}-400")} />
                        </div>
                        {card.change && (
                          <Badge variant={card.up ? 'default' : 'secondary'} className="text-[10px] h-5 gap-0.5">
                            {card.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                            {card.change}
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold tabular-nums">
                        {card.format === 'currency' ? `$${card.value.toFixed(2)}` : card.format === 'token' ? `${(card.value / 1000).toFixed(1)}K` : card.value}
                        {card.suffix && <span className="text-sm text-muted-foreground ml-1">{card.suffix}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Usage Chart */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Usage Over Time</CardTitle>
                    <div className="flex gap-1">
                      {['area', 'line', 'bar'].map(t => (
                        <Button key={t} variant={chartType === t ? 'default' : 'ghost'} size="sm" className="h-6 text-[10px] px-2" onClick={() => setChartType(t)}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'area' ? (
                        <AreaChart data={chartData}>
                          <defs><linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#666" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                          <RTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 11 }} />
                          <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" fill="url(#tokenGrad)" strokeWidth={2} name="Tokens" />
                        </AreaChart>
                      ) : chartType === 'line' ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#666" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                          <RTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 11 }} />
                          <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Tokens" />
                          <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} dot={false} name="Calls" />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#666" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                          <RTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 11 }} />
                          <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Tokens" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Provider Pie */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Provider Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie data={providerData.length > 0 ? providerData : [{ name: 'No data', value: 1, color: '#333' }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                          {(providerData.length > 0 ? providerData : [{ name: 'No data', value: 1, color: '#333' }]).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <RTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 11 }} />
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 mt-2">
                    {providerData.slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="text-muted-foreground">{p.name}</span>
                        </div>
                        <span className="font-mono">{(p.value / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Heatmap */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Activity Heatmap (Last 4 weeks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {heatmapData.map((d, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className={cn("h-4 w-4 rounded-sm transition-colors cursor-pointer",
                          d.value === 0 ? "bg-muted/30" : d.value < maxHeatmap * 0.25 ? "bg-violet-900/40" : d.value < maxHeatmap * 0.5 ? "bg-violet-700/60" : d.value < maxHeatmap * 0.75 ? "bg-violet-500/80" : "bg-violet-400"
                        )} />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {d.date}: {d.value.toLocaleString()} tokens
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>Less</span>
                  <div className="h-3 w-3 rounded-sm bg-muted/30" />
                  <div className="h-3 w-3 rounded-sm bg-violet-900/40" />
                  <div className="h-3 w-3 rounded-sm bg-violet-700/60" />
                  <div className="h-3 w-3 rounded-sm bg-violet-500/80" />
                  <div className="h-3 w-3 rounded-sm bg-violet-400" />
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Model Leaderboard */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Model Leaderboard</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{modelLeaderboard.length} models</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {modelLeaderboard.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">Start chatting to see model usage</div>
                  ) : (
                    <div className="space-y-2">
                      {modelLeaderboard.slice(0, 8).map((m, i) => {
                        const provider = PROVIDERS.find(p => p.id === m.provider);
                        return (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                            <div className="h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: provider?.color + '20', color: provider?.color }}>
                              {m.model.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{m.model}</p>
                              <p className="text-[10px] text-muted-foreground">{provider?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono">{(m.tokens / 1000).toFixed(1)}K</p>
                              <p className="text-[10px] text-muted-foreground">{m.count} msgs</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Achievements</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {userProfile.achievements.filter(a => a.unlockedAt).length}/{userProfile.achievements.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {userProfile.achievements.map((a) => {
                      const rarityColor = { common: 'bg-gray-500/20 border-gray-500/30', rare: 'bg-blue-500/20 border-blue-500/30', epic: 'bg-purple-500/20 border-purple-500/30', legendary: 'bg-amber-500/20 border-amber-500/30' }[a.rarity];
                      return (
                        <Tooltip key={a.id}>
                          <TooltipTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} className={cn("p-2 rounded-lg border text-center cursor-pointer transition-colors", rarityColor, a.unlockedAt ? "" : "opacity-40 grayscale")}>
                              <span className="text-xl">{a.icon}</span>
                              <p className="text-[10px] font-medium mt-1 truncate">{a.name}</p>
                              <Badge variant="outline" className="text-[8px] mt-0.5 h-3 px-1">{a.rarity}</Badge>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.description}</p>
                            {a.unlockedAt && <p className="text-[10px] text-violet-400">Unlocked {new Date(a.unlockedAt).toLocaleDateString()}</p>}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{activityLog.length} events</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {activityLog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {activityLog.slice(0, 20).map((entry, i) => {
                      const iconMap: Record<string, React.ElementType> = { chat: MessageSquare, marketplace: Star, settings: Settings2, achievement: Trophy, integration: Layers, workflow: GitBranch };
                      const Icon = iconMap[entry.type] || Activity;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="h-7 w-7 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                            <Icon className="h-3.5 w-3.5 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs">{entry.description}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">{new Date(entry.timestamp).toLocaleDateString()}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Available Model Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg border hover:border-violet-500/30 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{cat.value}</p>
                        <p className="text-xs text-muted-foreground">{cat.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
