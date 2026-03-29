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

export interface VoiceDevStore {
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
