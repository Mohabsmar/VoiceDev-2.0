// ============================================================================
// VoiceDev 2.0 - Zustand Store
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  VoiceDevStore,
  ChatSession,
  Message,
  NotificationPreferences,
  PrivacySettings,
  PerformanceSettings,
  UsageStats,
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
};

const defaultNotifications: NotificationPreferences = {
  messageComplete: true,
  errors: true,
  sound: false,
  desktop: false,
};

const defaultPrivacy: PrivacySettings = {
  clearOnExit: false,
  anonymousUsage: true,
  dataRetention: 90,
};

const defaultPerformance: PerformanceSettings = {
  animations: true,
  particles: true,
  messageLoadLimit: 100,
  lazyLoading: true,
};

const defaultUsage: UsageStats = {
  totalCalls: 0,
  totalTokens: 0,
  providerBreakdown: {},
};

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

      // ── Message Reactions ──
      messageReactions: {},

      // ── Message Bookmarks ──
      bookmarkedMessages: [],

      // ── Chat Folders ──
      chatFolders: [],

      // ── Marketplace Collections ──
      collections: [],

      // ── Item Ratings ──
      itemRatings: {},

      // ── Item Reviews ──
      itemReviews: {},

      // ── Favorites ──
      favoriteModels: [],
      favoriteItems: [],

      // ── Recently Viewed ──
      recentlyViewed: [],

      // ── Search History ──
      searchHistory: [],

      // ── Custom Model Aliases ──
      modelAliases: {},

      // ── Custom Model Tags ──
      modelTags: {},

      // ── Custom CSS ──
      customCSS: '',

      // ── System Prompt Library ──
      promptLibrary: [],

      // ── Chat Background ──
      chatBackground: '',

      // ── Notification Preferences ──
      notifications: defaultNotifications,

      // ── Privacy Settings ──
      privacy: defaultPrivacy,

      // ── Performance Settings ──
      performance: defaultPerformance,

      // ── Usage Stats ──
      usageStats: defaultUsage,

      // ── Backup ──
      lastBackup: 0,
      autoBackupInterval: 5,

      // ── View Preferences ──
      marketplaceView: 'grid' as const,

      // ── Keyboard Shortcuts Customization ──
      customShortcuts: {},

      // ── Sidebar Collapsed ──
      sidebarCollapsed: false,

      // ── Nav Tab Order ──
      navTabOrder: ['landing', 'chat', 'marketplace', 'providers', 'settings'],

      // ── Language ──
      language: 'en',

      // ── Loading Complete ──
      loadingComplete: false,

      // ===================================================================
      // Core Actions
      // ===================================================================
      setCurrentTab: (tab) => set({ currentTab: tab }),

      createSession: (provider = 'openai', model = 'gpt-4o') => {
        const id = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const session: ChatSession = {
          id,
          name: 'New Chat',
          messages: [],
          provider,
          model,
          createdAt: Date.now(),
          updatedAt: Date.now(),
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
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
              : s
          ),
        })),

      clearMessages: (sessionId) =>
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === sessionId ? { ...s, messages: [], updatedAt: Date.now() } : s
          ),
        })),

      setApiKey: (providerId, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [providerId]: key },
        })),

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

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
        return JSON.stringify(
          {
            chatSessions: state.chatSessions,
            apiKeys: state.apiKeys,
            settings: state.settings,
            installedItems: state.installedItems,
            userName: state.userName,
            setupComplete: state.setupComplete,
            favoriteModels: state.favoriteModels,
            modelAliases: state.modelAliases,
            modelTags: state.modelTags,
            customCSS: state.customCSS,
            promptLibrary: state.promptLibrary,
            chatBackground: state.chatBackground,
            notifications: state.notifications,
            privacy: state.privacy,
            performance: state.performance,
            usageStats: state.usageStats,
          },
          null,
          2
        );
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set({
            chatSessions: data.chatSessions || [],
            apiKeys: data.apiKeys || {},
            settings: { ...defaultSettings, ...data.settings },
            installedItems: data.installedItems || [],
            userName: data.userName || '',
            setupComplete: data.setupComplete || false,
            favoriteModels: data.favoriteModels || [],
            modelAliases: data.modelAliases || {},
            modelTags: data.modelTags || {},
            customCSS: data.customCSS || '',
            promptLibrary: data.promptLibrary || [],
            chatBackground: data.chatBackground || '',
            notifications: { ...defaultNotifications, ...data.notifications },
            privacy: { ...defaultPrivacy, ...data.privacy },
            performance: { ...defaultPerformance, ...data.performance },
            usageStats: { ...defaultUsage, ...data.usageStats },
          });
          return true;
        } catch {
          return false;
        }
      },

      clearAllData: () =>
        set({
          chatSessions: [],
          currentSessionId: null,
          apiKeys: {},
          settings: defaultSettings,
          installedItems: [],
          setupComplete: false,
          userName: '',
          favoriteModels: [],
          modelAliases: {},
          modelTags: {},
          customCSS: '',
          promptLibrary: [],
          chatBackground: '',
          notifications: defaultNotifications,
          privacy: defaultPrivacy,
          performance: defaultPerformance,
          usageStats: defaultUsage,
        }),

      // ===================================================================
      // Reactions & Bookmarks
      // ===================================================================
      toggleReaction: (messageId, emoji) =>
        set((state) => {
          const msgReactions = { ...state.messageReactions };
          const current = msgReactions[messageId] || {};
          const count = (current[emoji] || 0);
          if (count > 0) {
            if (count === 1) {
              delete current[emoji];
            } else {
              current[emoji] = count - 1;
            }
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
          chatFolders: [
            ...state.chatFolders,
            { id: `folder-${Date.now()}`, name, sessionIds: [], color },
          ],
        })),

      deleteFolder: (id) =>
        set((state) => ({
          chatFolders: state.chatFolders.filter((f) => f.id !== id),
        })),

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
      createCollection: (name) =>
        set((state) => ({
          collections: [
            ...state.collections,
            { id: `coll-${Date.now()}`, name, itemIds: [] },
          ],
        })),

      addToCollection: (collectionId, itemId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.itemIds.includes(itemId)
              ? { ...c, itemIds: [...c.itemIds, itemId] }
              : c
          ),
        })),

      removeFromCollection: (collectionId, itemId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, itemIds: c.itemIds.filter((id) => id !== itemId) }
              : c
          ),
        })),

      // ===================================================================
      // Ratings & Reviews
      // ===================================================================
      rateItem: (itemId, rating) =>
        set((state) => ({
          itemRatings: { ...state.itemRatings, [itemId]: rating },
        })),

      addReview: (itemId, text) =>
        set((state) => ({
          itemReviews: {
            ...state.itemReviews,
            [itemId]: [
              ...(state.itemReviews[itemId] || []),
              { text, author: state.userName || 'Anonymous', date: Date.now() },
            ],
          },
        })),

      // ===================================================================
      // Favorites
      // ===================================================================
      toggleFavoriteModel: (modelId) =>
        set((state) => ({
          favoriteModels: state.favoriteModels.includes(modelId)
            ? state.favoriteModels.filter((id) => id !== modelId)
            : [...state.favoriteModels, modelId],
        })),

      toggleFavoriteItem: (itemId) =>
        set((state) => ({
          favoriteItems: state.favoriteItems.includes(itemId)
            ? state.favoriteItems.filter((id) => id !== itemId)
            : [...state.favoriteItems, itemId],
        })),

      // ===================================================================
      // Recently Viewed & Search
      // ===================================================================
      addRecentlyViewed: (item) =>
        set((state) => ({
          recentlyViewed: [
            item,
            ...state.recentlyViewed.filter((rv) => rv.id !== item.id),
          ].slice(0, 20),
        })),

      addSearchHistory: (query) =>
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 10),
        })),

      clearSearchHistory: () => set({ searchHistory: [] }),

      // ===================================================================
      // Model Aliases & Tags
      // ===================================================================
      setModelAlias: (alias, providerModel) =>
        set((state) => ({
          modelAliases: { ...state.modelAliases, [alias]: providerModel },
        })),

      addModelTag: (modelId, tag) =>
        set((state) => {
          const current = state.modelTags[modelId] || [];
          if (current.includes(tag)) return state;
          return {
            modelTags: { ...state.modelTags, [modelId]: [...current, tag] },
          };
        }),

      removeModelTag: (modelId, tag) =>
        set((state) => ({
          modelTags: {
            ...state.modelTags,
            [modelId]: (state.modelTags[modelId] || []).filter((t) => t !== tag),
          },
        })),

      // ===================================================================
      // Customization
      // ===================================================================
      setCustomCSS: (css) => set({ customCSS: css }),

      savePromptToLibrary: (prompt) =>
        set((state) => ({
          promptLibrary: [
            ...state.promptLibrary,
            { ...prompt, id: `prompt-${Date.now()}` },
          ],
        })),

      deletePromptFromLibrary: (id) =>
        set((state) => ({
          promptLibrary: state.promptLibrary.filter((p) => p.id !== id),
        })),

      setChatBackground: (bg) => set({ chatBackground: bg }),

      // ===================================================================
      // Settings
      // ===================================================================
      updateNotificationSettings: (partial) =>
        set((state) => ({
          notifications: { ...state.notifications, ...partial },
        })),

      updatePrivacySettings: (partial) =>
        set((state) => ({
          privacy: { ...state.privacy, ...partial },
        })),

      updatePerformanceSettings: (partial) =>
        set((state) => ({
          performance: { ...state.performance, ...partial },
        })),

      // ===================================================================
      // Usage & Backup
      // ===================================================================
      recordUsage: (providerId, tokens) =>
        set((state) => ({
          usageStats: {
            totalCalls: state.usageStats.totalCalls + 1,
            totalTokens: state.usageStats.totalTokens + tokens,
            providerBreakdown: {
              ...state.usageStats.providerBreakdown,
              [providerId]: (state.usageStats.providerBreakdown[providerId] || 0) + tokens,
            },
          },
        })),

      triggerBackup: () => set({ lastBackup: Date.now() }),

      // ===================================================================
      // View & Navigation
      // ===================================================================
      setMarketplaceView: (view) => set({ marketplaceView: view }),
      setCustomShortcut: (action, key) =>
        set((state) => ({
          customShortcuts: { ...state.customShortcuts, [action]: key },
        })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setNavTabOrder: (order) => set({ navTabOrder: order }),
      setLanguage: (lang) => set({ language: lang }),
      setLoadingComplete: (complete) => set({ loadingComplete: complete }),
    }),
    {
      name: 'voicedev-storage',
    }
  )
);
