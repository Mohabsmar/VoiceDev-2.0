// ============================================================================
// VoiceDev 2.0 - Zustand Store (1000+ Features)
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings, VoiceDevStore, ChatSession, Message, NotificationPreferences,
  PrivacySettings, PerformanceSettings, UsageStats, Workflow, PromptTemplate,
  ArenaBattle, Plugin, Note, NotesFolder, CodeFile, EditorTab, TerminalSession,
  TerminalLine, Integration, ChatTemplate, UserProfile, Achievement,
  ActivityEntry, VDFile, DashboardWidget, QuickReply, ChatFilters,
} from './types';

// ---------------------------------------------------------------------------
// Default Settings
// ---------------------------------------------------------------------------

const defaultSettings: AppSettings = {
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: 'You are a helpful AI assistant.',
  stream: true,
  showTokens: true,
  theme: 'dark',
  accentColor: 'violet',
  fontSize: 14,
  messageSpacing: 'comfortable',
  codeTheme: 'vs2015',
  sendOnEnter: true,
  showTimestamps: true,
  showModelInfo: true,
  showTokenCount: true,
  compactMode: false,
  soundEnabled: false,
  notificationSound: 'default',
  autoSave: true,
  autoSaveInterval: 30,
  markdownRendering: true,
  codeLineNumbers: true,
  messageBubbleStyle: 'modern',
  avatarStyle: 'provider-icon',
  sidebarPosition: 'left',
  chatWidth: 'medium',
  language: 'en',
};

const defaultNotifications: NotificationPreferences = {
  messageComplete: true, errors: true, sound: false, desktop: false,
  mentions: true, updates: true, weeklyDigest: false,
};

const defaultPrivacy: PrivacySettings = {
  clearOnExit: false, anonymousUsage: true, dataRetention: 90,
  shareUsageStats: true, enableTelemetry: true,
};

const defaultPerformance: PerformanceSettings = {
  animations: true, particles: true, messageLoadLimit: 100,
  lazyLoading: true, hardwareAcceleration: true, cacheSize: 100,
};

const defaultUsage: UsageStats = {
  totalCalls: 0, totalTokens: 0, providerBreakdown: {},
  dailyUsage: {}, weeklyUsage: {}, monthlyCost: 0, avgLatency: 0,
};

const defaultProfile: UserProfile = {
  id: 'user-1', name: 'User', email: '',
  joinedAt: Date.now(), preferences: {},
  stats: { totalSessions: 0, totalMessages: 0, totalTokensUsed: 0, streakDays: 0, longestStreak: 0 },
  achievements: [
    { id: 'first-chat', name: 'First Chat', description: 'Send your first message', icon: '💬', rarity: 'common' },
    { id: 'power-user', name: 'Power User', description: 'Send 100 messages', icon: '⚡', rarity: 'rare' },
    { id: 'explorer', name: 'Explorer', description: 'Try 5 different providers', icon: '🧭', rarity: 'common' },
    { id: 'collector', name: 'Collector', description: 'Install 10 marketplace items', icon: '📦', rarity: 'rare' },
    { id: 'organizer', name: 'Organizer', description: 'Create 5 folders', icon: '📁', rarity: 'common' },
    { id: 'prompt-master', name: 'Prompt Master', description: 'Save 20 prompt templates', icon: '✨', rarity: 'epic' },
    { id: 'workflow-architect', name: 'Workflow Architect', description: 'Create 5 active workflows', icon: '🔄', rarity: 'epic' },
    { id: 'arena-champion', name: 'Arena Champion', description: 'Win 20 arena battles', icon: '🏆', rarity: 'legendary' },
    { id: 'night-owl', name: 'Night Owl', description: 'Chat after midnight', icon: '🦉', rarity: 'common' },
    { id: 'streak-7', name: '7-Day Streak', description: 'Use VoiceDev 7 days in a row', icon: '🔥', rarity: 'rare' },
    { id: 'streak-30', name: '30-Day Streak', description: 'Use VoiceDev 30 days in a row', icon: '🌟', rarity: 'epic' },
    { id: 'social-butterfly', name: 'Social Butterfly', description: 'Share 5 prompt templates', icon: '🦋', rarity: 'rare' },
  ],
  activityLog: [],
};

