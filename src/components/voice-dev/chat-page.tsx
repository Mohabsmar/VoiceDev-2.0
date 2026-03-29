'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Plus,
  Send,
  Square,
  Trash2,
  Settings,
  Menu,
  Sparkles,
  Copy,
  Check,
  MoreHorizontal,
  Edit3,
  ChevronDown,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import type { TabId } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const SUGGESTED_PROMPTS = [
  'Explain quantum computing simply',
  'Write a Python web scraper',
  'Help me debug my React app',
  'Create a marketing email',
];

// ---------------------------------------------------------------------------
// Code Block Component
// ---------------------------------------------------------------------------
function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg overflow-hidden my-2 border border-border/50">
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.8125rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message Bubble
// ---------------------------------------------------------------------------
function MessageBubble({
  message,
  showTokens,
  isLatestInGroup,
  isStreaming,
}: {
  message: { id: string; role: string; content: string; timestamp: number; tokenCount?: number; model?: string };
  showTokens: boolean;
  isLatestInGroup: boolean;
  isStreaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center px-4 my-2"
      >
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-red-400 max-w-xl">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4 my-1`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative group max-w-[85%] md:max-w-[75%] ${
          isUser
            ? 'bg-violet-600 text-white rounded-2xl rounded-tr-sm'
            : 'bg-card border rounded-2xl rounded-tl-sm'
        } px-4 py-2.5`}
      >
        {/* Timestamp + copy on hover */}
        <div
          className={`absolute -top-6 text-[10px] text-muted-foreground flex items-center gap-2 ${
            isUser ? 'right-4' : 'left-4'
          } ${hovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>

        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className={`text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_pre]:p-0 [&_pre]:bg-transparent [&_pre]:border-0`}>
            {isStreaming && !message.content ? (
              <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                <span>Thinking</span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                >
                  .
                </motion.span>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !className;
                    if (isInline) {
                      return (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                          {...rest}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <CodeBlock language={match?.[1] || ''}>
                        {String(children).replace(/\n$/, '')}
                      </CodeBlock>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Token count badge */}
        {showTokens && message.tokenCount && !isUser && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {message.tokenCount} tokens
            </span>
            {message.model && (
              <span className="text-[10px] text-muted-foreground/60">
                {message.model}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar Content (shared between desktop + mobile Sheet)
// ---------------------------------------------------------------------------
function SidebarContent({
  onNewChat,
  onSessionSelect,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
}: {
  onNewChat: () => void;
  onSessionSelect: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  onOpenSettings: () => void;
}) {
  const {
    chatSessions,
    currentSessionId,
    settings,
  } = useVoiceDevStore();

  const sortedSessions = [...chatSessions].sort((a, b) => b.updatedAt - a.updatedAt);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleRenameSubmit = () => {
    if (editingId && editName.trim()) {
      onRenameSession(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const getProviderInfo = (providerId: string) => {
    return PROVIDERS.find((p) => p.id === providerId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg tracking-tight">VoiceDev</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={onOpenSettings}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedSessions.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          )}
          {sortedSessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const provider = getProviderInfo(session.provider);
            const lastMessage = session.messages[session.messages.length - 1];

            return (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                onDoubleClick={() =>
                  handleDoubleClick(session.id, session.name)
                }
                className={`group relative flex flex-col gap-1 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-violet-500/10 border-l-2 border-violet-500'
                    : 'hover:bg-accent'
                }`}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-opacity cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>

                {/* Editable name */}
                {editingId === session.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                    className="h-6 text-sm border-violet-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm font-medium truncate pr-6">
                    {session.name}
                  </span>
                )}

                {/* Model badge */}
                <div className="flex items-center gap-1.5">
                  {provider && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded text-white/80 font-medium"
                      style={{ backgroundColor: provider.color + 'cc' }}
                    >
                      {provider.name}/{session.model}
                    </span>
                  )}
                </div>

                {/* Last message preview */}
                {lastMessage && (
                  <span className="text-xs text-muted-foreground truncate">
                    {lastMessage.content.slice(0, 50)}
                    {lastMessage.content.length > 50 ? '...' : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat Page
// ---------------------------------------------------------------------------
export default function ChatPage() {
  const {
    chatSessions,
    currentSessionId,
    createSession,
    deleteSession,
    renameSession,
    setCurrentSession,
    addMessage,
    updateMessage,
    apiKeys,
    settings,
    setCurrentTab,
    sidebarOpen,
    setSidebarOpen,
    isStreaming,
    setStreaming,
    updateSettings,
  } = useVoiceDevStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSession = chatSessions.find((s) => s.id === currentSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages.length, currentSession?.messages[currentSession?.messages.length - 1]?.content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleNewChat = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id);
    },
    [deleteSession]
  );

  const handleRenameSession = useCallback(
    (id: string, name: string) => {
      renameSession(id, name);
    },
    [renameSession]
  );

  const handleOpenSettings = useCallback(() => {
    setCurrentTab('settings' as TabId);
  }, [setCurrentTab]);

  const handleModelChange = useCallback(
    (value: string) => {
      if (!currentSessionId) return;
      const [providerId, modelId] = value.split('::');
      if (!providerId || !modelId) return;

      const store = useVoiceDevStore.getState();
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId
          ? { ...s, provider: providerId, model: modelId, updatedAt: Date.now() }
          : s
      );
    },
    [currentSessionId]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreaming(false);
  }, [setStreaming]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    // Add user message
    const userMsg = {
      id: generateId(),
      role: 'user' as const,
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(sessionId, userMsg);
    setInputValue('');

    // Add placeholder AI message
    const aiMsgId = generateId();
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
      model: undefined,
    };
    addMessage(sessionId, aiMsg);
    setStreaming(true);

    try {
      const session = useVoiceDevStore.getState().chatSessions.find((s) => s.id === sessionId);
      if (!session) return;

      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...session.messages.map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: trimmed }],
          provider: session.provider,
          model: session.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
          stream: settings.stream,
          apiKey: apiKeys[session.provider],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        updateMessage(sessionId, aiMsgId, `Error: ${errText}`);
        setStreaming(false);
        return;
      }

      if (settings.stream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let tokenCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  accumulated += delta;
                  tokenCount++;
                  updateMessage(sessionId, aiMsgId, accumulated);
                }
                // Handle usage data
                if (parsed.usage) {
                  const store = useVoiceDevStore.getState();
                  store.chatSessions = store.chatSessions.map((s) =>
                    s.id === sessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === aiMsgId
                              ? { ...m, tokenCount: parsed.usage.total_tokens, model: session.model }
                              : m
                          ),
                        }
                      : s
                  );
                }
              } catch {
                // Non-JSON data line, ignore
              }
            }
          }
        }

        // Update model info on complete
        const store = useVoiceDevStore.getState();
        store.chatSessions = store.chatSessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === aiMsgId ? { ...m, model: session.model } : m
                ),
              }
            : s
        );
      } else {
        const data = await response.json();
        const content =
          data.choices?.[0]?.message?.content || JSON.stringify(data);
        updateMessage(sessionId, aiMsgId, content);

        const store = useVoiceDevStore.getState();
        store.chatSessions = store.chatSessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        tokenCount: data.usage?.total_tokens,
                        model: session.model,
                      }
                    : m
                ),
              }
            : s
        );
      }

      // Auto-rename session from first user message
      const store = useVoiceDevStore.getState();
      const updatedSession = store.chatSessions.find((s) => s.id === sessionId);
      if (updatedSession && updatedSession.name === 'New Chat') {
        renameSession(sessionId, trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : ''));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        updateMessage(sessionId, aiMsgId, '(Stopped)');
      } else {
        updateMessage(
          sessionId,
          aiMsgId,
          `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isStreaming, currentSessionId, createSession, addMessage, updateMessage, setStreaming, settings, apiKeys, renameSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  // Group messages by role for styling
  const messages = currentSession?.messages || [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col border-r bg-card transition-all duration-300 ${
          sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
        }`}
      >
        <SidebarContent
          onNewChat={handleNewChat}
          onSessionSelect={setCurrentSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onOpenSettings={handleOpenSettings}
        />
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 h-14 border-b bg-card/50 backdrop-blur-sm shrink-0">
          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Chat Sessions</SheetTitle>
              </SheetHeader>
              <SidebarContent
                onNewChat={handleNewChat}
                onSessionSelect={(id) => {
                  setCurrentSession(id);
                }}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                onOpenSettings={handleOpenSettings}
              />
            </SheetContent>
          </Sheet>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Session name */}
          <span className="font-medium text-sm truncate">
            {currentSession?.name || 'New Chat'}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Model Selector */}
          <Select
            value={
              currentSession
                ? `${currentSession.provider}::${currentSession.model}`
                : undefined
            }
            onValueChange={handleModelChange}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectGroup key={provider.id}>
                  <SelectLabel className="text-xs font-semibold">
                    {provider.name}
                  </SelectLabel>
                  {provider.models
                    .filter((m) => m.category === 'LLM' || m.category === 'Reasoning')
                    .map((model) => (
                      <SelectItem
                        key={`${provider.id}::${model.id}`}
                        value={`${provider.id}::${model.id}`}
                        className="text-xs"
                      >
                        {model.name}
                        <span className="ml-1 text-muted-foreground">
                          ({(model.contextWindow / 1000).toFixed(0)}k ctx)
                        </span>
                      </SelectItem>
                    ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {/* Settings */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={handleOpenSettings}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isEmpty && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-violet-500" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Start a conversation</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a model and begin chatting with AI
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className="px-3 py-1.5 rounded-full border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`py-6 ${settings.messageSpacing === 'compact' ? 'space-y-1' : 'space-y-3'}`}>
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => {
                  const isLatestInGroup =
                    idx === messages.length - 1 || messages[idx + 1]?.role !== msg.role;
                  const isLastMsg = idx === messages.length - 1;
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      showTokens={settings.showTokens}
                      isLatestInGroup={isLatestInGroup}
                      isStreaming={isLastMsg && isStreaming && msg.role === 'assistant'}
                    />
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <div
              className={`flex items-end gap-2 rounded-xl border bg-background px-3 py-2 transition-shadow ${
                isStreaming ? 'shadow-none' : 'focus-within:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
              }`}
            >
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 resize-none border-0 bg-transparent p-0 text-sm min-h-[24px] max-h-[200px] focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                rows={1}
                disabled={isStreaming}
              />
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 shrink-0 rounded-lg cursor-pointer"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 text-white cursor-pointer disabled:opacity-30"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
