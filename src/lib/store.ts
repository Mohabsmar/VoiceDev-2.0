// ============================================================================
// VoiceDev 2.0 - Zustand Store
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, VoiceDevStore, ChatSession, Message } from './types';

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

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useVoiceDevStore = create<VoiceDevStore>()(
  persist(
    (set, get) => ({
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
        }),
    }),
    {
      name: 'voicedev-storage',
    }
  )
);
