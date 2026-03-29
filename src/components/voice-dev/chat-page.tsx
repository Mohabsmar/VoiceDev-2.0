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
  Bookmark,
  BookmarkCheck,
  Mic,
  MicOff,
  FolderPlus,
  FolderOpen,
  Folder,
  GitBranch,
  BarChart3,
  Share2,
  ImagePlus,
  Play,
  WrapText,
  ListOrdered,
  Eye,
  ChevronRight,
  ChevronUp,
  Hash,
  BookOpen,
  Briefcase,
  FlaskConical,
  Lightbulb,
  FileUp,
  Pencil,
  BookmarkIcon,
  PanelRight,
  type LucideIcon,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

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

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function calcReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil((wordCount / 200) * 60));
}

function isImageModel(modelId?: string): boolean {
  if (!modelId) return false;
  const id = modelId.toLowerCase();
  return (
    id.includes('dall-e') ||
    id.includes('imagen') ||
    id.includes('stable-diffusion') ||
    id.includes('midjourney') ||
    id.includes('flux') ||
    id.includes('image-gen')
  );
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

const REACTION_EMOJIS = ['👍', '👎', '❤️', '🤔', '💡', '🎉'];

const CHAT_TEMPLATES = [
  {
    id: 'code-review',
    name: 'Code Review',
    icon: Code2,
    color: 'from-green-500 to-emerald-500',
    systemPrompt: 'You are an expert code reviewer. Analyze code for bugs, performance issues, readability, and best practices. Provide constructive feedback with specific suggestions.',
    suggestedMessage: 'Please review this code:\n\n```javascript\nfunction fetchData() {\n  fetch("/api/data").then(res => res.json()).then(data => console.log(data))\n}\n```',
  },
  {
    id: 'creative-writing',
    name: 'Creative Writing',
    icon: PenTool,
    color: 'from-fuchsia-500 to-pink-500',
    systemPrompt: 'You are a creative writing assistant. Help with stories, poems, scripts, and other creative content. Focus on vivid descriptions, engaging narratives, and compelling characters.',
    suggestedMessage: 'Help me write a short science fiction story about an AI that discovers emotions.',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    systemPrompt: 'You are a data analysis expert. Help interpret data, suggest statistical methods, create analysis plans, and explain findings in clear terms.',
    suggestedMessage: 'I have a dataset of 10,000 customer transactions. Help me analyze patterns and suggest key metrics to track.',
  },
  {
    id: 'learning',
    name: 'Learning',
    icon: BookOpen,
    color: 'from-amber-500 to-yellow-500',
    systemPrompt: 'You are a patient and thorough tutor. Explain concepts step by step, use analogies and examples, and check for understanding. Adapt to the learner\'s level.',
    suggestedMessage: 'Explain how neural networks work, starting from the basics for someone with no machine learning background.',
  },
  {
    id: 'debugging',
    name: 'Debugging',
    icon: Bug,
    color: 'from-red-500 to-orange-500',
    systemPrompt: 'You are an expert debugger. Help identify bugs, explain error messages, suggest fixes, and teach debugging strategies. Be systematic and thorough.',
    suggestedMessage: 'I\'m getting this error: "TypeError: Cannot read property \'map\' of undefined" in my React component. How do I fix it?',
  },
];

const QUICK_REPLY_TEMPLATES = [
  'Tell me more about this',
  'Give me a code example',
  'Simplify this explanation',
  'What are the pros and cons?',
  'How would this work in practice?',
  'Can you elaborate on that point?',
  'What if I approach it differently?',
  'Summarize the key takeaways',
];

const DEFAULT_FOLDERS = ['Work', 'Personal', 'Research', 'Ideas'];

// ---------------------------------------------------------------------------
// Enhanced Code Block Component
// ---------------------------------------------------------------------------
function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAsMarkdown = async () => {
    const md = `\`\`\`${language || 'code'}\n${children}\n\`\`\``;
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied as Markdown');
  };

  const handleRun = async () => {
    if (language !== 'python' && language !== 'python3') return;
    setRunning(true);
    setShowOutput(true);
    setOutput('Running...');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a Python interpreter. Execute the given Python code and return ONLY the output. Do not explain anything.',
            },
            { role: 'user', content: `Execute this code and return the output:\n\n${children}` },
          ],
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0,
          maxTokens: 1024,
          stream: false,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || 'No output';
      setOutput(content);
    } catch {
      setOutput('Error: Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  const lines = children.split('\n');
  const isPython = language === 'python' || language === 'python3';

  return (
    <div className="relative rounded-lg overflow-hidden my-2 border border-border/50">
      <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-medium">{language || 'code'}</span>
          {showLineNumbers && (
            <span className="text-zinc-500 text-[10px]">
              {lines.length} lines
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPython && (
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer disabled:opacity-50 px-1.5 py-0.5 rounded hover:bg-zinc-700"
            >
              {running ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              Run
            </button>
          )}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-700"
            title="Toggle line numbers"
          >
            <ListOrdered className="h-3 w-3" />
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-700"
            title="Toggle word wrap"
          >
            <WrapText className="h-3 w-3" />
          </button>
          <button
            onClick={handleCopyAsMarkdown}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-700"
            title="Copy as Markdown"
          >
            <FileText className="h-3 w-3" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-700"
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
      </div>
      <div className="flex">
        {showLineNumbers && (
          <div className="bg-zinc-800/50 text-zinc-500 text-xs text-right py-3 px-2 select-none border-r border-zinc-700/50 shrink-0">
            {lines.map((_, i) => (
              <div key={i} className="leading-[1.375rem]">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <div className={`min-w-0 ${wordWrap ? '' : 'overflow-x-auto'}`}>
          <SyntaxHighlighter
            language={language || 'text'}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.8125rem',
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              wordBreak: wordWrap ? 'break-all' : 'normal',
            }}
            showLineNumbers={false}
          >
            {children}
          </SyntaxHighlighter>
        </div>
      </div>
      {showOutput && (
        <div className="border-t border-zinc-700/50 bg-zinc-900/50 px-4 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              Output
            </span>
            <button
              onClick={() => setShowOutput(false)}
              className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
            {output}
          </pre>
        </div>
      )}
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
// Reaction Bar
// ---------------------------------------------------------------------------
function ReactionBar({
  messageId,
  reactions,
  onToggleReaction,
}: {
  messageId: string;
  reactions: Record<string, Record<string, number>>;
  onToggleReaction: (messageId: string, emoji: string) => void;
}) {
  const messageReactions = reactions[messageId] || {};

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {REACTION_EMOJIS.map((emoji) => {
        const count = messageReactions[emoji] || 0;
        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(messageId, emoji)}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-all cursor-pointer ${
              count > 0
                ? 'border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20'
                : 'border-transparent hover:border-border hover:bg-muted/50'
            }`}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Word Count & Reading Time
// ---------------------------------------------------------------------------
function WordCountInfo({ content }: { content: string }) {
  const words = countWords(content);
  if (words < 5) return null;
  const seconds = calcReadingTime(words);
  const formatted =
    seconds >= 60
      ? `${Math.floor(seconds / 60)} min ${seconds % 60} sec read`
      : `${seconds} sec read`;
  return (
    <span className="text-[10px] text-muted-foreground/50">
      {words} words · {formatted}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Quick Replies
// ---------------------------------------------------------------------------
function QuickReplies({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) {
  const [replies] = useState(() => {
    const shuffled = [...QUICK_REPLY_TEMPLATES].sort(
      () => Math.random() - 0.5
    );
    return shuffled.slice(0, 3);
  });

  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="text-[10px] px-2 py-1 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Voice Input Button
// ---------------------------------------------------------------------------
function VoiceInputButton({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [pulse, setPulse] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);

  const createSpeechRecognition = () => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    return new (SpeechRecognition as new () => SpeechRecognition)();
  };

  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
  }

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setPulse(false);
      return;
    }

    const recognition = createSpeechRecognition();
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const rec = recognition as unknown as SpeechRecognition;
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onTranscript(transcript);
        toast.success('Speech captured');
      }
    };

    rec.onerror = () => {
      setIsRecording(false);
      setPulse(false);
      toast.error('Speech recognition error');
    };

    rec.onend = () => {
      setIsRecording(false);
      setPulse(false);
    };

    recognitionRef.current = recognition as unknown as ReturnType<typeof createSpeechRecognition>;
    rec.start();
    setIsRecording(true);
    setPulse(true);
  }, [isRecording, onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 shrink-0 cursor-pointer transition-colors ${
              isRecording ? 'text-red-500 hover:text-red-400' : ''
            }`}
            onClick={toggleRecording}
          >
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="flex items-center gap-0.5"
                >
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span
                      key={i}
                      className="inline-block w-0.5 bg-red-500 rounded-full"
                      animate={{
                        height: pulse ? [4, 14, 6, 12, 4] : 4,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                  <Mic className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isRecording ? 'Stop recording' : 'Voice input'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Image Lightbox
// ---------------------------------------------------------------------------
function ImageLightbox({
  src,
  open,
  onClose,
}: {
  src: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-2 bg-black/95 border-white/10">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={src}
            alt="Generated"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        </div>
        <div className="flex justify-center gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs cursor-pointer"
            onClick={() => {
              const a = document.createElement('a');
              a.href = src;
              a.download = `voicedev-image-${Date.now()}.png`;
              a.click();
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Conversation Summary
// ---------------------------------------------------------------------------
function ConversationSummary({
  summary,
  isGenerating,
  onSummarize,
}: {
  summary: string;
  isGenerating: boolean;
  onSummarize: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mx-4 mb-3">
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 hover:bg-violet-500/15 transition-colors cursor-pointer">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5" />
            {summary ? 'Conversation Summary' : 'Summarize this conversation'}
          </span>
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : !summary ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {summary ? (
          <div className="mt-1.5 px-3 py-2 rounded-lg bg-card border text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        ) : (
          <div className="mt-1.5 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSummarize();
              }}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Conversation Statistics Panel
// ---------------------------------------------------------------------------
function ConversationStats({
  messages,
  sessionName,
  open,
  onClose,
}: {
  messages: Message[];
  sessionName: string;
  open: boolean;
  onClose: () => void;
}) {
  const totalMessages = messages.filter((m) => m.role !== 'error').length;
  const userMessages = messages.filter((m) => m.role === 'user');
  const aiMessages = messages.filter((m) => m.role === 'assistant');
  const totalWords = messages.reduce((acc, m) => acc + countWords(m.content), 0);
  const avgResponseLength =
    aiMessages.length > 0
      ? Math.round(totalWords / aiMessages.length)
      : 0;
  const totalTokens = messages.reduce(
    (acc, m) => acc + (m.tokenCount || estimateTokens(m.content)),
    0
  );

  const modelUsage: Record<string, number> = {};
  messages.forEach((m) => {
    if (m.model) {
      modelUsage[m.model] = (modelUsage[m.model] || 0) + 1;
    }
  });
  const mostUsedModel = Object.entries(modelUsage).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const sessionDuration =
    messages.length > 1
      ? messages[messages.length - 1].timestamp - messages[0].timestamp
      : 0;
  const durationStr =
    sessionDuration > 3600000
      ? `${(sessionDuration / 3600000).toFixed(1)}h`
      : sessionDuration > 60000
        ? `${(sessionDuration / 60000).toFixed(0)}m`
        : `${(sessionDuration / 1000).toFixed(0)}s`;

  const stats = [
    { label: 'Total Messages', value: totalMessages },
    { label: 'User Messages', value: userMessages.length },
    { label: 'AI Responses', value: aiMessages.length },
    { label: 'Total Words', value: totalWords.toLocaleString() },
    { label: 'Avg Response Length', value: `${avgResponseLength} words` },
    { label: 'Estimated Tokens', value: totalTokens.toLocaleString() },
    { label: 'Most Used Model', value: mostUsedModel?.[0] || 'N/A' },
    { label: 'Session Duration', value: durationStr },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            Conversation Statistics
          </DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground mb-3">
          {sessionName}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg bg-muted/50 border"
            >
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {stat.label}
              </div>
              <div className="text-sm font-semibold tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        {mostUsedModel && (
          <div className="mt-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              Token Usage Distribution
            </div>
            <div className="flex items-end gap-1 h-16">
              {aiMessages.slice(-10).map((m, i) => {
                const tokens = m.tokenCount || estimateTokens(m.content);
                const maxTokens = Math.max(
                  ...aiMessages.slice(-10).map(
                    (msg) => msg.tokenCount || estimateTokens(msg.content)
                  )
                );
                const height = Math.max(
                  8,
                  (tokens / maxTokens) * 60
                );
                return (
                  <TooltipProvider key={m.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height }}
                          className="flex-1 bg-violet-500/60 rounded-t hover:bg-violet-500 transition-colors cursor-pointer"
                          transition={{ delay: i * 0.05 }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {tokens} tokens
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Chat Templates Section (for sidebar)
// ---------------------------------------------------------------------------
function ChatTemplatesSection({
  onSelect,
}: {
  onSelect: (template: (typeof CHAT_TEMPLATES)[number]) => void;
}) {
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Templates
        </span>
      </div>
      <div className="space-y-0.5 px-1">
        {CHAT_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer hover:bg-accent group"
            >
              <div
                className={`h-7 w-7 rounded-md bg-gradient-to-br ${template.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium">{template.name}</span>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message Bubble (with actions menu, reactions, bookmarks, wordcount, quick replies, sharing)
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
  reactions,
  onToggleReaction,
  bookmarks,
  onToggleBookmark,
  onQuickReply,
  onShare,
  isLastAssistant,
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
  reactions: Record<string, Record<string, number>>;
  onToggleReaction: (messageId: string, emoji: string) => void;
  bookmarks: Set<string>;
  onToggleBookmark: (messageId: string) => void;
  onQuickReply?: (text: string) => void;
  onShare?: (message: { id: string; role: string; content: string }) => void;
  isLastAssistant?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isAssistant = message.role === 'assistant';
  const isBookmarked = bookmarks.has(message.id);

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
          {isBookmarked && (
            <BookmarkCheck className="h-3 w-3 text-amber-400" />
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
                <DropdownMenuItem onClick={() => onToggleBookmark(message.id)}>
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                </DropdownMenuItem>
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(message)}>
                    <Share2 className="h-4 w-4" />
                    Share
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
          {/* User message bookmark */}
          {isUser && (
            <button
              onClick={() => onToggleBookmark(message.id)}
              className={`transition-colors cursor-pointer ${isBookmarked ? 'text-amber-400' : 'hover:text-foreground'}`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-3 w-3" />
              ) : (
                <Bookmark className="h-3 w-3" />
              )}
            </button>
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

        {/* Word count & reading time for assistant messages */}
        {isAssistant && !isStreaming && message.content && (
          <div className="mt-1">
            <WordCountInfo content={message.content} />
          </div>
        )}

        {/* Reactions for assistant messages */}
        {isAssistant && !isStreaming && message.content && (
          <ReactionBar
            messageId={message.id}
            reactions={reactions}
            onToggleReaction={onToggleReaction}
          />
        )}

        {/* Quick replies for last assistant message */}
        {isLastAssistant && !isStreaming && message.content && onQuickReply && (
          <QuickReplies onSelect={onQuickReply} />
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
// Bookmarks Panel
// ---------------------------------------------------------------------------
function BookmarksPanel({
  messages,
  bookmarks,
  onClose,
  onJumpToMessage,
}: {
  messages: Message[];
  bookmarks: Set<string>;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
}) {
  const bookmarkedMessages = messages.filter((m) => bookmarks.has(m.id));

  return (
    <Dialog open onClose={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-amber-400" />
            Bookmarked Messages
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          {bookmarkedMessages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">
              <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No bookmarked messages yet</p>
              <p className="text-xs mt-1">
                Click the bookmark icon on any message to save it
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {bookmarkedMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    onJumpToMessage(msg.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4 shrink-0 ${
                        msg.role === 'user'
                          ? 'border-violet-500/30 text-violet-400'
                          : 'border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-3">
                    {msg.content}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Drag & Drop Overlay
// ---------------------------------------------------------------------------
function DragDropOverlay({
  isDragging,
}: {
  isDragging: boolean;
}) {
  if (!isDragging) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none"
    >
      <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-violet-500 bg-violet-500/5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <FileUp className="h-12 w-12 text-violet-400" />
        </motion.div>
        <p className="text-sm font-medium text-violet-300">
          Drop files here
        </p>
        <p className="text-xs text-muted-foreground">
          Images, PDFs, code files supported
        </p>
      </div>
    </motion.div>
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
  folders,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveSessionToFolder,
  sessionFolders,
  onSelectTemplate,
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
  folders: string[];
  onCreateFolder: (name: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (name: string) => void;
  onMoveSessionToFolder: (sessionId: string, folderName: string | null) => void;
  sessionFolders: Record<string, string | null>;
  onSelectTemplate: (template: (typeof CHAT_TEMPLATES)[number]) => void;
}) {
  const { chatSessions, currentSessionId } = useVoiceDevStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showFolders, setShowFolders] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const activeSessions = chatSessions.filter(
    (s) => !archivedSessionIds.has(s.id)
  );
  const archivedSessions = chatSessions.filter((s) =>
    archivedSessionIds.has(s.id)
  );

  // Get sessions for a folder
  const getSessionsInFolder = (folderName: string) => {
    return activeSessions.filter(
      (s) => sessionFolders[s.id] === folderName
    );
  };

  // Get unorganized sessions (not in any folder)
  const unorganizedSessions = activeSessions.filter(
    (s) => !sessionFolders[s.id]
  );

  const sortedSessions = (sessions: typeof activeSessions) => {
    return [...sessions].sort((a, b) => {
      const aPinned = pinnedSessionIds.has(a.id);
      const bPinned = pinnedSessionIds.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  };

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

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const getProviderInfo = (providerId: string) => {
    return PROVIDERS.find((p) => p.id === providerId);
  };

  const displayedSessions = showArchived
    ? archivedSessions
    : unorganizedSessions;

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
          {/* Folders toggle */}
          {!showArchived && (
            <Collapsible open={showFolders} onOpenChange={setShowFolders}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Folders
                  </span>
                  {folders.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {folders.length}
                    </Badge>
                  )}
                  <ChevronRight
                    className={`h-3 w-3 ml-auto text-muted-foreground/50 transition-transform ${showFolders ? 'rotate-90' : ''}`}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5 mt-1">
                  {folders.map((folderName) => {
                    const folderSessions = getSessionsInFolder(folderName);
                    return (
                      <Collapsible key={folderName}>
                        <CollapsibleTrigger asChild>
                          <div className="group w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
                            <Folder className="h-3.5 w-3.5 text-violet-400" />
                            <span className="text-xs font-medium flex-1 truncate">
                              {folderName}
                            </span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                              {folderSessions.length}
                            </Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {folderSessions.length === 0 ? (
                            <div className="pl-7 text-[10px] text-muted-foreground/50 py-1">
                              Empty
                            </div>
                          ) : (
                            <div className="pl-2 space-y-0.5">
                              {sortedSessions(folderSessions).map((session) => (
                                <SessionItem
                                  key={session.id}
                                  session={session}
                                  isActive={session.id === currentSessionId}
                                  isPinned={pinnedSessionIds.has(session.id)}
                                  isArchived={false}
                                  provider={getProviderInfo(session.provider)}
                                  lastMessage={session.messages[session.messages.length - 1]}
                                  editingId={editingId}
                                  editName={editName}
                                  onSelect={onSessionSelect}
                                  onDoubleClick={handleDoubleClick}
                                  onSetEditingId={setEditingId}
                                  onSetEditName={setEditName}
                                  onRenameSubmit={handleRenameSubmit}
                                  onTogglePin={onTogglePin}
                                  onToggleArchive={onToggleArchive}
                                  onDelete={onDeleteSession}
                                  onMoveToFolder={onMoveSessionToFolder}
                                  folders={folders}
                                  currentFolder={sessionFolders[session.id]}
                                />
                              ))}
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                  {showNewFolderInput ? (
                    <div className="flex items-center gap-1 px-2 py-1">
                      <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="Folder name..."
                        className="h-6 text-xs border-violet-500"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 cursor-pointer"
                        onClick={handleCreateFolder}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 cursor-pointer"
                        onClick={() => {
                          setShowNewFolderInput(false);
                          setNewFolderName('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewFolderInput(true)}
                      className="w-full flex items-center gap-2 px-3 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                    >
                      <FolderPlus className="h-3 w-3" />
                      New Folder
                    </button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Templates toggle */}
          {!showArchived && (
            <Collapsible open={showTemplates} onOpenChange={setShowTemplates}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Templates
                  </span>
                  <ChevronRight
                    className={`h-3 w-3 ml-auto text-muted-foreground/50 transition-transform ${showTemplates ? 'rotate-90' : ''}`}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5 mt-1">
                  {CHAT_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer hover:bg-accent"
                      >
                        <div
                          className={`h-6 w-6 rounded-md bg-gradient-to-br ${template.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium">
                          {template.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {showArchived && (
            <div className="px-3 py-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Archived
              </span>
            </div>
          )}

          {!showArchived && unorganizedSessions.length > 0 && folders.length > 0 && (
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                Unorganized
              </span>
            </div>
          )}

          {displayedSessions.length === 0 && !showArchived && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          )}
          {displayedSessions.length === 0 && showArchived && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No archived sessions
            </div>
          )}

          {sortedSessions(displayedSessions).map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              isPinned={pinnedSessionIds.has(session.id)}
              isArchived={archivedSessionIds.has(session.id)}
              provider={getProviderInfo(session.provider)}
              lastMessage={session.messages[session.messages.length - 1]}
              editingId={editingId}
              editName={editName}
              onSelect={onSessionSelect}
              onDoubleClick={handleDoubleClick}
              onSetEditingId={setEditingId}
              onSetEditName={setEditName}
              onRenameSubmit={handleRenameSubmit}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onDelete={onDeleteSession}
              onMoveToFolder={onMoveSessionToFolder}
              folders={folders}
              currentFolder={sessionFolders[session.id]}
            />
          ))}
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
// Session Item (extracted for reuse)
// ---------------------------------------------------------------------------
function SessionItem({
  session,
  isActive,
  isPinned,
  isArchived,
  provider,
  lastMessage,
  editingId,
  editName,
  onSelect,
  onDoubleClick,
  onSetEditingId,
  onSetEditName,
  onRenameSubmit,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onMoveToFolder,
  folders,
  currentFolder,
}: {
  session: { id: string; name: string; provider: string; messages: Message[] };
  isActive: boolean;
  isPinned: boolean;
  isArchived: boolean;
  provider: { name: string; color: string } | undefined;
  lastMessage: Message | undefined;
  editingId: string | null;
  editName: string;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string, name: string) => void;
  onSetEditingId: (id: string | null) => void;
  onSetEditName: (name: string) => void;
  onRenameSubmit: () => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder: (sessionId: string, folderName: string | null) => void;
  folders: string[];
  currentFolder: string | null;
}) {
  return (
    <div
      onClick={() => onSelect(session.id)}
      onDoubleClick={() => onDoubleClick(session.id, session.name)}
      className={`group relative flex flex-col gap-1 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
        isActive
          ? 'bg-violet-500/10 border-l-2 border-violet-500'
          : 'hover:bg-accent'
      }`}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <MoreHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(session.id);
                }}
              >
                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                {isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive(session.id);
                }}
              >
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
              {folders.length > 0 && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Folder className="h-4 w-4" />
                    Move to Folder
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToFolder(session.id, null);
                      }}
                    >
                      <Folder className="h-4 w-4" />
                      {currentFolder ? 'Remove from Folder' : 'No Folder'}
                    </DropdownMenuItem>
                    {folders.map((f) => (
                      <DropdownMenuItem
                        key={f}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToFolder(session.id, f);
                        }}
                      >
                        <Folder className="h-4 w-4" />
                        {f}
                        {currentFolder === f && <Check className="h-4 w-4 ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Editable name */}
      {editingId === session.id ? (
        <Input
          value={editName}
          onChange={(e) => onSetEditName(e.target.value)}
          onBlur={onRenameSubmit}
          onKeyDown={(e) => e.key === 'Enter' && onRenameSubmit()}
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
            {provider.name}/{session.provider === 'openai' || session.provider === 'anthropic' ? session.model.slice(0, 20) : session.model.slice(0, 15)}
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
  const chatAreaRef = useRef<HTMLDivElement>(null);

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

  // ===== NEW FEATURE STATE =====

  // 1. Reactions
  const [reactions, setReactions] = useState<
    Record<string, Record<string, number>>
  >({});

  // 2. Bookmarks
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  // 5. Image generation
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ messageId: string; data: string }>
  >([]);

  // 6. Voice input
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // 7. Chat folders
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS);
  const [sessionFolders, setSessionFolders] = useState<
    Record<string, string | null>
  >({});

  // 9. Auto-summarize
  const [conversationSummary, setConversationSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // 12. Drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<
    Array<{ name: string; type: string; content: string; preview?: string }>
  >([]);

  // 13. Stats panel
  const [statsOpen, setStatsOpen] = useState(false);

  const currentSession = chatSessions.find((s) => s.id === currentSessionId);

  // Load from localStorage
  useEffect(() => {
    try {
      const pinned = localStorage.getItem('voicedev-pinned-sessions');
      const archived = localStorage.getItem('voicedev-archived-sessions');
      const bookmarkData = localStorage.getItem('voicedev-bookmarks');
      const reactionData = localStorage.getItem('voicedev-reactions');
      const folderData = localStorage.getItem('voicedev-folders');
      const sessionFolderData = localStorage.getItem('voicedev-session-folders');
      const imageData = localStorage.getItem('voicedev-generated-images');
      if (pinned) setPinnedSessionIds(new Set(JSON.parse(pinned)));
      if (archived) setArchivedSessionIds(new Set(JSON.parse(archived)));
      if (bookmarkData) setBookmarks(new Set(JSON.parse(bookmarkData)));
      if (reactionData) setReactions(JSON.parse(reactionData));
      if (folderData) setFolders(JSON.parse(folderData));
      if (sessionFolderData) setSessionFolders(JSON.parse(sessionFolderData));
      if (imageData) setGeneratedImages(JSON.parse(imageData));
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
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

  useEffect(() => {
    localStorage.setItem(
      'voicedev-bookmarks',
      JSON.stringify([...bookmarks])
    );
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('voicedev-reactions', JSON.stringify(reactions));
  }, [reactions]);

  useEffect(() => {
    localStorage.setItem('voicedev-folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(
      'voicedev-session-folders',
      JSON.stringify(sessionFolders)
    );
  }, [sessionFolders]);

  useEffect(() => {
    localStorage.setItem(
      'voicedev-generated-images',
      JSON.stringify(generatedImages)
    );
  }, [generatedImages]);

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

  // ---- NEW FEATURE HANDLERS ----

  // Toggle reaction
  const handleToggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      setReactions((prev) => {
        const msgReactions = { ...(prev[messageId] || {}) };
        msgReactions[emoji] = (msgReactions[emoji] || 0) > 0 ? 0 : 1;
        return { ...prev, [messageId]: msgReactions };
      });
    },
    []
  );

  // Toggle bookmark
  const handleToggleBookmark = useCallback((messageId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
        toast.info('Bookmark removed');
      } else {
        next.add(messageId);
        toast.success('Message bookmarked');
      }
      return next;
    });
  }, []);

  // Jump to message (for bookmarks/pins)
  const handleJumpToMessage = useCallback((messageId: string) => {
    setTimeout(() => {
      const el = document.getElementById(`message-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-amber-400', 'rounded-xl');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-amber-400', 'rounded-xl');
        }, 2000);
      }
    }, 100);
  }, []);

  // Voice transcript
  const handleVoiceTranscript = useCallback((text: string) => {
    setInputValue((prev) => (prev ? `${prev} ${text}` : text));
    textareaRef.current?.focus();
  }, []);

  // Folder management
  const handleCreateFolder = useCallback((name: string) => {
    setFolders((prev) => [...prev, name]);
    toast.success(`Folder "${name}" created`);
  }, []);

  const handleRenameFolder = useCallback(
    (oldName: string, newName: string) => {
      setFolders((prev) =>
        prev.map((f) => (f === oldName ? newName : f))
      );
      setSessionFolders((prev) => {
        const next: typeof prev = {};
        Object.entries(prev).forEach(([k, v]) => {
          next[k] = v === oldName ? newName : v;
        });
        return next;
      });
      toast.success('Folder renamed');
    },
    []
  );

  const handleDeleteFolder = useCallback(
    (name: string) => {
      setFolders((prev) => prev.filter((f) => f !== name));
      setSessionFolders((prev) => {
        const next: typeof prev = {};
        Object.entries(prev).forEach(([k, v]) => {
          next[k] = v === name ? null : v;
        });
        return next;
      });
      toast.info(`Folder "${name}" deleted`);
    },
    []
  );

  const handleMoveSessionToFolder = useCallback(
    (sessionId: string, folderName: string | null) => {
      setSessionFolders((prev) => ({
        ...prev,
        [sessionId]: folderName,
      }));
      toast.success(
        folderName
          ? `Moved to "${folderName}"`
          : 'Removed from folder'
      );
    },
    []
  );

  // Select template
  const handleSelectTemplate = useCallback(
    (template: (typeof CHAT_TEMPLATES)[number]) => {
      updateSettings({ systemPrompt: template.systemPrompt });
      const sessionId = createSession();
      setInputValue(template.suggestedMessage);
      textareaRef.current?.focus();
      toast.success(`Template "${template.name}" applied`);
    },
    [createSession, updateSettings]
  );

  // Auto-summarize
  const handleSummarize = useCallback(async () => {
    if (!currentSession || isSummarizing) return;
    const messages = currentSession.messages.filter(
      (m) => m.role !== 'error' && m.content
    );
    if (messages.length < 5) {
      toast.info('Need at least 5 messages to summarize');
      return;
    }

    setIsSummarizing(true);
    try {
      const conversationText = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 300)}`)
        .join('\n\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Summarize this conversation in 3-5 concise bullet points. Focus on key topics, decisions, and outcomes.',
            },
            { role: 'user', content: conversationText },
          ],
          provider: currentSession.provider || 'openai',
          model: currentSession.model || 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 512,
          stream: false,
        }),
      });

      const data = await res.json();
      const summary =
        data.choices?.[0]?.message?.content || 'Failed to generate summary';
      setConversationSummary(summary);
      toast.success('Summary generated');
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  }, [currentSession, isSummarizing]);

  // Share message
  const handleShareMessage = useCallback(
    (msg: { id: string; role: string; content: string }) => {
      const timestamp = formatTime(Date.now());
      const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
      const header = `Shared from VoiceDev 2.0 — ${currentSession?.name || 'Chat'}\n${'─'.repeat(40)}\n\n`;
      const formatted = `${header}${role}:\n\n${msg.content}\n\n${'─'.repeat(40)}\n${timestamp}`;

      navigator.clipboard.writeText(formatted);
      toast.success('Message copied to clipboard');
    },
    [currentSession]
  );

  // Quick reply
  const handleQuickReply = useCallback((text: string) => {
    setInputValue(text);
    textareaRef.current?.focus();
  }, []);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const newFile = {
          name: file.name,
          type: file.type,
          content: content.slice(0, 10000),
          preview: file.type.startsWith('image/') ? content : undefined,
        };
        setDroppedFiles((prev) => [...prev, newFile]);
        toast.success(`File "${file.name}" attached`);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // ---- EXISTING HANDLERS ----

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

    // Include dropped files in the message
    let fullContent = trimmed;
    if (droppedFiles.length > 0) {
      const fileContent = droppedFiles
        .map(
          (f) =>
            `\n\n[${f.name}]\n${f.preview ? '(image attached)' : f.content.slice(0, 2000)}`
        )
        .join('\n');
      fullContent += fileContent;
      setDroppedFiles([]);
    }

    // Add user message
    const userMsg = {
      id: generateId(),
      role: 'user' as const,
      content: fullContent,
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
      { role: 'user', content: fullContent },
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
    droppedFiles,
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

  // Search result click
  const handleSearchResultClick = useCallback(
    (sessionId: string, messageId: string) => {
      setCurrentSession(sessionId);
      setTimeout(() => {
        const el = document.getElementById(`message-${messageId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      const menuBtn = document.querySelector(
        '[data-mobile-menu-trigger]'
      ) as HTMLElement;
      menuBtn?.click();
    }
  };

  // Group messages by role for styling
  const messages = currentSession?.messages || [];
  const isEmpty = messages.length === 0;
  const showSummarizeButton = messages.length >= 20 && !isStreaming;

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
    folders,
    onCreateFolder: handleCreateFolder,
    onRenameFolder: handleRenameFolder,
    onDeleteFolder: handleDeleteFolder,
    onMoveSessionToFolder: handleMoveSessionToFolder,
    sessionFolders,
    onSelectTemplate: handleSelectTemplate,
  };

  // Check if current model is an image model
  const currentModelIsImage = isImageModel(currentSession?.model);

  return (
    <div className="flex h-full relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && <DragDropOverlay isDragging />}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col border-r bg-card transition-all duration-300 z-10 ${
          sidebarOpen ? 'w-[280px]' : 'w-0 overflow-hidden'
        }`}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Main Chat Area ── */}
      <main
        ref={chatAreaRef}
        className="flex-1 flex flex-col min-w-0 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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

          {/* Pinned messages count */}
          {pinnedMessageIds.size > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 cursor-pointer"
                    onClick={() => {
                      const firstPin = [...pinnedMessageIds][0];
                      handleJumpToMessage(firstPin);
                    }}
                  >
                    <Pin className="h-2.5 w-2.5 mr-0.5 text-violet-400" />
                    {pinnedMessageIds.size} pinned
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Click to jump to first pinned message
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

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

          {/* Bookmarks */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setBookmarksOpen(true)}
                >
                  <Badge
                    variant="secondary"
                    className={`absolute -top-1 -right-1 text-[8px] h-3 min-w-3 px-0.5 ${bookmarks.size > 0 ? 'bg-amber-500 text-white' : ''}`}
                  >
                    {bookmarks.size || ''}
                  </Badge>
                  <Bookmark className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bookmarks</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Stats */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setStatsOpen(true)}
                  disabled={messages.length === 0}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Conversation Statistics</TooltipContent>
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
              {/* Pinned messages indicator */}
              {pinnedMessageIds.size > 0 && (
                <div className="mx-4 mb-2 flex items-center gap-2">
                  <Pin className="h-3 w-3 text-violet-400" />
                  <span className="text-[10px] text-muted-foreground">
                    {pinnedMessageIds.size} pinned message{pinnedMessageIds.size !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Auto-summarize button / summary */}
              {showSummarizeButton && (
                <ConversationSummary
                  summary={conversationSummary}
                  isGenerating={isSummarizing}
                  onSummarize={handleSummarize}
                />
              )}

              {/* Dropped files preview */}
              <AnimatePresence>
                {droppedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-4 mb-2 flex items-center gap-2 flex-wrap"
                  >
                    {droppedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted border text-xs"
                      >
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground max-w-[120px] truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            setDroppedFiles((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => {
                  const isLatestInGroup =
                    idx === messages.length - 1 ||
                    messages[idx + 1]?.role !== msg.role;
                  const isLastMsg = idx === messages.length - 1;
                  const isLastAssistantStreaming =
                    isLastMsg && isStreaming && msg.role === 'assistant';
                  const isLastAssistant =
                    isLastMsg && !isStreaming && msg.role === 'assistant';

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
                      isLastAssistant={isLastAssistant}
                      reactions={reactions}
                      onToggleReaction={handleToggleReaction}
                      bookmarks={bookmarks}
                      onToggleBookmark={handleToggleBookmark}
                      onQuickReply={handleQuickReply}
                      onShare={handleShareMessage}
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
            {/* Image model indicator */}
            {currentModelIsImage && (
              <div className="mb-2 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                <ImagePlus className="h-4 w-4" />
                <span>Image generation mode — describe the image you want</span>
              </div>
            )}

            <div
              className={`flex items-end gap-2 rounded-xl border bg-background px-3 py-2 transition-shadow ${
                isStreaming
                  ? 'shadow-none'
                  : 'focus-within:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
              } ${isDragging ? 'border-violet-500 border-2 bg-violet-500/5' : ''}`}
            >
              {/* Voice input button */}
              <VoiceInputButton onTranscript={handleVoiceTranscript} />

              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentModelIsImage
                    ? 'Describe the image you want to generate...'
                    : 'Type your message...'
                }
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
                {droppedFiles.length > 0 && ` · ${droppedFiles.length} file${droppedFiles.length !== 1 ? 's' : ''} attached`}
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

      {/* Bookmarks Panel */}
      <BookmarksPanel
        messages={messages}
        bookmarks={bookmarks}
        onClose={() => setBookmarksOpen(false)}
        onJumpToMessage={handleJumpToMessage}
      />

      {/* Conversation Statistics */}
      <ConversationStats
        messages={messages}
        sessionName={currentSession?.name || 'Chat'}
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
      />

      {/* Image Lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          open={!!lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
