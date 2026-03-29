// ============================================================================
// VoiceDev 2.0 - Core Type Definitions (1000+ Features)
// ============================================================================

export type TabId =
  | 'landing'
  | 'chat'
  | 'marketplace'
  | 'providers'
  | 'settings'
  | 'dashboard'
  | 'history'
  | 'workflows'
  | 'prompts'
  | 'arena'
  | 'plugins'
  | 'notes'
  | 'files'
  | 'editor'
  | 'terminal'
  | 'profile'
  | 'integrations'
  | 'templates';

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
  pinned?: boolean;
  bookmarked?: boolean;
  reactions?: Record<string, number>;
  edited?: boolean;
  parentMessageId?: string;
  attachments?: MessageAttachment[];
  metadata?: Record<string, unknown>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'code' | 'link';
  url?: string;
  content?: string;
  size?: number;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  provider: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  folderId?: string;
  tags?: string[];
  summary?: string;
  systemPrompt?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  category: ModelCategory;
  contextWindow: number;
  features: string[];
  releaseDate: string;
  pricing: 'Free' | 'Paid' | 'Freemium';
  description?: string;
  benchmarks?: ModelBenchmark[];
}

export interface ModelBenchmark {
  name: string;
  score: number;
  maxScore?: number;
  category: string;
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
  status?: 'active' | 'beta' | 'deprecated';
  latency?: number;
  uptime?: number;
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
  icon?: string;
  verified?: boolean;
  lastUpdated?: string;
  dependencies?: string[];
  license?: string;
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
  messageSpacing: 'compact' | 'comfortable' | 'spacious';
  codeTheme: 'vs2015' | 'github-dark' | 'monokai' | 'solarized' | 'dracula' | 'one-dark';
  sendOnEnter: boolean;
  showTimestamps: boolean;
  showModelInfo: boolean;
  showTokenCount: boolean;
  compactMode: boolean;
  soundEnabled: boolean;
  notificationSound: string;
  autoSave: boolean;
  autoSaveInterval: number;
  markdownRendering: boolean;
  codeLineNumbers: boolean;
  messageBubbleStyle: 'modern' | 'classic' | 'minimal' | 'bubble';
  avatarStyle: 'initials' | 'model-icon' | 'provider-icon' | 'hidden';
  sidebarPosition: 'left' | 'right';
  chatWidth: 'narrow' | 'medium' | 'wide' | 'full';
  language: string;
}

// ---------------------------------------------------------------------------
// Dashboard & Analytics Types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalProviders: number;
  avgResponseTime: number;
  favoriteProvider: string;
  mostUsedModel: string;
  activeStreak: number;
  costEstimate: number;
}

export interface UsageChartPoint {
  date: string;
  tokens: number;
  calls: number;
  cost: number;
}

export interface ProviderUsageBreakdown {
  providerId: string;
  providerName: string;
  calls: number;
  tokens: number;
  cost: number;
  avgLatency: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Workflow Types
// ---------------------------------------------------------------------------

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt: number;
  lastRun?: number;
  runCount: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  tags?: string[];
  icon?: string;
}

export interface WorkflowNode {
  id: string;
  type: 'llm' | 'condition' | 'http' | 'transform' | 'output' | 'input' | 'delay' | 'loop' | 'code' | 'database';
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

// ---------------------------------------------------------------------------
// Prompt Library Types
// ---------------------------------------------------------------------------

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  author: string;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  rating: number;
  variables?: PromptVariable[];
  version?: number;
}

export interface PromptVariable {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  default?: string;
  options?: string[];
  required?: boolean;
}

// ---------------------------------------------------------------------------
// Model Arena Types
// ---------------------------------------------------------------------------

export interface ArenaBattle {
  id: string;
  modelA: string;
  modelB: string;
  prompt: string;
  responseA: string;
  responseB: string;
  winner: 'A' | 'B' | 'tie' | null;
  votes: { a: number; b: number; tie: number };
  createdAt: number;
  category: string;
}

// ---------------------------------------------------------------------------
// Plugin Types
// ---------------------------------------------------------------------------

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  permissions: string[];
  hooks: string[];
  createdAt: number;
  icon?: string;
}

