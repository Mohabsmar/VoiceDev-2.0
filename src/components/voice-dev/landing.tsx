'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Store,
  Wrench,
  MessageSquare,
  Shield,
  Zap,
  Eye,
  Code2,
  Mic,
  ArrowRight,
  Star,
  Github,
  Twitter,
  Globe,
  Users,
  Clock,
  Layers,
  Terminal,
  Cpu,
  Palette,
  GitBranch,
  Bot,
  ChevronRight,
  Play,
  Heart,
  ArrowUp,
  ChevronDown,
  Languages,
  RotateCcw,
  Check,
  MessageCircle,
  BookOpen,
  Rocket,
  Award,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ---------------------------------------------------------------------------
// Star Field Background
// ---------------------------------------------------------------------------
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typing Effect
// ---------------------------------------------------------------------------
function TypingText({ texts, className = '' }: { texts: string[]; className?: string }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
          if (displayText.length === currentFullText.length) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setDisplayText(currentFullText.substring(0, displayText.length - 1));
          if (displayText.length === 0) {
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      },
      isDeleting ? 30 : 60
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, texts]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[3px] h-[1em] bg-violet-400 ml-0.5 align-middle"
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Animated Counter
// ---------------------------------------------------------------------------
function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.span ref={ref} className="tabular-nums">
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          {prefix}{target}{suffix}
        </motion.span>
      ) : (
        `${prefix}0${suffix}`
      )}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Fade-in Section
