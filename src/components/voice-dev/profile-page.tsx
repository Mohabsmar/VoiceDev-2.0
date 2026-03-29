'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Trophy, Flame, Star, MessageSquare, Cpu,
  Hash, TrendingUp, Award, Target, Rocket, Heart, Zap, Shield,
  Edit3, Save, X, Check, Camera, Globe, Moon, Sun, Volume2,
  VolumeX, Bell, BellOff, Key, RotateCcw, Download, ChevronRight,
  Activity, Clock, GitBranch, BookOpen, Settings, Lock, Eye,
  Sparkles, Crown, Medal, Gem, Swords, Feather, Palette, Music,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS, getAllModels } from '@/lib/providers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Cell,
} from 'recharts';

export default function ProfilePage() {
  const store = useVoiceDevStore();
  const { userProfile, updateProfile, chatSessions, usageStats, favoriteModels, favoriteItems, settings, updateSettings, promptLibrary } = store;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  const handleSave = () => {
    updateProfile({ name: name.trim() || 'User', email: email.trim(), bio: bio.trim() });
    setEditing(false);
  };

  // Stats
  const stats = useMemo(() => ({
    totalSessions: chatSessions.length,
    totalMessages: chatSessions.reduce((s, c) => s + c.messages.length, 0),
    totalTokens: usageStats.totalTokens,
    streakDays: userProfile.stats.streakDays,
    longestStreak: userProfile.stats.longestStreak,
    providersUsed: new Set(chatSessions.map(s => s.provider)).size,
    modelsUsed: new Set(chatSessions.map(s => s.model)).size,
    promptTemplates: promptLibrary.length,
  }), [chatSessions, usageStats, userProfile.stats, promptLibrary]);

  // Activity heatmap data (last 12 weeks)
  const heatmapData = useMemo(() => {
    const weeks: { week: string; days: number[] }[] = [];
    for (let w = 11; w >= 0; w--) {
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(Date.now() - (w * 7 + (6 - d)) * 86400000);
        const key = date.toISOString().split('T')[0];
        days.push(usageStats.dailyUsage[key] || 0);
      }
      weeks.push({ week: `W${12 - w}`, days });
    }
    return weeks;
  }, [usageStats.dailyUsage]);

  const maxVal = Math.max(...heatmapData.flatMap(w => w.days), 1);

  // Achievement detail
  const achievement = selectedAchievement ? userProfile.achievements.find(a => a.id === selectedAchievement) : null;
  const unlockedCount = userProfile.achievements.filter(a => a.unlockedAt).length;

  // Provider usage for bar chart
  const providerChartData = useMemo(() => {
    return Object.entries(usageStats.providerBreakdown)
      .filter(([, v]) => v > 0)
      .slice(0, 6)
      .map(([id, tokens]) => {
        const p = PROVIDERS.find(pr => pr.id === id);
        return { name: p?.name || id, tokens, color: p?.color || '#888' };
      })
      .sort((a, b) => b.tokens - a.tokens);
  }, [usageStats.providerBreakdown]);

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent pointer-events-none" />
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {(userProfile.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm font-bold w-48" placeholder="Name" />
                          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm w-56" placeholder="Email" />
                        </div>
                        <Input value={bio} onChange={(e) => setBio(e.target.value)} className="h-8 text-sm" placeholder="Write a short bio..." />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs" onClick={handleSave}><Save className="h-3 w-3 mr-1" /> Save</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl font-bold">{userProfile.name || 'User'}</h1>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing(true)}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                        {userProfile.email && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {userProfile.email}</p>}
                        {userProfile.bio && <p className="text-sm text-muted-foreground mt-1">{userProfile.bio}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] gap-1"><Calendar className="h-2.5 w-2.5" /> Joined {new Date(userProfile.joinedAt).toLocaleDateString()}</Badge>
                          <Badge variant="outline" className="text-[10px] gap-1"><Star className="h-2.5 w-2.5" /> Member</Badge>
                          <Badge className="text-[10px] bg-violet-500"><Crown className="h-2.5 w-2.5 mr-0.5" /> VoiceDev User</Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
                      const data = JSON.stringify({ profile: userProfile, stats, settings: store.settings }, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'voicedev-profile.json'; a.click();
                    }}>
                      <Download className="h-3 w-3" /> Export Data
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => store.setCurrentTab('settings')}>
                      <Settings className="h-3 w-3" /> Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Sessions', value: stats.totalSessions, icon: MessageSquare, color: 'violet' },
              { label: 'Messages', value: stats.totalMessages, icon: Activity, color: 'blue' },
              { label: 'Tokens', value: stats.totalTokens, icon: Hash, color: 'cyan', format: 'k' },
              { label: 'Providers', value: stats.providersUsed, icon: Cpu, color: 'emerald', suffix: '/20' },
              { label: 'Models Used', value: stats.modelsUsed, icon: Brain, color: 'purple' },
              { label: 'Favorites', value: favoriteModels.length + favoriteItems.length, icon: Star, color: 'amber' },
              { label: 'Current Streak', value: stats.streakDays, icon: Flame, color: 'orange', suffix: ' days' },
              { label: 'Best Streak', value: stats.longestStreak, icon: Trophy, color: 'yellow', suffix: ' days' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="hover:border-violet-500/30 transition-colors">
                    <CardContent className="p-3 text-center">
                      <Icon className={cn("h-5 w-5 mx-auto mb-1 text-violet-400")} />
                      <p className="text-xl font-bold tabular-nums">{stat.format === 'k' ? `${(stat.value / 1000).toFixed(1)}K` : stat.value}{stat.suffix}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Activity Heatmap */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Activity Heatmap</CardTitle>
                <CardDescription className="text-xs">Your usage over the past 12 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-fit">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-[9px] text-muted-foreground w-4 text-center mb-1">{d}</div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {heatmapData.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-1">
                        {week.days.map((val, di) => (
                          <Tooltip key={di}>
                            <TooltipTrigger asChild>
                              <div className={cn("w-4 h-4 rounded-sm cursor-pointer transition-colors",
                                val === 0 ? "bg-muted/20" : val < maxVal * 0.25 ? "bg-violet-900/40" : val < maxVal * 0.5 ? "bg-violet-700/60" : val < maxVal * 0.75 ? "bg-violet-500/80" : "bg-violet-400"
                              )} />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">{val.toLocaleString()} tokens</TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Achievements</CardTitle>
                    <CardDescription className="text-xs">{unlockedCount}/{userProfile.achievements.length} unlocked</CardDescription>
                  </div>
                  <Progress value={(unlockedCount / userProfile.achievements.length) * 100} className="w-24 h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {userProfile.achievements.map((a) => {
                    const rarityColors = {
                      common: { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', label: 'Common' },
                      rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', label: 'Rare' },
                      epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: 'Epic' },
                      legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Legendary' },
                    }[a.rarity];
                    return (
                      <motion.button key={a.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAchievement(a.id)}
                        className={cn("p-3 rounded-xl border text-center transition-all cursor-pointer", rarityColors.bg, rarityColors.border,
                          a.unlockedAt ? "hover:shadow-lg" : "opacity-30 grayscale"
                        )}>
                        <span className="text-2xl block mb-1">{a.icon}</span>
                        <p className="text-[10px] font-medium truncate">{a.name}</p>
                        <p className={cn("text-[8px] font-semibold", rarityColors.text)}>{rarityColors.label}</p>
                        {a.unlockedAt && (
                          <div className="mt-1 flex justify-center">
                            <Check className="h-3 w-3 text-green-400" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Provider Usage */}
          {providerChartData.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Provider Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={providerChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="#666" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#666" width={80} />
                        <RTooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
                          {providerChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Favorite Models */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Favorite Models</CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteModels.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No favorite models yet. Star models in the Providers tab.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {favoriteModels.map((modelId) => {
                      const model = getAllModels().find(m => m.id === modelId);
                      if (!model) return null;
                      const provider = PROVIDERS.find(p => p.models.some(m => m.id === modelId));
                      return (
                        <Badge key={modelId} variant="outline" className="text-xs py-1 px-2 gap-1.5 cursor-pointer hover:bg-accent"
                          style={{ borderColor: provider?.color }}>
                          <Cpu className="h-3 w-3" style={{ color: provider?.color }} />
                          {model.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences Quick Links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Quick Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><Moon className="h-4 w-4 text-violet-400" /> Dark Mode</div>
                  <Button variant={settings.theme === 'dark' ? 'default' : 'outline'} size="sm" className="h-7 text-xs gap-1"
                    onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>
                    {settings.theme === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                    {settings.theme === 'dark' ? 'Dark' : 'Light'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-blue-400" /> Language</div>
                  <Badge variant="outline" className="text-xs">{settings.language.toUpperCase()}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><Volume2 className="h-4 w-4 text-amber-400" /> Sounds</div>
                  <Button variant={settings.soundEnabled ? 'default' : 'outline'} size="sm" className="h-7 text-xs gap-1"
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}>
                    {settings.soundEnabled ? 'On' : 'Off'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><Bell className="h-4 w-4 text-emerald-400" /> Notifications</div>
                  <Button variant={store.notifications.messageComplete ? 'default' : 'outline'} size="sm" className="h-7 text-xs"
                    onClick={() => store.updateNotificationSettings({ messageComplete: !store.notifications.messageComplete })}>
                    {store.notifications.messageComplete ? 'On' : 'Off'}
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><Palette className="h-4 w-4 text-pink-400" /> Accent Color</div>
                  <div className="flex gap-1">
                    {['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan'].map(c => (
                      <button key={c} className={cn("h-5 w-5 rounded-full border-2 cursor-pointer transition-transform hover:scale-110",
                        `bg-${c}-500`, settings.accentColor === c ? 'border-white scale-110' : 'border-transparent'
                      )} onClick={() => updateSettings({ accentColor: c })} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {achievement && (
        <Dialog open={!!achievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-sm">
            <div className="text-center">
              <span className="text-5xl block mb-3">{achievement.icon}</span>
              <h3 className="text-lg font-bold">{achievement.name}</h3>
              <Badge className="mt-1" variant="outline">{achievement.rarity}</Badge>
              <p className="text-sm text-muted-foreground mt-3">{achievement.description}</p>
              {achievement.unlockedAt && (
                <p className="text-xs text-violet-400 mt-3">Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}

function Dialog({ open, children, onOpenChange }: { open: boolean; children: React.ReactNode; onOpenChange: (v: boolean) => void }) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", !open && "hidden")} onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border rounded-xl p-6 shadow-xl max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </div>
  );
}

function Brain(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>;
}