// ---------------------------------------------------------------------------
// Notes Types
// ---------------------------------------------------------------------------

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  folderId?: string;
  tags?: string[];
  color?: string;
  pinned?: boolean;
  archived?: boolean;
  type: 'note' | 'snippet' | 'checklist' | 'markdown';
  checklistItems?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface NotesFolder {
  id: string;
  name: string;
  color: string;
  parentId?: string;
}

// ---------------------------------------------------------------------------
// File Manager Types
// ---------------------------------------------------------------------------

export interface VDFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  parentId: string | null;
  content?: string;
  tags?: string[];
  starred?: boolean;
}

// ---------------------------------------------------------------------------
// Code Editor Types
// ---------------------------------------------------------------------------

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  saved: boolean;
  tabId: string;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  language: string;
  modified: boolean;
  cursorPosition?: { line: number; column: number };
}

// ---------------------------------------------------------------------------
// Terminal Types
// ---------------------------------------------------------------------------

export interface TerminalSession {
  id: string;
  name: string;
  history: TerminalLine[];
  createdAt: number;
  cwd: string;
  env: Record<string, string>;
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'system';
  content: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Integration Types
// ---------------------------------------------------------------------------

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  settings: Record<string, unknown>;
  lastSync?: number;
  category: string;
  features: string[];
}

// ---------------------------------------------------------------------------
// Template Types
// ---------------------------------------------------------------------------

export interface ChatTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  category: string;
  tags: string[];
  isPublic: boolean;
  author: string;
  usageCount: number;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Profile Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: number;
  preferences: Record<string, unknown>;
  stats: {
    totalSessions: number;
    totalMessages: number;
    totalTokensUsed: number;
    streakDays: number;
    longestStreak: number;
  };
  achievements: Achievement[];
  activityLog: ActivityEntry[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ActivityEntry {
  id: string;
  type: 'chat' | 'marketplace' | 'settings' | 'achievement' | 'integration' | 'workflow';
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Existing Extended Types
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
  description?: string;
  icon?: string;
  isPublic?: boolean;
}

export interface ItemReview {
  text: string;
  author: string;
  date: number;
  rating?: number;
}

export interface RecentlyViewedItem {
  id: string;
  name: string;
  source: string;
  timestamp: number;
  thumbnail?: string;
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
  mentions: boolean;
  updates: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  clearOnExit: boolean;
  anonymousUsage: boolean;
  dataRetention: number;
  shareUsageStats: boolean;
  enableTelemetry: boolean;
}

export interface PerformanceSettings {
  animations: boolean;
  particles: boolean;
  messageLoadLimit: number;
  lazyLoading: boolean;
  hardwareAcceleration: boolean;
  cacheSize: number;
}

export interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  providerBreakdown: Record<string, number>;
  dailyUsage: Record<string, number>;
  weeklyUsage: Record<string, number>;
  monthlyCost: number;
  avgLatency: number;
}