// ---------------------------------------------------------------------------
function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Live Demo Chat Mockup
// ---------------------------------------------------------------------------
function LiveDemoMockup() {
  const messages = [
    {
      role: 'user',
      content: 'Explain quantum computing in simple terms',
      delay: 0.5,
    },
    {
      role: 'assistant',
      content: 'Think of it like this: a regular computer uses bits (0 or 1). A quantum computer uses **qubits** that can be both 0 AND 1 at the same time — like a coin spinning in the air.',
      delay: 2,
    },
    {
      role: 'user',
      content: 'Can you give me a code example?',
      delay: 5,
    },
  ];

  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [streamingText, setStreamingText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    messages.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(index + 1);
        if (msg.role === 'assistant') {
          let charIdx = 0;
          const interval = setInterval(() => {
            charIdx++;
            setStreamingText(msg.content.substring(0, charIdx));
            if (charIdx >= msg.content.length) {
              clearInterval(interval);
              setTimeout(() => setStreamingText(''), 1000);
            }
          }, 25);
        }
      }, msg.delay * 1000);
    });
  }, [isInView]);

  return (
    <div ref={containerRef} className="rounded-xl border bg-card overflow-hidden shadow-2xl shadow-violet-500/5 max-w-md mx-auto">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-muted-foreground font-medium ml-2">VoiceDev Chat</span>
        <Badge variant="secondary" className="text-[9px] ml-auto">GPT-4o</Badge>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[200px]">
        {messages.slice(0, visibleMessages).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-muted'
              }`}
            >
              {msg.role === 'assistant' && i === visibleMessages - 1 && streamingText
                ? streamingText
                : msg.content}
              {msg.role === 'assistant' && i === visibleMessages - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-1.5 h-3 bg-violet-500 ml-0.5 align-middle"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t px-4 py-3 flex items-center gap-2">
        <div className="flex-1 h-8 rounded-md bg-muted/50 flex items-center px-3">
          <span className="text-[10px] text-muted-foreground">Ask anything...</span>
        </div>
        <div className="h-8 w-8 rounded-md bg-violet-600 flex items-center justify-center">
          <ArrowRight className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social Proof
// ---------------------------------------------------------------------------
function SocialProof() {
  const stats = [
    { flag: '🇺🇸', country: 'United States', users: '12.4k' },
    { flag: '🇬🇧', country: 'United Kingdom', users: '8.2k' },
    { flag: '🇩🇪', country: 'Germany', users: '6.1k' },
    { flag: '🇯🇵', country: 'Japan', users: '5.8k' },
    { flag: '🇮🇳', country: 'India', users: '9.7k' },
    { flag: '🇧🇷', country: 'Brazil', users: '4.3k' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.country}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card/50 hover:border-violet-500/30 transition-colors"
        >
          <span className="text-lg">{stat.flag}</span>
          <div>
            <p className="text-xs font-medium">{stat.country}</p>
            <p className="text-[10px] text-muted-foreground">{stat.users} developers</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tech Stack
// ---------------------------------------------------------------------------
function TechStack() {
  const tech = [
    { name: 'Next.js', icon: Globe, color: '#000' },
    { name: 'TypeScript', icon: Code2, color: '#3178c6' },
    { name: 'Tailwind CSS', icon: Palette, color: '#06b6d4' },
    { name: 'Framer Motion', icon: Zap, color: '#ff0055' },
    { name: 'Zustand', icon: Brain, color: '#f5a623' },
    { name: 'shadcn/ui', icon: Layers, color: '#000' },
    { name: 'Recharts', icon: GitBranch, color: '#8884d8' },
    { name: 'Socket.io', icon: Terminal, color: '#010101' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tech.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.name}
            whileHover={{ scale: 1.05, y: -4 }}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 hover:border-violet-500/30 transition-colors"
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: item.color + '15' }}
            >
              <Icon className="h-4 w-4" style={{ color: item.color }} />
            </div>
            <span className="text-sm font-medium">{item.name}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GitHub Stars Counter
// ---------------------------------------------------------------------------
function GitHubStars() {
  const [stars, setStars] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const targetStars = 12847;

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setStars(Math.round(eased * targetStars));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <div ref={ref} className="flex items-center justify-center gap-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full border bg-card/50"
      >
        <Github className="h-5 w-5" />
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span className="font-bold text-lg tabular-nums">{stars.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">stars</span>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Testimonials Section
// ---------------------------------------------------------------------------
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Engineer @ Stripe',
    avatar: 'SC',
    color: '#8b5cf6',
    rating: 5,
    text: 'VoiceDev completely transformed my workflow. Having 20+ AI providers in one interface saves me hours every week. The streaming is buttery smooth.',
  },
  {
    name: 'Alex Rivera',
    role: 'CTO @ BuildKit',
    avatar: 'AR',
    color: '#06b6d4',
    rating: 5,
    text: 'We replaced 5 different AI subscriptions with VoiceDev. The unified marketplace and real-time streaming made our team 3x more productive.',
  },
  {
    name: 'Yuki Tanaka',
    role: 'Full-Stack Dev @ Sony',
    avatar: 'YT',
    color: '#f43f5e',
    rating: 4,
    text: 'The voice input feature is incredible. I can dictate complex prompts while reviewing code. VoiceDev understands context better than any other tool I\'ve tried.',
  },
  {
    name: 'Marcus Johnson',
    role: 'AI Researcher @ MIT',
    avatar: 'MJ',
    color: '#f59e0b',
    rating: 5,
    text: 'As someone who works with multiple AI models daily, VoiceDev is a game-changer. The comparison feature alone makes it worth it. Outstanding work.',
  },
  {
    name: 'Priya Sharma',
    role: 'Dev Lead @ Infosys',
    avatar: 'PS',
    color: '#10b981',
    rating: 5,
    text: 'We onboarded 200 developers to VoiceDev in a week. The onboarding wizard is beautiful and the built-in tools cover 90% of what we need.',
  },
  {
    name: 'David Kim',
    role: 'Indie Hacker',
    avatar: 'DK',
    color: '#6366f1',
    rating: 4,
    text: 'Built my entire SaaS MVP using VoiceDev as my AI pair programmer. The custom endpoints feature let me use local models for sensitive code. Brilliant.',
  },
];

function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const itemsPerView = typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1;
  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const getVisibleTestimonials = () => {
    const start = current * itemsPerView;
    return testimonials.slice(start, start + itemsPerView);
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent pointer-events-none" />
      <FadeInSection>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/50 text-sm mb-4">
            <MessageCircle className="h-3.5 w-3.5 text-violet-500" />
            <span className="font-medium">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Loved by Developers</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See what developers around the world are saying about VoiceDev
          </p>
        </div>
      </FadeInSection>

      <div
        className="max-w-6xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {getVisibleTestimonials().map((t, i) => (
              <motion.div
                key={`${current}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-xl border bg-card p-6 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-3.5 w-3.5 ${
                        idx < t.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === current
                  ? 'w-6 bg-violet-500'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FAQ Section
// ---------------------------------------------------------------------------
const faqItems = [
  {
    question: 'What AI providers does VoiceDev support?',
    answer: 'VoiceDev supports 20+ AI providers including OpenAI, Anthropic (Claude), Google AI (Gemini), DeepSeek, xAI (Grok), Z.ai (GLM), Moonshot AI, MiniMax, Groq, Mistral AI, Cohere, Together AI, OpenRouter, Perplexity, Fireworks AI, SiliconFlow, AI21 Labs, ElevenLabs, Alibaba Qwen, and Replicate. That\'s 150+ models accessible from one interface.',
  },
  {
    question: 'Is VoiceDev free to use?',
    answer: 'Yes! VoiceDev itself is completely free and open source under the MIT License. You only pay for the AI provider API keys you choose to use. We also support free-tier and freemium providers like Groq, Google AI (Gemini Nano), and Cohere (Command Light).',
  },
  {
    question: 'How does the unified marketplace work?',
    answer: 'The VoiceDev Marketplace aggregates tools from 6 major sources: Smithery, ClawHub, HuggingFace, npm, PyPI, and our built-in tool library (42 tools + 12 skills). You can search, install, and manage all your AI tools from a single dashboard with one-click installation.',
  },
  {
    question: 'Can I use my own custom API endpoints?',
    answer: 'Absolutely! VoiceDev supports custom endpoints for self-hosted models. You can add any OpenAI-compatible API endpoint, configure custom headers, and even use proxy servers. This makes it perfect for enterprise deployments with local LLMs.',
  },
  {
    question: 'How does real-time streaming work?',
    answer: 'VoiceDev streams AI responses token-by-token using Server-Sent Events (SSE). Each provider\'s streaming format is normalized so you get the same smooth experience regardless of which AI provider you\'re using. Markdown and code blocks render in real-time as the response arrives.',
  },
  {
    question: 'Is my data secure?',
    answer: 'VoiceDev stores all data locally in your browser using encrypted localStorage. Your API keys never leave your machine — all API calls are made directly from your browser to the provider. We also offer a built-in security scanner that validates API keys and checks for potential issues.',
  },
  {
    question: 'Can I customize the appearance?',
    answer: 'Yes! VoiceDev offers extensive customization including dark/light/system themes, multiple accent colors, adjustable font sizes, code syntax themes (VS2015, GitHub Dark, Monokai, Solarized), custom CSS injection, and chat background options. You can even create model aliases and custom tags.',
  },
  {
    question: 'What is the VoiceDev backup system?',
    answer: 'VoiceDev includes automatic and manual backup features. You can export all your data (chats, settings, API keys, favorites, collections) as JSON, and import it back on any device. Auto-backup runs at configurable intervals, and you can trigger manual backups anytime from Settings.',
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4">
      <FadeInSection>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/50 text-sm mb-4">
            <BookOpen className="h-3.5 w-3.5 text-violet-500" />
            <span className="font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about VoiceDev
          </p>
        </div>
      </FadeInSection>

      <div className="max-w-3xl mx-auto space-y-2">
        {faqItems.map((item, i) => (
          <FadeInSection key={i} delay={i * 0.05}>
            <motion.div
              className="rounded-xl border bg-card overflow-hidden"
              whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
              >
                <span className="font-medium text-sm pr-4">{item.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Changelog Section
// ---------------------------------------------------------------------------
const changelogItems = [
  {
    version: '2.0.0',
    date: 'Jan 2025',
    badge: 'Latest',
    changes: [
      'Completely redesigned UI with dark theme and violet accent',
      '20+ AI providers with 150+ models',
      'Unified marketplace with 6 sources',
      'Real-time token-by-token streaming',
      'Voice input and text-to-speech output',
      'Built-in command palette (Ctrl+K)',
      'Interactive onboarding wizard',
    ],
  },
  {
    version: '1.5.0',
    date: 'Nov 2024',
    badge: 'Stable',
    changes: [
      'Added Anthropic Claude 3.5 support',
      'Marketplace search across npm and PyPI',
      'Custom CSS injection',
      'Chat folder organization',
    ],
  },
  {
    version: '1.0.0',
    date: 'Sep 2024',
    badge: 'Initial',
    changes: [
      'First public release',
      'OpenAI, Google, and Anthropic support',
      'Basic chat with streaming',
      'Session management',
    ],
  },
];

function ChangelogSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
      <FadeInSection>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/50 text-sm mb-4">
            <RotateCcw className="h-3.5 w-3.5 text-violet-500" />
            <span className="font-medium">Changelog</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">What&apos;s New</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Follow our journey building the ultimate AI platform
          </p>
        </div>
      </FadeInSection>

      <div className="max-w-3xl mx-auto space-y-6">
        {changelogItems.map((item, i) => (
          <FadeInSection key={i} delay={i * 0.1}>
            <motion.div
              className="rounded-xl border bg-card p-6 hover:border-violet-500/30 transition-colors"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-violet-500">v{item.version}</span>
                <span className="text-xs text-muted-foreground">{item.date}</span>
                <Badge
                  variant={item.badge === 'Latest' ? 'default' : 'secondary'}
                  className={`text-[10px] ${
                    item.badge === 'Latest'
                      ? 'bg-violet-600 hover:bg-violet-500'
                      : ''
                  }`}
                >
                  {item.badge === 'Latest' && <Rocket className="h-2.5 w-2.5 mr-1" />}
                  {item.badge}
                </Badge>
              </div>
              <ul className="space-y-2">
                {item.changes.map((change, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </motion.div>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Social Links Section
// ---------------------------------------------------------------------------
function SocialLinksSection() {
  const socialLinks = [
    { icon: Github, label: 'GitHub', href: '#', stat: '12.8k stars', color: '#f5f5f5' },
    { icon: Twitter, label: 'Twitter / X', href: '#', stat: '24.5k followers', color: '#1da1f2' },
    { icon: MessageCircle, label: 'Discord', href: '#', stat: '8.2k members', color: '#5865f2' },
  ];

  return (
    <section className="py-16 px-4">
      <FadeInSection>
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">Join the Community</h3>
          <p className="text-sm text-muted-foreground mb-8">
            Connect with developers, share feedback, and stay updated
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl border bg-card hover:border-violet-500/30 transition-colors"
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: link.color + '15' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: link.color === '#f5f5f5' ? 'var(--foreground)' : link.color }} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{link.label}</p>
                    <p className="text-[10px] text-muted-foreground">{link.stat}</p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Language Selector
// ---------------------------------------------------------------------------
function LanguageSelector() {
  const { language, setLanguage } = useVoiceDevStore();
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'ja', label: 'JA' },
    { code: 'zh', label: 'ZH' },
    { code: 'ar', label: 'AR' },
  ];

  return (
    <div className="flex items-center gap-1">
      <Languages className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex items-center gap-0.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded cursor-pointer transition-colors ${
              language === lang.code
                ? 'bg-violet-600 text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Screen
// ---------------------------------------------------------------------------
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const allFeatures = [
    'Loading 20+ AI providers...',
    'Connecting 150+ models...',
    'Preparing marketplace...',
    'Setting up streaming...',
    'Initializing voice engine...',
    'Configuring security...',
    'Building command palette...',
    'Almost ready...',
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
      setProgress(Math.min(Math.round(current), 100));

      const featureIndex = Math.floor((current / 100) * allFeatures.length);
      if (featureIndex < allFeatures.length && featureIndex >= features.length) {
        setFeatures((prev) => [...prev, allFeatures[featureIndex]]);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [allFeatures]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <Bot className="h-12 w-12 text-violet-500" />
          <h1 className="glow-text font-bold text-4xl">VoiceDev</h1>
          <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs px-2 py-0.5">
            2.0
          </Badge>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-64 space-y-3">
        <Progress value={progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground text-center tabular-nums">{progress}%</p>
      </div>

      {/* Feature loading list */}
      <div className="mt-8 space-y-1.5 max-w-xs">
        <AnimatePresence>
          {features.map((feature, i) => (
            <motion.div
              key={`${feature}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Check className="h-3 w-3 text-green-500" />
              {feature}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  const { setCurrentTab, loadingComplete, setLoadingComplete } = useVoiceDevStore();
  const [showLoading, setShowLoading] = useState(!loadingComplete);
  const heroRef = useRef<HTMLElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    setLoadingComplete(true);
  }, [setLoadingComplete]);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setShowBackToTop(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'Multi-Provider Chat',
      desc: 'Switch between 20+ AI providers seamlessly in one unified interface.',
      subFeatures: ['Unified inbox for all providers', 'Auto-fallback between models', 'Conversation history sync'],
    },
    {
      icon: Store,
      title: 'Unified Marketplace',
      desc: 'Browse and install tools from Smithery, ClawHub, HuggingFace, npm & PyPI.',
      subFeatures: ['One-click installation', 'Auto dependency resolution', 'Version management'],
    },
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      desc: 'Watch AI responses stream in real-time with token-by-token display.',
      subFeatures: ['Token-by-token rendering', 'Markdown support', 'Code syntax highlighting'],
    },
    {
      icon: Code2,
      title: 'Custom Endpoints',
      desc: 'Connect your own API endpoints and custom model deployments.',
      subFeatures: ['Self-hosted models', 'Custom API routes', 'Proxy support'],
    },
    {
      icon: Eye,
      title: 'Voice & Vision',
      desc: 'Upload images, use voice input, and get multimodal AI responses.',
      subFeatures: ['Image understanding', 'Voice-to-text input', 'Text-to-speech output'],
    },
    {
      icon: Shield,
      title: 'Security Scanner',
      desc: 'Built-in security scanning for API keys and data protection.',
      subFeatures: ['Key validation', 'Connection testing', 'Encryption support'],
    },
  ];

  const stats = [
    { icon: Sparkles, value: 20, suffix: '+', label: 'AI Providers' },
    { icon: Brain, value: 150, suffix: '+', label: 'Verified Models' },
    { icon: Store, value: 6, suffix: '', label: 'Marketplace Sources' },
    { icon: Wrench, value: 250, suffix: '+', label: 'Built-in Tools' },
  ];

  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <div className={`min-h-screen overflow-y-auto ${showLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        {/* ── Hero Section ── */}
        <section ref={heroRef} className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
          {/* Gradient mesh */}
          <div className="absolute inset-0 -z-10 gradient-mesh opacity-40 dark:opacity-60" />

          {/* Floating gradient orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-[10%] w-72 h-72 bg-violet-500/15 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 right-[10%] w-80 h-80 bg-fuchsia-500/15 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
          />

          {/* Star field */}
          <StarField />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-6"
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 className="glow-text font-bold text-5xl md:text-7xl tracking-tight">
                VoiceDev
              </h1>
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                2.0
              </span>
            </div>

            {/* Typing tagline */}
            <motion.p
              className="text-xl md:text-2xl text-foreground/80 max-w-2xl h-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <TypingText
                texts={[
                  'The AI Agent Platform That Makes You Feel Like You Have a Superpower',
                  '20+ Providers. 150+ Models. One Interface.',
                  'Built for Developers, by a Developer.',
                ]}
              />
            </motion.p>

            {/* Subtitle */}
            <motion.p
              className="text-sm text-muted-foreground/80 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Built by an 11-year-old developer from Egypt who refused to believe age was a limit.
            </motion.p>

            {/* GitHub Stars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <GitHubStars />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center gap-3 flex-wrap justify-center"
            >
              <Button
                size="lg"
                className="glow-violet bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-8 py-3 text-base font-semibold hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 cursor-pointer"
                onClick={() => setCurrentTab('chat')}
              >
                <Play className="h-4 w-4 mr-2" />
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-6 py-3 cursor-pointer"
                onClick={() => setCurrentTab('providers')}
              >
                <Cpu className="h-4 w-4 mr-2" />
                Browse Providers
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-5 h-8 border-2 border-muted-foreground/30 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-muted-foreground/50 rounded-full mt-1.5" />
            </div>
          </motion.div>
        </section>

        {/* ── Animated Stats ── */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
          <FadeInSection>
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="flex flex-col items-center gap-2 text-center p-4 rounded-xl"
                  >
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-1">
                      <Icon className="h-6 w-6 text-violet-500" />
                    </div>
                    <span className="text-3xl font-bold">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </span>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </FadeInSection>
        </section>

        {/* ── Live Demo Section ── */}
        <section className="py-20 px-4">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              See VoiceDev in Action
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Watch how VoiceDev streams responses from multiple AI providers in real-time
            </p>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <LiveDemoMockup />
          </FadeInSection>
        </section>

        {/* ── Testimonials Section ── */}
        <TestimonialsSection />

        {/* ── Story Section ── */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent pointer-events-none" />
          <FadeInSection>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                The Story Behind VoiceDev
              </h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  It started in a small apartment in Cairo, Egypt. A kid barely old enough to
                  reach the keyboard dreamed of building something that could talk to every AI in
                  the world — not just one, but all of them. While other kids played video games,
                  this 11-year-old developer stayed up late reading API documentation and
                  building chatbots.
                </p>
                <p>
                  The problem was always the same: every AI provider had its own interface, its
                  own pricing, its own quirks. Switching between ChatGPT, Claude, Gemini, and
                  dozens of others meant juggling tabs, losing context, and wasting time.{' '}
                  <strong className="text-foreground">
                    &quot;What if there was one place for all of them?&quot;
                  </strong>
                </p>
                <p>
                  VoiceDev was born from that simple question. What started as a weekend project
                  became an obsession — a platform that connects 20+ AI providers, 150+ models,
                  and 250+ tools into one seamless experience. No more tab switching. No more
                  lost context. Just pure AI power at your fingertips.
                </p>
                <p className="text-foreground font-medium italic">
                  &quot;Age is just a number. Code doesn&apos;t care how old you are.&quot;
                </p>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* ── Feature Showcase Grid ── */}
        <section className="py-20 px-4">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Everything You Need, One Platform
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              VoiceDev combines the power of every major AI provider with a beautiful,
              unified interface.
            </p>
          </FadeInSection>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <FadeInSection key={feature.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative group h-full rounded-xl border bg-card p-6 hover:border-violet-500/50 transition-all cursor-default"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                        <Icon className="h-5 w-5 text-violet-500" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {feature.desc}
                      </p>
                      {/* Sub-features */}
                      <div className="space-y-1.5">
                        {feature.subFeatures.map((sub) => (
                          <div key={sub} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ChevronRight className="h-3 w-3 text-violet-500 shrink-0" />
                            {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </FadeInSection>
              );
            })}
          </div>
        </section>

        {/* ── Social Proof Section ── */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
          <FadeInSection>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Trusted by Developers Worldwide</h2>
              <p className="text-muted-foreground">Join developers from across the globe using VoiceDev</p>
            </div>
            <SocialProof />
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-violet-500" />
                <span className="font-medium text-foreground">46,500+</span> developers
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-violet-500" />
                <span className="font-medium text-foreground">2.8M+</span> messages sent
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-violet-500" />
                <span className="font-medium text-foreground">99.9%</span> uptime
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* ── Provider Logo Grid ── */}
        <section className="py-20 px-4">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-center mb-4">
              20+ AI Providers, One Interface
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Connect to all major AI providers and switch between them instantly.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
              {PROVIDERS.map((provider, i) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="relative group"
                >
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md cursor-default"
                    style={{ backgroundColor: provider.color }}
                  >
                    <span className="h-2 w-2 rounded-full bg-white/80" />
                    {provider.name}
                  </span>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border">
                    {provider.models.length} model{provider.models.length !== 1 ? 's' : ''}
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeInSection>
        </section>

        {/* ── Tech Stack Section ── */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
          <FadeInSection>
            <h2 className="text-3xl font-bold text-center mb-4">Built with Modern Tech</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              VoiceDev is built on a rock-solid foundation of industry-leading technologies
            </p>
            <TechStack />
          </FadeInSection>
        </section>

        {/* ── FAQ Section ── */}
        <FAQSection />

        {/* ── Changelog Section ── */}
        <ChangelogSection />

        {/* ── Social Links ── */}
        <SocialLinksSection />

        {/* ── CTA Section ── */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background orbs for CTA */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none" />

          <FadeInSection>
            <div className="relative max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card/50 text-sm mb-6"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                <span className="font-medium">Free to use</span>
                <span className="text-muted-foreground">· No credit card required</span>
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Supercharge Your AI Experience?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of developers who trust VoiceDev as their AI command center.
                Start chatting with 150+ models in seconds.
              </p>

              {/* Video preview placeholder */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative mx-auto mb-8 max-w-lg rounded-xl border overflow-hidden bg-card shadow-xl cursor-pointer group"
                onClick={() => setCurrentTab('chat')}
              >
                <div className="aspect-video bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors"
                    >
                      <Play className="h-8 w-8 text-white ml-1" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">2 min</Badge>
                    <span className="text-xs text-white/80">Quick Start Guide</span>
                  </div>
                </div>
              </motion.div>

              <Button
                size="lg"
                className="glow-violet bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-8 py-3 text-base font-semibold hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 cursor-pointer"
                onClick={() => setCurrentTab('chat')}
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                No API key required to explore · Open Source · MIT License
              </p>
            </div>
          </FadeInSection>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-sm mb-3">Product</h4>
                <div className="space-y-2">
                  {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                    <button key={item} className="block text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Resources</h4>
                <div className="space-y-2">
                  {['Documentation', 'API Reference', 'Examples', 'Blog'].map((item) => (
                    <button key={item} className="block text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Community</h4>
                <div className="space-y-2">
                  {['Discord', 'GitHub', 'Twitter', 'Reddit'].map((item) => (
                    <button key={item} className="block text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Legal</h4>
                <div className="space-y-2">
                  {['Privacy Policy', 'Terms of Service', 'License', 'Security'].map((item) => (
                    <button key={item} className="block text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-500" />
                <span className="font-bold">VoiceDev</span>
                <Badge variant="secondary" className="text-[9px]">2.0</Badge>
              </div>
              <div className="flex items-center gap-4">
                <LanguageSelector />
                {[Github, Twitter, Globe].map((Icon, i) => (
                  <button key={i} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} VoiceDev. Built with{' '}
                <Heart className="inline h-3 w-3 text-red-500" /> in Egypt.
              </p>
            </div>
          </div>
        </footer>

        {/* ── Back to Top Button ── */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="fixed bottom-20 right-6 z-50 h-10 w-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/25 cursor-pointer"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
