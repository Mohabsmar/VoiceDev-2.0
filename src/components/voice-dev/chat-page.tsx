'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Search,
  Download,
  Pin,
  PinOff,
  FileJson,
  FileText,
  RefreshCw,
  Key,
  Clock,
  WifiOff,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  X,
  RotateCcw,
  Atom,
  Code2,
  Bug,
  Mail,
  Newspaper,
  Server,
  Database,
  PenTool,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import type { TabId, Message, ModelCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

function formatContextWindow(ctx: number): string {
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(ctx % 1000000 === 0 ? 0 : 1)}M`;
  if (ctx >= 1000) return `${(ctx / 1000).toFixed(0)}K`;
  return `${ctx}`;
}

function getErrorType(
  errorMsg: string
): 'no_key' | 'rate_limit' | 'network' | 'model' | 'generic' {
  const lower = errorMsg.toLowerCase();
  if (
    lower.includes('api key') ||
    lower.includes('unauthorized') ||
    lower.includes('401') ||
    lower.includes('authentication')
  )
    return 'no_key';
  if (
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('too many')
  )
    return 'rate_limit';
  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('connection') ||
    lower.includes('failed to fetch') ||
    lower.includes('econnrefused')
  )
    return 'network';
  if (
    lower.includes('model') ||
    lower.includes('not available') ||
    lower.includes('404') ||
    lower.includes('not found')
  )
    return 'model';
  return 'generic';
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SUGGESTED_PROMPTS = [
  { text: 'Explain quantum computing simply', icon: Atom, color: 'from-blue-500 to-cyan-500' },
  { text: 'Write a Python web scraper', icon: Code2, color: 'from-green-500 to-emerald-500' },
  { text: 'Help me debug my React app', icon: Bug, color: 'from-red-500 to-orange-500' },
  { text: 'Create a marketing email', icon: Mail, color: 'from-pink-500 to-rose-500' },
  { text: 'Summarize the latest AI news', icon: Newspaper, color: 'from-amber-500 to-yellow-500' },
  { text: 'Build a REST API with Express', icon: Server, color: 'from-violet-500 to-purple-500' },
  { text: 'Write a SQL query for inventory', icon: Database, color: 'from-teal-500 to-cyan-500' },
  { text: 'Generate a creative story', icon: PenTool, color: 'from-fuchsia-500 to-pink-500' },
];

const MODEL_CATEGORIES: ModelCategory[] = [
  'LLM',
  'Reasoning',
  'TTS',
  'ASR',
  'Vision',
  'Image',
  'Embedding',
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
// Thinking Indicator (bouncing dots)
// ---------------------------------------------------------------------------
function ThinkingIndicator({
  elapsedTime,
  tokenEstimate,
}: {
  elapsedTime: number;
  tokenEstimate: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">Thinking</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block w-1.5 h-1.5 bg-violet-500 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
        <span>{elapsedTime.toFixed(1)}s</span>
        {tokenEstimate > 0 && <span>· ~{tokenEstimate} tokens</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error Message Component
// ---------------------------------------------------------------------------
function ErrorMessage({
  content,
  onRetry,
}: {
  content: string;
  onRetry?: () => void;
}) {
  const errorType = getErrorType(content);

  const config = {
    no_key: {
      icon: Key,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      title: 'No API key configured',
    },
    rate_limit: {
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      title: 'Rate limited',
    },
    network: {
      icon: WifiOff,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      title: 'Connection failed',
    },
    model: {
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      title: 'Model not available',
    },
    generic: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      title: 'Error',
    },
  }[errorType];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center px-4 my-2"
    >
      <div
        className={`${config.bg} border rounded-xl px-4 py-3 max-w-xl w-full`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{content}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-xs cursor-pointer"
            onClick={onRetry}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Message Bubble (with actions menu)
// ---------------------------------------------------------------------------
function MessageBubble({
  message,
  showTokens,
  isLatestInGroup,
  isStreaming,
  sessionId,
  onRegenerate,
  onDelete,
  onPin,
  isPinned,
  onExportSession,
  elapsedTime,
  onRetry,
}: {
  message: {
    id: string;
    role: string;
    content: string;
    timestamp: number;
    tokenCount?: number;
    model?: string;
  };
  showTokens: boolean;
  isLatestInGroup: boolean;
  isStreaming?: boolean;
  sessionId: string;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  onExportSession?: (format: 'json' | 'markdown') => void;
  elapsedTime?: number;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isError) {
    return <ErrorMessage content={message.content} onRetry={onRetry} />;
  }

  const streamingTokenEstimate = isStreaming
    ? Math.floor(message.content.length / 4)
    : 0;

  return (
    <motion.div
      id={`message-${message.id}`}
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
        {/* Timestamp + actions on hover */}
        <div
          className={`absolute -top-6 text-[10px] text-muted-foreground flex items-center gap-2 ${
            isUser ? 'right-4' : 'left-4'
          } ${hovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isPinned && (
            <Pin className="h-3 w-3 text-violet-400 fill-violet-400" />
          )}
          {isAssistant && message.content && (
            <button
              onClick={handleCopy}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
          {/* Actions menu for assistant messages */}
          {isAssistant && message.content && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-foreground transition-colors cursor-pointer">
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Copy
                  <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                </DropdownMenuItem>
                {onRegenerate && (
                  <DropdownMenuItem onClick={onRegenerate}>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onPin && (
                  <DropdownMenuItem onClick={onPin}>
                    {isPinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                    {isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                )}
                {onExportSession && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Download className="h-4 w-4" />
                      Export
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => onExportSession('json')}
                      >
                        <FileJson className="h-4 w-4" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onExportSession('markdown')}
                      >
                        <FileText className="h-4 w-4" />
                        Export as Markdown
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        ) : (
          <div
            className={`text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_pre]:p-0 [&_pre]:bg-transparent [&_pre]:border-0`}
          >
            {isStreaming && !message.content ? (
              <ThinkingIndicator
                elapsedTime={elapsedTime || 0}
                tokenEstimate={streamingTokenEstimate}
              />
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

        {/* Streaming stats bar */}
        {isStreaming && message.content && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/70">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block w-1 h-1 bg-violet-500 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
            <span>{(elapsedTime || 0).toFixed(1)}s</span>
            <span>·</span>
            <span>~{streamingTokenEstimate} tokens so far</span>
          </div>
        )}

        {/* Token count badge */}
        {showTokens && message.tokenCount && isAssistant && !isStreaming && (
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
// Empty State Component
// ---------------------------------------------------------------------------
function EmptyState({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-8 py-12">
      {/* Animated VoiceDev logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative"
      >
        <motion.div
          className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
          animate={{ y: [0, -6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 opacity-20 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          What can I help you with?
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Choose a prompt below or type your own message to start a conversation
          with any AI model
        </p>
      </motion.div>

      {/* 2x4 Prompt Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full"
      >
        {SUGGESTED_PROMPTS.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <motion.button
              key={prompt.text}
              onClick={() => onPromptClick(prompt.text)}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-violet-500/30 transition-all duration-200 cursor-pointer text-center"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
            >
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                {prompt.text}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Model Selector Shared Content
// ---------------------------------------------------------------------------
function ModelSelectorContent({
  currentProvider,
  currentModel,
  onSelectModel,
  onSelectClose,
}: {
  currentProvider?: string;
  currentModel?: string;
  onSelectModel: (value: string) => void;
  onSelectClose?: () => void;
}) {
  const categorizedModels = useMemo(() => {
    const categories: Record<string, Array<{ providerId: string; providerName: string; providerColor: string; modelId: string; modelName: string; contextWindow: number; pricing: string; category: string }>> = {};
    PROVIDERS.forEach((provider) => {
      provider.models.forEach((model) => {
        if (!categories[model.category]) {
          categories[model.category] = [];
        }
        categories[model.category].push({
          providerId: provider.id,
          providerName: provider.name,
          providerColor: provider.color,
          modelId: model.id,
          modelName: model.name,
          contextWindow: model.contextWindow,
          pricing: model.pricing,
          category: model.category,
        });
      });
    });
    return categories;
  }, []);

  const pricingBadge = (pricing: string) => {
    const variant =
      pricing === 'Free'
        ? 'bg-green-500/15 text-green-400 border-green-500/20'
        : pricing === 'Freemium'
          ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
          : 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${variant} font-medium`}>
        {pricing}
      </span>
    );
  };

  return (
    <ScrollArea className="h-[400px] md:h-[500px]">
      <div className="p-2 space-y-4">
        {MODEL_CATEGORIES.map((cat) => {
          const models = categorizedModels[cat];
          if (!models || models.length === 0) return null;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 px-2 py-1.5 sticky top-0 bg-popover z-10">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {cat}
                </span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {models.length}
                </Badge>
              </div>
              <div className="space-y-0.5">
                {models.map((m) => {
                  const isSelected =
                    m.providerId === currentProvider &&
                    m.modelId === currentModel;
                  return (
                    <button
                      key={`${m.providerId}::${m.modelId}`}
                      onClick={() => {
                        onSelectModel(`${m.providerId}::${m.modelId}`);
                        onSelectClose?.();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-violet-500/10 border border-violet-500/20'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div
                        className="h-5 w-5 rounded flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: m.providerColor + '25',
                        }}
                      >
                        <div
                          className="h-2 w-2 rounded-sm"
                          style={{
                            backgroundColor: m.providerColor,
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium truncate">
                            {m.modelName}
                          </span>
                          {isSelected && (
                            <Check className="h-3 w-3 text-violet-400 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {m.providerName}
                          </span>
                          {m.contextWindow > 0 && (
                            <>
                              <span className="text-[10px] text-muted-foreground/40">
                                ·
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatContextWindow(m.contextWindow)} ctx
                              </span>
                            </>
                          )}
                          {pricingBadge(m.pricing)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ---------------------------------------------------------------------------
// Chat Settings Popover
// ---------------------------------------------------------------------------
function ChatSettingsPopover() {
  const { settings, updateSettings } = useVoiceDevStore();
  const [localSystemPrompt, setLocalSystemPrompt] = useState(
    settings.systemPrompt
  );

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Chat Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <div className="font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" />
            Quick Settings
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Temperature</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.temperature]}
              onValueChange={([v]) => updateSettings({ temperature: v })}
              min={0}
              max={2}
              step={0.1}
            />
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Max Tokens</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {settings.maxTokens.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[settings.maxTokens]}
              onValueChange={([v]) => updateSettings({ maxTokens: v })}
              min={256}
              max={16384}
              step={256}
            />
          </div>

          <Separator />

          {/* Stream Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">Stream</Label>
            <Switch
              checked={settings.stream}
              onCheckedChange={(v) => updateSettings({ stream: v })}
            />
          </div>

          <Separator />

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="text-xs">System Prompt</Label>
            <Textarea
              value={localSystemPrompt}
              onChange={(e) => setLocalSystemPrompt(e.target.value)}
              onBlur={() => updateSettings({ systemPrompt: localSystemPrompt })}
              className="min-h-[60px] text-xs resize-none"
              placeholder="You are a helpful assistant..."
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Session Search Dialog
// ---------------------------------------------------------------------------
function SessionSearchDialog({
  open,
  onOpenChange,
  onResultClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultClick: (sessionId: string, messageId: string) => void;
}) {
  const { chatSessions } = useVoiceDevStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const flat: Array<{
      sessionId: string;
      sessionName: string;
      messageId: string;
      content: string;
      role: string;
      timestamp: number;
    }> = [];
    chatSessions.forEach((session) => {
      session.messages.forEach((msg) => {
        if (
          msg.role !== 'error' &&
          msg.content.toLowerCase().includes(q)
        ) {
          flat.push({
            sessionId: session.id,
            sessionName: session.name,
            messageId: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: msg.timestamp,
          });
        }
      });
    });
    return flat.slice(0, 20);
  }, [query, chatSessions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Messages
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all conversations..."
            className="pl-9"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1">
          {query.trim() && results.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.messageId}
              onClick={() => {
                onResultClick(r.sessionId, r.messageId);
                onOpenChange(false);
              }}
              className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] h-4 shrink-0">
                  {r.role === 'user' ? 'You' : 'AI'}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {r.sessionName}
                </span>
                <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
                  {formatTime(r.timestamp)}
                </span>
              </div>
              <p className="text-xs text-foreground/80 line-clamp-2">
                {r.content}
              </p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sidebar Content
// ---------------------------------------------------------------------------
function SidebarContent({
  onNewChat,
  onSessionSelect,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  pinnedSessionIds,
  archivedSessionIds,
  showArchived,
  onTogglePin,
  onToggleArchive,
  onToggleShowArchived,
  onClearAll,
}: {
  onNewChat: () => void;
  onSessionSelect: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
  onOpenSettings: () => void;
  pinnedSessionIds: Set<string>;
  archivedSessionIds: Set<string>;
  showArchived: boolean;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleShowArchived: () => void;
  onClearAll: () => void;
}) {
  const { chatSessions, currentSessionId } = useVoiceDevStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeSessions = chatSessions.filter(
    (s) => !archivedSessionIds.has(s.id)
  );
  const archivedSessions = chatSessions.filter((s) =>
    archivedSessionIds.has(s.id)
  );
  const displayedSessions = showArchived
    ? archivedSessions
    : activeSessions;

  // Sort: pinned first, then by updatedAt
  const sortedSessions = [...displayedSessions].sort((a, b) => {
    const aPinned = pinnedSessionIds.has(a.id);
    const bPinned = pinnedSessionIds.has(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

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
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">VoiceDev</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {activeSessions.length} chat{activeSessions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={onToggleShowArchived}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showArchived ? 'Show Active' : 'Show Archived'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          {showArchived && (
            <div className="px-3 py-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Archived
              </span>
            </div>
          )}
          {sortedSessions.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {showArchived ? 'No archived sessions' : 'No conversations yet'}
            </div>
          )}
          {sortedSessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const isPinned = pinnedSessionIds.has(session.id);
            const isArchived = archivedSessionIds.has(session.id);
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
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPinned && (
                    <Pin className="h-3 w-3 text-violet-400 fill-violet-400 mr-1" />
                  )}
                  {isArchived && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleArchive(session.id);
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-green-500/10 text-green-500 cursor-pointer"
                    >
                      <ArchiveRestore className="h-3 w-3" />
                    </button>
                  )}
                  {!isArchived && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(session.id);
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-violet-500/10 text-violet-400 cursor-pointer"
                    >
                      {isPinned ? (
                        <PinOff className="h-3 w-3" />
                      ) : (
                        <Pin className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  {!isArchived && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleArchive(session.id);
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground cursor-pointer"
                    >
                      <Archive className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

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

      {/* Footer: Clear All */}
      {activeSessions.length > 0 && !showArchived && (
        <div className="p-3 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All Chats
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Chats?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {activeSessions.length} active
                  chat sessions and their messages. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
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
    clearAllData,
  } = useVoiceDevStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Streaming timer
  const streamStartRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Pinned/archived sessions (local state with localStorage)
  const [pinnedSessionIds, setPinnedSessionIds] = useState<Set<string>>(
    new Set()
  );
  const [archivedSessionIds, setArchivedSessionIds] = useState<Set<string>>(
    new Set()
  );
  const [showArchived, setShowArchived] = useState(false);

  // Pinned messages (ephemeral)
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(
    new Set()
  );

  // Session search
  const [searchOpen, setSearchOpen] = useState(false);

  // Mobile model selector drawer
  const [mobileModelDrawerOpen, setMobileModelDrawerOpen] = useState(false);

  // Clear all dialog
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // Touch swipe for mobile sidebar
  const touchStartRef = useRef<number>(0);

  const currentSession = chatSessions.find((s) => s.id === currentSessionId);

  // Load pinned/archived from localStorage
  useEffect(() => {
    try {
      const pinned = localStorage.getItem('voicedev-pinned-sessions');
      const archived = localStorage.getItem('voicedev-archived-sessions');
      if (pinned) setPinnedSessionIds(new Set(JSON.parse(pinned)));
      if (archived) setArchivedSessionIds(new Set(JSON.parse(archived)));
    } catch {
      // ignore
    }
  }, []);

  // Save pinned/archived to localStorage
  useEffect(() => {
    localStorage.setItem(
      'voicedev-pinned-sessions',
      JSON.stringify([...pinnedSessionIds])
    );
  }, [pinnedSessionIds]);

  useEffect(() => {
    localStorage.setItem(
      'voicedev-archived-sessions',
      JSON.stringify([...archivedSessionIds])
    );
  }, [archivedSessionIds]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [
    currentSession?.messages.length,
    currentSession?.messages[currentSession?.messages.length - 1]?.content,
  ]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Streaming timer
  useEffect(() => {
    if (isStreaming) {
      streamStartRef.current = Date.now();
      setElapsedTime(0);
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - streamStartRef.current) / 1000);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [isStreaming]);

  // Token estimation for input
  const inputTokenEstimate = useMemo(
    () => (inputValue.length > 0 ? estimateTokens(inputValue) : 0),
    [inputValue]
  );

  // ---- Handlers ----

  const handleNewChat = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id);
      setPinnedSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setArchivedSessionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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

  const handleTogglePin = useCallback((id: string) => {
    setPinnedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleArchive = useCallback((id: string) => {
    setArchivedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllData();
    setPinnedSessionIds(new Set());
    setArchivedSessionIds(new Set());
    setClearAllDialogOpen(false);
  }, [clearAllData]);

  const handleModelChange = useCallback(
    (value: string) => {
      if (!currentSessionId) return;
      const [providerId, modelId] = value.split('::');
      if (!providerId || !modelId) return;

      const store = useVoiceDevStore.getState();
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              provider: providerId,
              model: modelId,
              updatedAt: Date.now(),
            }
          : s
      );
    },
    [currentSessionId]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreaming(false);
  }, [setStreaming]);

  // Send message to API (core logic)
  const sendToApi = useCallback(
    async (sessionId: string, contextMessages: Array<{ role: string; content: string }>) => {
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
        const session = useVoiceDevStore
          .getState()
          .chatSessions.find((s) => s.id === sessionId);
        if (!session) return;

        abortControllerRef.current = new AbortController();

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: contextMessages,
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
                    updateMessage(sessionId, aiMsgId, accumulated);
                  }
                  if (parsed.usage) {
                    const store = useVoiceDevStore.getState();
                    store.chatSessions = store.chatSessions.map((s) =>
                      s.id === sessionId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === aiMsgId
                                ? {
                                    ...m,
                                    tokenCount: parsed.usage.total_tokens,
                                    model: session.model,
                                  }
                                : m
                            ),
                          }
                        : s
                    );
                  }
                } catch {
                  // Non-JSON data line
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
    },
    [settings, apiKeys, addMessage, updateMessage, setStreaming]
  );

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

    // Build context messages
    const session = useVoiceDevStore.getState().chatSessions.find(
      (s) => s.id === sessionId
    );
    const contextMessages = [
      ...(session?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: trimmed },
    ];

    await sendToApi(sessionId, contextMessages);

    // Auto-rename session
    const store = useVoiceDevStore.getState();
    const updatedSession = store.chatSessions.find((s) => s.id === sessionId);
    if (updatedSession && updatedSession.name === 'New Chat') {
      renameSession(
        sessionId,
        trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : '')
      );
    }
  }, [
    inputValue,
    isStreaming,
    currentSessionId,
    createSession,
    addMessage,
    sendToApi,
    renameSession,
  ]);

  // Regenerate: delete the AI message and re-send
  const handleRegenerate = useCallback(
    async (aiMessageId: string) => {
      if (!currentSessionId || isStreaming) return;

      const store = useVoiceDevStore.getState();
      const session = store.chatSessions.find(
        (s) => s.id === currentSessionId
      );
      if (!session) return;

      const aiMsgIndex = session.messages.findIndex(
        (m) => m.id === aiMessageId
      );
      if (aiMsgIndex < 0) return;

      // Find the last user message before this AI message
      let userContent = '';
      for (let i = aiMsgIndex - 1; i >= 0; i--) {
        if (session.messages[i].role === 'user') {
          userContent = session.messages[i].content;
          break;
        }
      }
      if (!userContent) return;

      // Remove the AI message and everything after
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.slice(0, aiMsgIndex),
              updatedAt: Date.now(),
            }
          : s
      );

      const contextMessages = session.messages
        .slice(0, aiMsgIndex)
        .map((m) => ({ role: m.role, content: m.content }));

      await sendToApi(currentSessionId, contextMessages);
    },
    [currentSessionId, isStreaming, sendToApi]
  );

  // Retry error: same as regenerate but for error messages
  const handleRetryError = useCallback(
    async (errorMessageId: string) => {
      if (!currentSessionId || isStreaming) return;

      const store = useVoiceDevStore.getState();
      const session = store.chatSessions.find(
        (s) => s.id === currentSessionId
      );
      if (!session) return;

      const errMsgIndex = session.messages.findIndex(
        (m) => m.id === errorMessageId
      );
      if (errMsgIndex < 0) return;

      // Find the last user message before this error
      let userContent = '';
      for (let i = errMsgIndex - 1; i >= 0; i--) {
        if (session.messages[i].role === 'user') {
          userContent = session.messages[i].content;
          break;
        }
      }
      if (!userContent) return;

      // Remove the error and everything after
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.slice(0, errMsgIndex),
              updatedAt: Date.now(),
            }
          : s
      );

      const contextMessages = session.messages
        .slice(0, errMsgIndex)
        .map((m) => ({ role: m.role, content: m.content }));

      await sendToApi(currentSessionId, contextMessages);
    },
    [currentSessionId, isStreaming, sendToApi]
  );

  // Delete a message
  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (!currentSessionId) return;
      const store = useVoiceDevStore.getState();
      store.chatSessions = store.chatSessions.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.filter((m) => m.id !== messageId),
              updatedAt: Date.now(),
            }
          : s
      );
    },
    [currentSessionId]
  );

  // Toggle pin on a message
  const handleTogglePinMessage = useCallback((messageId: string) => {
    setPinnedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }, []);

  // Export session
  const handleExportSession = useCallback(
    (format: 'json' | 'markdown') => {
      if (!currentSession) return;

      const provider = PROVIDERS.find(
        (p) => p.id === currentSession.provider
      );

      if (format === 'json') {
        const data = {
          name: currentSession.name,
          provider: currentSession.provider,
          model: currentSession.model,
          exportedAt: new Date().toISOString(),
          messages: currentSession.messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            tokenCount: m.tokenCount,
            model: m.model,
          })),
        };
        downloadFile(
          `${currentSession.name.replace(/[^a-z0-9]/gi, '_')}.json`,
          JSON.stringify(data, null, 2),
          'application/json'
        );
      } else {
        let md = `# ${currentSession.name}\n\n`;
        md += `**Provider:** ${provider?.name || currentSession.provider} / ${currentSession.model}\n`;
        md += `**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
        currentSession.messages.forEach((m) => {
          if (m.role === 'error') return;
          md += `**${m.role === 'user' ? 'User' : 'Assistant'}** (${formatTime(m.timestamp)})\n\n`;
          md += `${m.content}\n\n---\n\n`;
        });
        downloadFile(
          `${currentSession.name.replace(/[^a-z0-9]/gi, '_')}.md`,
          md,
          'text/markdown'
        );
      }
    },
    [currentSession]
  );

  // Export header button
  const handleExportFromHeader = useCallback(() => {
    handleExportSession('json');
  }, [handleExportSession]);

  // Search result click
  const handleSearchResultClick = useCallback(
    (sessionId: string, messageId: string) => {
      setCurrentSession(sessionId);
      setTimeout(() => {
        const el = document.getElementById(`message-${messageId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Flash highlight
          el.classList.add('ring-2', 'ring-violet-500', 'rounded-xl');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-violet-500', 'rounded-xl');
          }, 2000);
        }
      }, 100);
    },
    [setCurrentSession]
  );

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

  // Swipe right for mobile sidebar
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (diff > 80 && touchStartRef.current < 30) {
      setSidebarOpen(true);
      // Trigger mobile sheet by dispatching click on menu button
      const menuBtn = document.querySelector(
        '[data-mobile-menu-trigger]'
      ) as HTMLElement;
      menuBtn?.click();
    }
  };

  // Group messages by role for styling
  const messages = currentSession?.messages || [];
  const isEmpty = messages.length === 0;

  // Sidebar content props
  const sidebarProps = {
    onNewChat: handleNewChat,
    onSessionSelect: setCurrentSession,
    onDeleteSession: handleDeleteSession,
    onRenameSession: handleRenameSession,
    onOpenSettings: handleOpenSettings,
    pinnedSessionIds,
    archivedSessionIds,
    showArchived,
    onTogglePin: handleTogglePin,
    onToggleArchive: handleToggleArchive,
    onToggleShowArchived: () => setShowArchived((v) => !v),
    onClearAll: handleClearAll,
  };

  return (
    <div className="flex h-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col border-r bg-card transition-all duration-300 ${
          sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
        }`}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-2 px-4 h-14 border-b bg-card/50 backdrop-blur-sm shrink-0">
          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 cursor-pointer"
                data-mobile-menu-trigger
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Chat Sessions</SheetTitle>
              </SheetHeader>
              <SidebarContent {...sidebarProps} />
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

          {/* Search */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search Messages</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Export */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      disabled={!currentSession}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleExportSession('json')}
                    >
                      <FileJson className="h-4 w-4" />
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportSession('markdown')}
                    >
                      <FileText className="h-4 w-4" />
                      Export as Markdown
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Export Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Model Selector - Desktop (Popover) */}
          <div className="hidden md:block">
            <Popover>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5 max-w-[200px] cursor-pointer"
                      >
                        <span className="truncate">
                          {currentSession
                            ? (() => {
                                const p = PROVIDERS.find(
                                  (pr) =>
                                    pr.id === currentSession.provider
                                );
                                const m = p?.models.find(
                                  (md) => md.id === currentSession.model
                                );
                                return m?.name || currentSession.model;
                              })()
                            : 'Select model'}
                        </span>
                        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Change Model</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-80 p-0" align="end">
                <ModelSelectorContent
                  currentProvider={currentSession?.provider}
                  currentModel={currentSession?.model}
                  onSelectModel={handleModelChange}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Model Selector - Mobile (Drawer) */}
          <div className="md:hidden">
            <Drawer
              open={mobileModelDrawerOpen}
              onOpenChange={setMobileModelDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 max-w-[140px] cursor-pointer"
                >
                  <span className="truncate">
                    {currentSession
                      ? (() => {
                          const p = PROVIDERS.find(
                            (pr) => pr.id === currentSession.provider
                          );
                          const m = p?.models.find(
                            (md) => md.id === currentSession.model
                          );
                          return m?.name || currentSession.model;
                        })()
                      : 'Model'}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Select Model</DrawerTitle>
                </DrawerHeader>
                <ModelSelectorContent
                  currentProvider={currentSession?.provider}
                  currentModel={currentSession?.model}
                  onSelectModel={(v) => {
                    handleModelChange(v);
                    setMobileModelDrawerOpen(false);
                  }}
                  onSelectClose={() => setMobileModelDrawerOpen(false)}
                />
              </DrawerContent>
            </Drawer>
          </div>

          {/* Chat Settings */}
          <ChatSettingsPopover />

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
            <EmptyState onPromptClick={handlePromptClick} />
          ) : (
            <div
              className={`py-6 ${
                settings.messageSpacing === 'compact'
                  ? 'space-y-1'
                  : 'space-y-3'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => {
                  const isLatestInGroup =
                    idx === messages.length - 1 ||
                    messages[idx + 1]?.role !== msg.role;
                  const isLastMsg = idx === messages.length - 1;
                  const isLastAssistantStreaming =
                    isLastMsg && isStreaming && msg.role === 'assistant';

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      showTokens={settings.showTokens}
                      isLatestInGroup={isLatestInGroup}
                      isStreaming={isLastAssistantStreaming}
                      sessionId={currentSessionId || ''}
                      elapsedTime={elapsedTime}
                      isPinned={pinnedMessageIds.has(msg.id)}
                      onRegenerate={
                        msg.role === 'assistant' && isLatestInGroup
                          ? () => handleRegenerate(msg.id)
                          : undefined
                      }
                      onDelete={
                        msg.role !== 'user' || idx === messages.length - 1
                          ? () => handleDeleteMessage(msg.id)
                          : undefined
                      }
                      onPin={
                        msg.role === 'assistant'
                          ? () => handleTogglePinMessage(msg.id)
                          : undefined
                      }
                      onExportSession={handleExportSession}
                      onRetry={
                        msg.role === 'error'
                          ? () => handleRetryError(msg.id)
                          : undefined
                      }
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
                isStreaming
                  ? 'shadow-none'
                  : 'focus-within:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
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
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                >
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 shrink-0 rounded-lg cursor-pointer"
                    onClick={handleStop}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </motion.div>
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
            <div className="flex items-center justify-between mt-1.5 px-1">
              <p className="text-[10px] text-muted-foreground/60">
                Press Enter to send, Shift+Enter for new line
              </p>
              {inputTokenEstimate > 0 && (
                <p className="text-[10px] text-muted-foreground/60 tabular-nums">
                  est. ~{inputTokenEstimate} tokens
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Session Search Dialog */}
      <SessionSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onResultClick={handleSearchResultClick}
      />
    </div>
  );
}
