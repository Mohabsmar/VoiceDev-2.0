// ============================================================================
// VoiceDev 2.0 - Core Type Definitions
// ============================================================================

export type TabId = 'landing' | 'chat' | 'marketplace' | 'providers' | 'settings';

export type ModelCategory = 'LLM' | 'TTS' | 'ASR' | 'Vision' | 'Embedding' | 'Image' | 'Reasoning';

export type MessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  tokenCount?: number;
  model?: string;
  provider?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  provider: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  category: ModelCategory;
  contextWindow: number;
  features: string[];
  releaseDate: string;
  pricing: 'Free' | 'Paid' | 'Freemium';
}

export interface ProviderInfo {
  id: string;
  name: string;
  color: string;
  baseUrl: string;
  authHeader: string;
  envKey: string;
  features: string[];
  website: string;
  models: ModelInfo[];
}

export interface MarketPlaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  version?: string;
  downloads: number;
  stars?: number;
  rating?: number;
  category: string;
  source: string;
  url?: string;
  installed: boolean;
  tags: string[];
}

export interface AppSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  stream: boolean;
  showTokens: boolean;
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: number;
  messageSpacing: 'compact' | 'comfortable';
  codeTheme: 'vs2015' | 'github-dark' | 'monokai' | 'solarized';
}

// ---------------------------------------------------------------------------
// New VoiceDev 2.0 Extended Types
// ---------------------------------------------------------------------------

export interface ChatFolder {
  id: string;
  name: string;
  sessionIds: string[];
  color: string;
}

export interface Collection {
  id: string;
  name: string;
  itemIds: string[];
}

export interface ItemReview {
  text: string;
  author: string;
  date: number;
}

export interface RecentlyViewedItem {
  id: string;
  name: string;
  source: string;
  timestamp: number;
}

export interface PromptLibraryItem {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface NotificationPreferences {
  messageComplete: boolean;
  errors: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface PrivacySettings {
  clearOnExit: boolean;
  anonymousUsage: boolean;
  dataRetention: number;
}

export interface PerformanceSettings {
  animations: boolean;
  particles: boolean;
  messageLoadLimit: number;
  lazyLoading: boolean;
}

export interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  providerBreakdown: Record<string, number>;
}

export interface VoiceDevStore {
  // ── Core State ──
  currentTab: TabId;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  apiKeys: Record<string, string>;
  settings: AppSettings;
  installedItems: string[];
  sidebarOpen: boolean;
  setupComplete: boolean;
  userName: string;
  isStreaming: boolean;

  // ── Message Reactions ──
  messageReactions: Record<string, Record<string, number>>;

  // ── Message Bookmarks ──
  bookmarkedMessages: string[];

  // ── Chat Folders ──
  chatFolders: ChatFolder[];

  // ── Marketplace Collections ──
  collections: Collection[];

  // ── Item Ratings ──
  itemRatings: Record<string, number>;

  // ── Item Reviews ──
  itemReviews: Record<string, ItemReview[]>;

  // ── Favorites ──
  favoriteModels: string[];
  favoriteItems: string[];

  // ── Recently Viewed ──
  recentlyViewed: RecentlyViewedItem[];

  // ── Search History ──
  searchHistory: string[];

  // ── Custom Model Aliases ──
  modelAliases: Record<string, string>;

  // ── Custom Model Tags ──
  modelTags: Record<string, string[]>;

  // ── Custom CSS ──
  customCSS: string;

  // ── System Prompt Library ──
  promptLibrary: PromptLibraryItem[];

  // ── Chat Background ──
  chatBackground: string;

  // ── Notification Preferences ──
  notifications: NotificationPreferences;

  // ── Privacy Settings ──
  privacy: PrivacySettings;

  // ── Performance Settings ──
  performance: PerformanceSettings;

  // ── Usage Stats ──
  usageStats: UsageStats;

  // ── Backup ──
  lastBackup: number;
  autoBackupInterval: number;

  // ── View Preferences ──
  marketplaceView: 'grid' | 'list';

  // ── Keyboard Shortcuts Customization ──
  customShortcuts: Record<string, string>;

  // ── Sidebar Collapsed ──
  sidebarCollapsed: boolean;

  // ── Nav Tab Order ──
  navTabOrder: TabId[];

  // ── Language ──
  language: string;

  // ── Loading Complete ──
  loadingComplete: boolean;

  // ===========================================================================
  // Core Actions
  // ===========================================================================
  setCurrentTab: (tab: TabId) => void;
  createSession: (provider?: string, model?: string) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  setCurrentSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, content: string) => void;
  clearMessages: (sessionId: string) => void;
  setApiKey: (providerId: string, key: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleInstall: (itemId: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setUserName: (name: string) => void;
  setSetupComplete: (complete: boolean) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  clearAllData: () => void;

  // ===========================================================================
  // New Actions – Reactions & Bookmarks
  // ===========================================================================
  toggleReaction: (messageId: string, emoji: string) => void;
  toggleBookmark: (messageId: string) => void;

  // ===========================================================================
  // New Actions – Chat Folders
  // ===========================================================================
  createFolder: (name: string, color: string) => void;
  deleteFolder: (id: string) => void;
  moveSessionToFolder: (sessionId: string, folderId: string) => void;

  // ===========================================================================
  // New Actions – Collections
  // ===========================================================================
  createCollection: (name: string) => void;
  addToCollection: (collectionId: string, itemId: string) => void;
  removeFromCollection: (collectionId: string, itemId: string) => void;

  // ===========================================================================
  // New Actions – Ratings & Reviews
  // ===========================================================================
  rateItem: (itemId: string, rating: number) => void;
  addReview: (itemId: string, text: string) => void;

  // ===========================================================================
  // New Actions – Favorites
  // ===========================================================================
  toggleFavoriteModel: (modelId: string) => void;
  toggleFavoriteItem: (itemId: string) => void;

  // ===========================================================================
  // New Actions – Recently Viewed & Search
  // ===========================================================================
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // ===========================================================================
  // New Actions – Model Aliases & Tags
  // ===========================================================================
  setModelAlias: (alias: string, providerModel: string) => void;
  addModelTag: (modelId: string, tag: string) => void;
  removeModelTag: (modelId: string, tag: string) => void;

  // ===========================================================================
  // New Actions – Customization
  // ===========================================================================
  setCustomCSS: (css: string) => void;
  savePromptToLibrary: (prompt: Omit<PromptLibraryItem, 'id'>) => void;
  deletePromptFromLibrary: (id: string) => void;
  setChatBackground: (bg: string) => void;

  // ===========================================================================
  // New Actions – Settings
  // ===========================================================================
  updateNotificationSettings: (partial: Partial<NotificationPreferences>) => void;
  updatePrivacySettings: (partial: Partial<PrivacySettings>) => void;
  updatePerformanceSettings: (partial: Partial<PerformanceSettings>) => void;

  // ===========================================================================
  // New Actions – Usage & Backup
  // ===========================================================================
  recordUsage: (providerId: string, tokens: number) => void;
  triggerBackup: () => void;

  // ===========================================================================
  // New Actions – View & Navigation
  // ===========================================================================
  setMarketplaceView: (view: 'grid' | 'list') => void;
  setCustomShortcut: (action: string, key: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNavTabOrder: (order: TabId[]) => void;
  setLanguage: (lang: string) => void;
  setLoadingComplete: (complete: boolean) => void;
}

export interface BuiltinTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface BuiltinSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}