// ---------------------------------------------------------------------------
// Store Types
// ---------------------------------------------------------------------------

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
  marketplaceView: 'grid' | 'list' | 'compact';

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

  // ── Workflows ──
  workflows: Workflow[];

  // ── Prompt Templates ──
  promptTemplates: PromptTemplate[];

  // ── Arena Battles ──
  arenaBattles: ArenaBattle[];

  // ── Plugins ──
  plugins: Plugin[];

  // ── Notes ──
  notes: Note[];
  notesFolders: NotesFolder[];

  // ── Code Editor ──
  editorFiles: CodeFile[];
  editorTabs: EditorTab[];

  // ── Terminal Sessions ──
  terminalSessions: TerminalSession[];

  // ── Integrations ──
  integrations: Integration[];

  // ── Chat Templates ──
  chatTemplates: ChatTemplate[];

  // ── User Profile ──
  userProfile: UserProfile;

  // ── Files ──
  files: VDFile[];

  // ── Activity Log ──
  activityLog: ActivityEntry[];

  // ── Pinned Messages ──
  pinnedMessages: string[];

  // ── Draft Messages ──
  draftMessages: Record<string, string>;

  // ── Scheduled Messages ──
  scheduledMessages: ScheduledMessage[];

  // ── Quick Replies ──
  quickReplies: QuickReply[];

  // ── Chat Filters ──
  chatFilters: ChatFilters;

  // ── Provider Latencies ──
  providerLatencies: Record<string, number[]>;

  // ── Theme Customization ──
  themeOverrides: Record<string, string>;

  // ── Dashboard Widgets ──
  dashboardWidgets: DashboardWidget[];

  // ── Command History ──
  commandHistory: string[];

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
  deleteMessage: (sessionId: string, messageId: string) => void;
  pinMessage: (sessionId: string, messageId: string) => void;
  unpinMessage: (sessionId: string, messageId: string) => void;
  clearMessages: (sessionId: string) => void;
  setApiKey: (providerId: string, key: string) => void;
  removeApiKey: (providerId: string) => void;
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
  // Reactions & Bookmarks
  // ===========================================================================
  toggleReaction: (messageId: string, emoji: string) => void;
  toggleBookmark: (messageId: string) => void;

  // ===========================================================================
  // Chat Folders
  // ===========================================================================
  createFolder: (name: string, color: string) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  moveSessionToFolder: (sessionId: string, folderId: string) => void;

  // ===========================================================================
  // Collections
  // ===========================================================================
  createCollection: (name: string, description?: string) => void;
  addToCollection: (collectionId: string, itemId: string) => void;
  removeFromCollection: (collectionId: string, itemId: string) => void;
  deleteCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, name: string) => void;

  // ===========================================================================
  // Ratings & Reviews
  // ===========================================================================
  rateItem: (itemId: string, rating: number) => void;
  addReview: (itemId: string, text: string, rating?: number) => void;
  deleteReview: (itemId: string, index: number) => void;

  // ===========================================================================
  // Favorites
  // ===========================================================================
  toggleFavoriteModel: (modelId: string) => void;
  toggleFavoriteItem: (itemId: string) => void;

  // ===========================================================================
  // Recently Viewed & Search
  // ===========================================================================
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  // ===========================================================================
  // Model Aliases & Tags
  // ===========================================================================
  setModelAlias: (alias: string, providerModel: string) => void;
  removeModelAlias: (alias: string) => void;
  addModelTag: (modelId: string, tag: string) => void;
  removeModelTag: (modelId: string, tag: string) => void;

  // ===========================================================================
  // Customization
  // ===========================================================================
  setCustomCSS: (css: string) => void;
  savePromptToLibrary: (prompt: Omit<PromptLibraryItem, 'id'>) => void;
  deletePromptFromLibrary: (id: string) => void;
  setChatBackground: (bg: string) => void;

  // ===========================================================================
  // Settings
  // ===========================================================================
  updateNotificationSettings: (partial: Partial<NotificationPreferences>) => void;
  updatePrivacySettings: (partial: Partial<PrivacySettings>) => void;
  updatePerformanceSettings: (partial: Partial<PerformanceSettings>) => void;

  // ===========================================================================
  // Usage & Backup
  // ===========================================================================
  recordUsage: (providerId: string, tokens: number, latency?: number) => void;
  triggerBackup: () => void;

  // ===========================================================================
  // View & Navigation
  // ===========================================================================
  setMarketplaceView: (view: 'grid' | 'list' | 'compact') => void;
  setCustomShortcut: (action: string, key: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNavTabOrder: (order: TabId[]) => void;
  setLanguage: (lang: string) => void;
  setLoadingComplete: (complete: boolean) => void;

  // ===========================================================================
  // Workflow Actions
  // ===========================================================================
  createWorkflow: (name: string, description: string) => string;
  updateWorkflow: (id: string, partial: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  runWorkflow: (id: string) => void;

  // ===========================================================================
  // Prompt Template Actions
  // ===========================================================================
  createPromptTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>) => string;
  updatePromptTemplate: (id: string, partial: Partial<PromptTemplate>) => void;
  deletePromptTemplate: (id: string) => void;

  // ===========================================================================
  // Arena Actions
  // ===========================================================================
  createArenaBattle: (modelA: string, modelB: string, prompt: string, category: string) => string;
  voteArenaBattle: (id: string, vote: 'A' | 'B' | 'tie') => void;

  // ===========================================================================
  // Plugin Actions
  // ===========================================================================
  installPlugin: (plugin: Plugin) => void;
  uninstallPlugin: (id: string) => void;
  togglePlugin: (id: string) => void;
  updatePluginSettings: (id: string, settings: Record<string, unknown>) => void;

  // ===========================================================================
  // Note Actions
  // ===========================================================================
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, partial: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  createNotesFolder: (name: string, color: string) => void;
  deleteNotesFolder: (id: string) => void;

  // ===========================================================================
  // Editor Actions
  // ===========================================================================
  createEditorFile: (name: string, language: string, content: string) => string;
  updateEditorFile: (id: string, content: string) => void;
  deleteEditorFile: (id: string) => void;
  openEditorTab: (fileId: string) => void;
  closeEditorTab: (tabId: string) => void;

  // ===========================================================================
  // Terminal Actions
  // ===========================================================================
  createTerminalSession: (name: string) => string;
  addTerminalLine: (sessionId: string, line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  deleteTerminalSession: (id: string) => void;
  clearTerminalSession: (id: string) => void;
  updateTerminalCwd: (sessionId: string, cwd: string) => void;

  // ===========================================================================
  // Integration Actions
  // ===========================================================================
  addIntegration: (integration: Integration) => void;
  removeIntegration: (id: string) => void;
  toggleIntegration: (id: string) => void;
  updateIntegrationSettings: (id: string, settings: Record<string, unknown>) => void;

  // ===========================================================================
  // Template Actions
  // ===========================================================================
  createChatTemplate: (template: Omit<ChatTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  deleteChatTemplate: (id: string) => void;
  useChatTemplate: (id: string) => void;

  // ===========================================================================
  // Profile Actions
  // ===========================================================================
  updateProfile: (partial: Partial<UserProfile>) => void;
  unlockAchievement: (achievementId: string) => void;
  addActivityEntry: (entry: Omit<ActivityEntry, 'id'>) => void;

  // ===========================================================================
  // File Manager Actions
  // ===========================================================================
  uploadFile: (file: Omit<VDFile, 'id' | 'createdAt' | 'updatedAt'>) => string;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  toggleFileStar: (id: string) => void;
  moveFile: (id: string, parentId: string | null) => void;

  // ===========================================================================
  // Session Management
  // ===========================================================================
  archiveSession: (id: string) => void;
  unarchiveSession: (id: string) => void;
  pinSession: (id: string) => void;
  unpinSession: (id: string) => void;
  duplicateSession: (id: string) => string;
  exportSession: (id: string, format: 'json' | 'md' | 'txt' | 'csv') => string;

  // ===========================================================================
  // Draft & Quick Replies
  // ===========================================================================
  saveDraft: (sessionId: string, content: string) => void;
  clearDraft: (sessionId: string) => void;
  addQuickReply: (reply: Omit<QuickReply, 'id'>) => void;
  deleteQuickReply: (id: string) => void;
  updateQuickReply: (id: string, partial: Partial<QuickReply>) => void;

  // ===========================================================================
  // Dashboard
  // ===========================================================================
  setDashboardWidgets: (widgets: DashboardWidget[]) => void;
  toggleDashboardWidget: (widgetId: string) => void;
  reorderDashboardWidgets: (widgetIds: string[]) => void;

  // ===========================================================================
  // Chat Filters
  // ===========================================================================
  updateChatFilters: (partial: Partial<ChatFilters>) => void;
  resetChatFilters: () => void;
}

// ---------------------------------------------------------------------------
// Additional Helper Types
// ---------------------------------------------------------------------------

export interface ScheduledMessage {
  id: string;
  sessionId: string;
  content: string;
  scheduledFor: number;
  sent: boolean;
  createdAt: number;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  category?: string;
  usageCount: number;
}

export interface ChatFilters {
  search: string;
  provider: string;
  model: string;
  dateRange: { start: number; end: number } | null;
  hasAttachments: boolean;
  isPinned: boolean;
  sortBy: 'newest' | 'oldest' | 'most-messages' | 'least-messages' | 'name';
  tags: string[];
}

export interface DashboardWidget {
  id: string;
  type: 'usage-chart' | 'token-counter' | 'provider-pie' | 'recent-activity' | 'quick-stats' | 'model-leaderboard' | 'cost-tracker' | 'streak-counter' | 'achievement-showcase' | 'favorite-prompts';
  position: number;
  enabled: boolean;
  size: 'small' | 'medium' | 'large';
  config?: Record<string, unknown>;
}

export interface BuiltinTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  enabled?: boolean;
}

export interface BuiltinSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  enabled?: boolean;
}