const defaultChatFilters: ChatFilters = {
  search: '', provider: '', model: '', dateRange: null,
  hasAttachments: false, isPinned: false, sortBy: 'newest', tags: [],
};

const defaultDashboardWidgets: DashboardWidget[] = [
  { id: 'quick-stats', type: 'quick-stats', position: 0, enabled: true, size: 'medium' },
  { id: 'usage-chart', type: 'usage-chart', position: 1, enabled: true, size: 'large' },
  { id: 'provider-pie', type: 'provider-pie', position: 2, enabled: true, size: 'medium' },
  { id: 'recent-activity', type: 'recent-activity', position: 3, enabled: true, size: 'medium' },
  { id: 'token-counter', type: 'token-counter', position: 4, enabled: true, size: 'small' },
  { id: 'cost-tracker', type: 'cost-tracker', position: 5, enabled: true, size: 'small' },
  { id: 'model-leaderboard', type: 'model-leaderboard', position: 6, enabled: true, size: 'medium' },
  { id: 'streak-counter', type: 'streak-counter', position: 7, enabled: true, size: 'small' },
  { id: 'achievement-showcase', type: 'achievement-showcase', position: 8, enabled: true, size: 'medium' },
  { id: 'favorite-prompts', type: 'favorite-prompts', position: 9, enabled: true, size: 'small' },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useVoiceDevStore = create<VoiceDevStore>()(
  persist(
    (set, get) => ({
      // ── Core State ──
      currentTab: 'landing' as const,
      chatSessions: [],
      currentSessionId: null,
      apiKeys: {},
      settings: defaultSettings,
      installedItems: [],
      sidebarOpen: true,
      setupComplete: false,
      userName: '',
      isStreaming: false,
      messageReactions: {},
      bookmarkedMessages: [],
      chatFolders: [],
      collections: [],
      itemRatings: {},
      itemReviews: {},
      favoriteModels: [],
      favoriteItems: [],
      recentlyViewed: [],
      searchHistory: [],
      modelAliases: {},
      modelTags: {},
      customCSS: '',
      promptLibrary: [],
      chatBackground: '',
      notifications: defaultNotifications,
      privacy: defaultPrivacy,
      performance: defaultPerformance,
      usageStats: defaultUsage,
      lastBackup: 0,
      autoBackupInterval: 5,
      marketplaceView: 'grid' as const,
      customShortcuts: {},
      sidebarCollapsed: false,
      navTabOrder: ['landing', 'chat', 'dashboard', 'marketplace', 'providers', 'arena', 'prompts', 'workflows', 'plugins', 'notes', 'editor', 'terminal', 'files', 'templates', 'integrations', 'profile', 'settings'],
      language: 'en',
      loadingComplete: false,

      // ── New State ──
      workflows: [],
      promptTemplates: [],
      arenaBattles: [],
      plugins: [],
      notes: [],
      notesFolders: [{ id: 'folder-default', name: 'All Notes', color: '#8b5cf6' }, { id: 'folder-personal', name: 'Personal', color: '#3b82f6' }, { id: 'folder-work', name: 'Work', color: '#10b981' }],
      editorFiles: [],
      editorTabs: [],
      terminalSessions: [],
      integrations: [
        { id: 'github', name: 'GitHub', description: 'Connect to GitHub repositories', icon: '🐙', enabled: false, status: 'disconnected', settings: {}, category: 'Development', features: ['repos', 'issues', 'prs'] },
        { id: 'slack', name: 'Slack', description: 'Send messages to Slack channels', icon: '💬', enabled: false, status: 'disconnected', settings: {}, category: 'Communication', features: ['messages', 'channels', 'notifications'] },
        { id: 'notion', name: 'Notion', description: 'Sync with Notion databases', icon: '📝', enabled: false, status: 'disconnected', settings: {}, category: 'Productivity', features: ['pages', 'databases', 'search'] },
        { id: 'google-drive', name: 'Google Drive', description: 'Access Google Drive files', icon: '📂', enabled: false, status: 'disconnected', settings: {}, category: 'Storage', features: ['files', 'folders', 'sharing'] },
        { id: 'discord', name: 'Discord', description: 'Integrate with Discord servers', icon: '🎮', enabled: false, status: 'disconnected', settings: {}, category: 'Communication', features: ['messages', 'channels', 'webhooks'] },
        { id: 'jira', name: 'Jira', description: 'Manage Jira tickets', icon: '📋', enabled: false, status: 'disconnected', settings: {}, category: 'Project Management', features: ['tickets', 'boards', 'sprints'] },
        { id: 'linear', name: 'Linear', description: 'Track Linear issues', icon: '🎯', enabled: false, status: 'disconnected', settings: {}, category: 'Project Management', features: ['issues', 'projects', 'cycles'] },
        { id: 'figma', name: 'Figma', description: 'Access Figma designs', icon: '🎨', enabled: false, status: 'disconnected', settings: {}, category: 'Design', features: ['files', 'components', 'comments'] },
      ],
      chatTemplates: [],
      userProfile: defaultProfile,
      files: [],
      activityLog: [],
      pinnedMessages: [],
      draftMessages: {},
      scheduledMessages: [],
      quickReplies: [
        { id: 'qr-1', title: 'Explain this code', content: 'Can you explain what this code does step by step?', usageCount: 0 },
        { id: 'qr-2', title: 'Find bugs', content: 'Please review this code for potential bugs and security vulnerabilities.', usageCount: 0 },
        { id: 'qr-3', title: 'Write tests', content: 'Write comprehensive unit tests for this code, including edge cases.', usageCount: 0 },
        { id: 'qr-4', title: 'Optimize', content: 'How can I optimize this code for better performance and readability?', usageCount: 0 },
        { id: 'qr-5', title: 'Document', content: 'Add comprehensive documentation and comments to this code.', usageCount: 0 },
      ],
      chatFilters: defaultChatFilters,
      providerLatencies: {},
      themeOverrides: {},
      dashboardWidgets: defaultDashboardWidgets,
      commandHistory: [],

      // ===================================================================
      // Core Actions
      // ===================================================================
      setCurrentTab: (tab) => set({ currentTab: tab }),

      createSession: (provider = 'openai', model = 'gpt-4o') => {
        const id = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const session: ChatSession = {
          id, name: 'New Chat', messages: [], provider, model,
          createdAt: Date.now(), updatedAt: Date.now(),
        };
        set((state) => ({
          chatSessions: [session, ...state.chatSessions],
          currentSessionId: id,
        }));
        return id;
      },

      deleteSession: (id) =>
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        })),

      renameSession: (id, name) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === id ? { ...s, name, updatedAt: Date.now() } : s
          ),
        })),

      setCurrentSession: (id) => set({ currentSessionId: id }),

      addMessage: (sessionId, message) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
              : s
          ),
        })),

      updateMessage: (sessionId, messageId, content) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.map((m) => m.id === messageId ? { ...m, content, edited: true } : m), updatedAt: Date.now() }
              : s
          ),
        })),

      deleteMessage: (sessionId, messageId) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.filter((m) => m.id !== messageId), updatedAt: Date.now() }
              : s
          ),
        })),

      pinMessage: (sessionId, messageId) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.map((m) => m.id === messageId ? { ...m, pinned: true } : m), updatedAt: Date.now() }
              : s
          ),
          pinnedMessages: [...state.pinnedMessages, messageId],
        })),

      unpinMessage: (sessionId, messageId) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.map((m) => m.id === messageId ? { ...m, pinned: false } : m), updatedAt: Date.now() }
              : s
          ),
          pinnedMessages: state.pinnedMessages.filter((id) => id !== messageId),
        })),

      clearMessages: (sessionId) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId ? { ...s, messages: [], updatedAt: Date.now() } : s
          ),
        })),

      setApiKey: (providerId, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [providerId]: key } })),

      removeApiKey: (providerId) =>
        set((state) => {
          const keys = { ...state.apiKeys };
          delete keys[providerId];
          return { apiKeys: keys };
        }),

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      toggleInstall: (itemId) =>
        set((state) => ({
          installedItems: state.installedItems.includes(itemId)
            ? state.installedItems.filter((i) => i !== itemId)
            : [...state.installedItems, itemId],
        })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setUserName: (name) => set({ userName: name }),
      setSetupComplete: (complete) => set({ setupComplete: complete }),

      exportData: () => {
        const state = get();
        return JSON.stringify({ ...state }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set({ ...data });
          return true;
        } catch { return false; }
      },

      clearAllData: () =>
        set({
          chatSessions: [], currentSessionId: null, apiKeys: {},
          installedItems: [], setupComplete: false, userName: '',
          workflows: [], promptTemplates: [], arenaBattles: [],
          plugins: [], notes: [], editorFiles: [], editorTabs: [],
          terminalSessions: [], chatTemplates: [], files: [],
          activityLog: [], pinnedMessages: [], draftMessages: {},
          scheduledMessages: [], favoriteModels: [], favoriteItems: [],
          collections: [], chatFolders: [],
        }),

      // ===================================================================
      // Reactions & Bookmarks
      // ===================================================================
      toggleReaction: (messageId, emoji) =>
        set((state) => {
          const msgReactions = { ...state.messageReactions };
          const current = msgReactions[messageId] || {};
          const count = current[emoji] || 0;
          if (count > 0) {
            if (count === 1) delete current[emoji];
            else current[emoji] = count - 1;
          } else {
            current[emoji] = 1;
          }
          msgReactions[messageId] = current;
          return { messageReactions: msgReactions };
        }),

      toggleBookmark: (messageId) =>
        set((state) => ({
          bookmarkedMessages: state.bookmarkedMessages.includes(messageId)
            ? state.bookmarkedMessages.filter((id) => id !== messageId)
            : [...state.bookmarkedMessages, messageId],
        })),

      // ===================================================================
      // Chat Folders
      // ===================================================================
      createFolder: (name, color) =>
        set((state) => ({
          chatFolders: [...state.chatFolders, { id: `folder-${Date.now()}`, name, sessionIds: [], color }],
        })),

      deleteFolder: (id) =>
        set((state) => ({ chatFolders: state.chatFolders.filter((f) => f.id !== id) })),

      renameFolder: (id, name) =>
        set((state) => ({ chatFolders: state.chatFolders.map((f) => f.id === id ? { ...f, name } : f) })),

      moveSessionToFolder: (sessionId, folderId) =>
        set((state) => ({
          chatFolders: state.chatFolders.map((f) =>
            f.id === folderId
              ? { ...f, sessionIds: f.sessionIds.includes(sessionId) ? f.sessionIds : [...f.sessionIds, sessionId] }
              : { ...f, sessionIds: f.sessionIds.filter((sid) => sid !== sessionId) }
          ),
        })),

      // ===================================================================
      // Collections
      // ===================================================================
      createCollection: (name, description) =>
        set((state) => ({
          collections: [...state.collections, { id: `coll-${Date.now()}`, name, itemIds: [], description }],
        })),

      addToCollection: (collectionId, itemId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.itemIds.includes(itemId) ? { ...c, itemIds: [...c.itemIds, itemId] } : c
          ),
        })),

      removeFromCollection: (collectionId, itemId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId ? { ...c, itemIds: c.itemIds.filter((id) => id !== itemId) } : c
          ),
        })),

      deleteCollection: (collectionId) =>
        set((state) => ({ collections: state.collections.filter((c) => c.id !== collectionId) })),

      renameCollection: (collectionId, name) =>
        set((state) => ({ collections: state.collections.map((c) => c.id === collectionId ? { ...c, name } : c) })),

      // ===================================================================
      // Ratings & Reviews
      // ===================================================================
      rateItem: (itemId, rating) =>
        set((state) => ({ itemRatings: { ...state.itemRatings, [itemId]: rating } })),

      addReview: (itemId, text, rating) =>
        set((state) => ({
          itemReviews: {
            ...state.itemReviews,
            [itemId]: [...(state.itemReviews[itemId] || []), { text, author: state.userName || 'Anonymous', date: Date.now(), rating }],
          },
        })),

      deleteReview: (itemId, index) =>
        set((state) => ({
          itemReviews: {
            ...state.itemReviews,
            [itemId]: (state.itemReviews[itemId] || []).filter((_, i) => i !== index),
          },
        })),

      // ===================================================================
      // Favorites
      // ===================================================================
      toggleFavoriteModel: (modelId) =>
        set((state) => ({
          favoriteModels: state.favoriteModels.includes(modelId)
            ? state.favoriteModels.filter((id) => id !== modelId) : [...state.favoriteModels, modelId],
        })),

      toggleFavoriteItem: (itemId) =>
        set((state) => ({
          favoriteItems: state.favoriteItems.includes(itemId)
            ? state.favoriteItems.filter((id) => id !== itemId) : [...state.favoriteItems, itemId],
        })),

      // ===================================================================
      // Recently Viewed & Search
      // ===================================================================
      addRecentlyViewed: (item) =>
        set((state) => ({
          recentlyViewed: [item, ...state.recentlyViewed.filter((rv) => rv.id !== item.id)].slice(0, 50),
        })),

      addSearchHistory: (query) =>
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 20),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),

      // ===================================================================
      // Model Aliases & Tags
      // ===================================================================
      setModelAlias: (alias, providerModel) =>
        set((state) => ({ modelAliases: { ...state.modelAliases, [alias]: providerModel } })),

      removeModelAlias: (alias) =>
        set((state) => {
          const aliases = { ...state.modelAliases };
          delete aliases[alias];
          return { modelAliases: aliases };
        }),

      addModelTag: (modelId, tag) =>
        set((state) => {
          const current = state.modelTags[modelId] || [];
          if (current.includes(tag)) return state;
          return { modelTags: { ...state.modelTags, [modelId]: [...current, tag] } };
        }),

      removeModelTag: (modelId, tag) =>
        set((state) => ({
          modelTags: { ...state.modelTags, [modelId]: (state.modelTags[modelId] || []).filter((t) => t !== tag) },
        })),

      // ===================================================================
      // Customization
      // ===================================================================
      setCustomCSS: (css) => set({ customCSS: css }),

      savePromptToLibrary: (prompt) =>
        set((state) => ({
          promptLibrary: [...state.promptLibrary, { ...prompt, id: `prompt-${Date.now()}` }],
        })),

      deletePromptFromLibrary: (id) =>
        set((state) => ({ promptLibrary: state.promptLibrary.filter((p) => p.id !== id) })),

      setChatBackground: (bg) => set({ chatBackground: bg }),

      // ===================================================================
      // Settings
      // ===================================================================
      updateNotificationSettings: (partial) =>
        set((state) => ({ notifications: { ...state.notifications, ...partial } })),

      updatePrivacySettings: (partial) =>
        set((state) => ({ privacy: { ...state.privacy, ...partial } })),

      updatePerformanceSettings: (partial) =>
        set((state) => ({ performance: { ...state.performance, ...partial } })),

      // ===================================================================
      // Usage & Backup
      // ===================================================================
      recordUsage: (providerId, tokens, latency) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const latencies = { ...state.providerLatencies };
          if (latency) {
            latencies[providerId] = [...(latencies[providerId] || []), latency].slice(-50);
          }
          return {
            usageStats: {
              ...state.usageStats,
              totalCalls: state.usageStats.totalCalls + 1,
              totalTokens: state.usageStats.totalTokens + tokens,
              providerBreakdown: {
                ...state.usageStats.providerBreakdown,
                [providerId]: (state.usageStats.providerBreakdown[providerId] || 0) + tokens,
              },
              dailyUsage: { ...state.usageStats.dailyUsage, [today]: (state.usageStats.dailyUsage[today] || 0) + tokens },
              monthlyCost: state.usageStats.monthlyCost + (tokens / 1000000) * 0.003,
            },
            providerLatencies: latencies,
          };
        }),

      triggerBackup: () => set({ lastBackup: Date.now() }),

      // ===================================================================
      // View & Navigation
      // ===================================================================
      setMarketplaceView: (view) => set({ marketplaceView: view }),
      setCustomShortcut: (action, key) =>
        set((state) => ({ customShortcuts: { ...state.customShortcuts, [action]: key } })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setNavTabOrder: (order) => set({ navTabOrder: order }),
      setLanguage: (lang) => set({ language: lang }),
      setLoadingComplete: (complete) => set({ loadingComplete: complete }),

      // ===================================================================
      // Workflow Actions
      // ===================================================================
      createWorkflow: (name, description) => {
        const id = `wf-${Date.now()}`;
        const workflow: Workflow = {
          id, name, description, nodes: [], edges: [],
          createdAt: Date.now(), updatedAt: Date.now(),
          runCount: 0, status: 'draft',
        };
        set((state) => ({ workflows: [...state.workflows, workflow] }));
        return id;
      },

      updateWorkflow: (id, partial) =>
        set((state) => ({
          workflows: state.workflows.map((w) => w.id === id ? { ...w, ...partial, updatedAt: Date.now() } : w),
        })),

      deleteWorkflow: (id) =>
        set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) })),

      runWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, lastRun: Date.now(), runCount: w.runCount + 1, status: 'active' } : w
          ),
        })),

      // ===================================================================
      // Prompt Template Actions
      // ===================================================================
      createPromptTemplate: (template) => {
        const id = `pt-${Date.now()}`;
        const prompt: PromptTemplate = {
          ...template, id, createdAt: Date.now(), updatedAt: Date.now(),
          usageCount: 0, rating: 0,
        };
        set((state) => ({ promptTemplates: [...state.promptTemplates, prompt] }));
        return id;
      },

      updatePromptTemplate: (id, partial) =>
        set((state) => ({
          promptTemplates: state.promptTemplates.map((p) => p.id === id ? { ...p, ...partial, updatedAt: Date.now() } : p),
        })),

      deletePromptTemplate: (id) =>
        set((state) => ({ promptTemplates: state.promptTemplates.filter((p) => p.id !== id) })),

      // ===================================================================
      // Arena Actions
      // ===================================================================
      createArenaBattle: (modelA, modelB, prompt, category) => {
        const id = `arena-${Date.now()}`;
        const battle: ArenaBattle = {
          id, modelA, modelB, prompt,
          responseA: '', responseB: '',
          winner: null, votes: { a: 0, b: 0, tie: 0 },
          createdAt: Date.now(), category,
        };
        set((state) => ({ arenaBattles: [...state.arenaBattles, battle] }));
        return id;
      },

      voteArenaBattle: (id, vote) =>
        set((state) => ({
          arenaBattles: state.arenaBattles.map((b) =>
            b.id === id ? {
              ...b,
              votes: { ...b.votes, [vote === 'A' ? 'a' : vote === 'B' ? 'b' : 'tie']: b.votes[vote === 'A' ? 'a' : vote === 'B' ? 'b' : 'tie'] + 1 },
              winner: b.votes.a + 1 > b.votes.b ? 'A' : b.votes.b + 1 > b.votes.a ? 'B' : 'tie',
            } : b
          ),
        })),

      // ===================================================================
      // Plugin Actions
      // ===================================================================
      installPlugin: (plugin) =>
        set((state) => ({ plugins: [...state.plugins, plugin] })),

      uninstallPlugin: (id) =>
        set((state) => ({ plugins: state.plugins.filter((p) => p.id !== id) })),

      togglePlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p),
        })),

      updatePluginSettings: (id, settings) =>
        set((state) => ({
          plugins: state.plugins.map((p) => p.id === id ? { ...p, settings } : p),
        })),

      // ===================================================================
      // Note Actions
      // ===================================================================
      createNote: (note) => {
        const id = `note-${Date.now()}`;
        const newNote: Note = { ...note, id, createdAt: Date.now(), updatedAt: Date.now() };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return id;
      },

      updateNote: (id, partial) =>
        set((state) => ({
          notes: state.notes.map((n) => n.id === id ? { ...n, ...partial, updatedAt: Date.now() } : n),
        })),

      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      createNotesFolder: (name, color) =>
        set((state) => ({
          notesFolders: [...state.notesFolders, { id: `nf-${Date.now()}`, name, color }],
        })),

      deleteNotesFolder: (id) =>
        set((state) => ({ notesFolders: state.notesFolders.filter((f) => f.id !== id) })),

      // ===================================================================
      // Editor Actions
      // ===================================================================
      createEditorFile: (name, language, content) => {
        const id = `file-${Date.now()}`;
        const file: CodeFile = {
          id, name, language, content,
          createdAt: Date.now(), updatedAt: Date.now(), saved: true, tabId: id,
        };
        set((state) => ({
          editorFiles: [...state.editorFiles, file],
          editorTabs: [...state.editorTabs, { id, fileId: id, name, language, modified: false }],
        }));
        return id;
      },

      updateEditorFile: (id, content) =>
        set((state) => ({
          editorFiles: state.editorFiles.map((f) => f.id === id ? { ...f, content, updatedAt: Date.now(), saved: false } : f),
          editorTabs: state.editorTabs.map((t) => t.fileId === id ? { ...t, modified: true } : t),
        })),

      deleteEditorFile: (id) =>
        set((state) => ({
          editorFiles: state.editorFiles.filter((f) => f.id !== id),
          editorTabs: state.editorTabs.filter((t) => t.fileId !== id),
        })),

      openEditorTab: (fileId) =>
        set((state) => {
          if (state.editorTabs.find((t) => t.fileId === fileId)) return state;
          const file = state.editorFiles.find((f) => f.id === fileId);
          if (!file) return state;
          return {
            editorTabs: [...state.editorTabs, {
              id: `tab-${Date.now()}`, fileId, name: file.name, language: file.language, modified: false,
            }],
          };
        }),

      closeEditorTab: (tabId) =>
        set((state) => ({ editorTabs: state.editorTabs.filter((t) => t.id !== tabId) })),

      // ===================================================================
      // Terminal Actions
      // ===================================================================
      createTerminalSession: (name) => {
        const id = `term-${Date.now()}`;
        const session: TerminalSession = { id, name, history: [], createdAt: Date.now(), cwd: '~', env: {} };
        set((state) => ({ terminalSessions: [...state.terminalSessions, session] }));
        return id;
      },

      addTerminalLine: (sessionId, line) => {
        const newLine: TerminalLine = { ...line, id: `tl-${Date.now()}`, timestamp: Date.now() };
        set((state) => ({
          terminalSessions: state.terminalSessions.map((s) =>
            s.id === sessionId ? { ...s, history: [...s.history, newLine] } : s
          ),
          commandHistory: line.type === 'input'
            ? [line.content, ...state.commandHistory.filter((c) => c !== line.content)].slice(0, 100)
            : state.commandHistory,
        }));
      },

      deleteTerminalSession: (id) =>
        set((state) => ({ terminalSessions: state.terminalSessions.filter((s) => s.id !== id) })),

      clearTerminalSession: (id) =>
        set((state) => ({
          terminalSessions: state.terminalSessions.map((s) => s.id === id ? { ...s, history: [] } : s),
        })),

      updateTerminalCwd: (sessionId, cwd) =>
        set((state) => ({
          terminalSessions: state.terminalSessions.map((s) => s.id === sessionId ? { ...s, cwd } : s),
        })),

      // ===================================================================
      // Integration Actions
      // ===================================================================
      addIntegration: (integration) =>
        set((state) => ({ integrations: [...state.integrations, integration] })),

      removeIntegration: (id) =>
        set((state) => ({ integrations: state.integrations.filter((i) => i.id !== id) })),

      toggleIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id ? { ...i, enabled: !i.enabled, status: !i.enabled ? 'connected' as const : 'disconnected' as const } : i
          ),
        })),

      updateIntegrationSettings: (id, settings) =>
        set((state) => ({
          integrations: state.integrations.map((i) => i.id === id ? { ...i, settings } : i),
        })),

      // ===================================================================
      // Template Actions
      // ===================================================================
      createChatTemplate: (template) =>
        set((state) => ({
          chatTemplates: [...state.chatTemplates, { ...template, id: `tpl-${Date.now()}`, createdAt: Date.now(), usageCount: 0 }],
        })),

      deleteChatTemplate: (id) =>
        set((state) => ({ chatTemplates: state.chatTemplates.filter((t) => t.id !== id) })),

      useChatTemplate: (id) =>
        set((state) => ({
          chatTemplates: state.chatTemplates.map((t) => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t),
        })),

      // ===================================================================
      // Profile Actions
      // ===================================================================
      updateProfile: (partial) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...partial } })),

      unlockAchievement: (achievementId) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            achievements: state.userProfile.achievements.map((a) =>
              a.id === achievementId && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a
            ),
          },
        })),

      addActivityEntry: (entry) =>
        set((state) => ({
          activityLog: [{ ...entry, id: `act-${Date.now()}` }, ...state.activityLog].slice(0, 100),
        })),

      // ===================================================================
      // File Manager Actions
      // ===================================================================
      uploadFile: (file) => {
        const id = `vdfile-${Date.now()}`;
        const newFile: VDFile = { ...file, id, createdAt: Date.now(), updatedAt: Date.now() };
        set((state) => ({ files: [...state.files, newFile] }));
        return id;
      },

      deleteFile: (id) =>
        set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

      renameFile: (id, name) =>
        set((state) => ({
          files: state.files.map((f) => f.id === id ? { ...f, name, updatedAt: Date.now() } : f),
        })),

      toggleFileStar: (id) =>
        set((state) => ({
          files: state.files.map((f) => f.id === id ? { ...f, starred: !f.starred } : f),
        })),

      moveFile: (id, parentId) =>
        set((state) => ({
          files: state.files.map((f) => f.id === id ? { ...f, parentId, updatedAt: Date.now() } : f),
        })),

      // ===================================================================
      // Session Management
      // ===================================================================
      archiveSession: (id) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) => s.id === id ? { ...s, archived: true } : s),
        })),

      unarchiveSession: (id) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) => s.id === id ? { ...s, archived: false } : s),
        })),

      pinSession: (id) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) => s.id === id ? { ...s, pinned: true } : s),
        })),

      unpinSession: (id) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) => s.id === id ? { ...s, pinned: false } : s),
        })),

      duplicateSession: (id) => {
        const session = get().chatSessions.find((s) => s.id === id);
        if (!session) return id;
        const newId = `session-${Date.now()}-dup`;
        const dup: ChatSession = {
          ...session, id: newId, name: `${session.name} (copy)`,
          createdAt: Date.now(), updatedAt: Date.now(),
        };
        set((state) => ({ chatSessions: [dup, ...state.chatSessions] }));
        return newId;
      },

      exportSession: (id, format) => {
        const session = get().chatSessions.find((s) => s.id === id);
        if (!session) return '';
        if (format === 'json') return JSON.stringify(session, null, 2);
        if (format === 'md') {
          return `# ${session.name}\n\n${session.messages.map((m) => `## ${m.role.toUpperCase()}\n\n${m.content}\n`).join('\n---\n\n')}`;
        }
        return session.messages.map((m) => `[${m.role}] ${m.content}`).join('\n\n');
      },

      // ===================================================================
      // Drafts & Quick Replies
      // ===================================================================
      saveDraft: (sessionId, content) =>
        set((state) => ({ draftMessages: { ...state.draftMessages, [sessionId]: content } })),

      clearDraft: (sessionId) =>
        set((state) => {
          const drafts = { ...state.draftMessages };
          delete drafts[sessionId];
          return { draftMessages: drafts };
        }),

      addQuickReply: (reply) =>
        set((state) => ({
          quickReplies: [...state.quickReplies, { ...reply, id: `qr-${Date.now()}` }],
        })),

      deleteQuickReply: (id) =>
        set((state) => ({ quickReplies: state.quickReplies.filter((q) => q.id !== id) })),

      updateQuickReply: (id, partial) =>
        set((state) => ({
          quickReplies: state.quickReplies.map((q) => q.id === id ? { ...q, ...partial } : q),
        })),

      // ===================================================================
      // Dashboard
      // ===================================================================
      setDashboardWidgets: (widgets) => set({ dashboardWidgets: widgets }),

      toggleDashboardWidget: (widgetId) =>
        set((state) => ({
          dashboardWidgets: state.dashboardWidgets.map((w) =>
            w.id === widgetId ? { ...w, enabled: !w.enabled } : w
          ),
        })),

      reorderDashboardWidgets: (widgetIds) =>
        set((state) => ({
          dashboardWidgets: widgetIds.map((id, index) => {
            const widget = state.dashboardWidgets.find((w) => w.id === id);
            return widget ? { ...widget, position: index } : widget!;
          }).filter(Boolean) as DashboardWidget[],
        })),

      // ===================================================================
      // Chat Filters
      // ===================================================================
      updateChatFilters: (partial) =>
        set((state) => ({ chatFilters: { ...state.chatFilters, ...partial } })),

      resetChatFilters: () => set({ chatFilters: defaultChatFilters }),
    }),
    {
      name: 'voicedev-storage',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isStreaming, setStreaming, loadingComplete, setLoadingComplete, ...rest } = state;
        return rest as typeof state;
      },
    }
  )
);
