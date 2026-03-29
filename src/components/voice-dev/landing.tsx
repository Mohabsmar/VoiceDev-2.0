'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
  Search,
  ArrowRight,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { PROVIDERS } from '@/lib/providers';
import { Button } from '@/components/ui/button';

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
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {isInView ? (
        <CounterValue target={target} suffix={suffix} prefix={prefix} />
      ) : (
        `${prefix}0${suffix}`
      )}
    </motion.span>
  );
}

function CounterValue({
  target,
  suffix,
  prefix,
}: {
  target: number;
  suffix: string;
  prefix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {isInView ? (
        <CountUp target={target} suffix={suffix} prefix={prefix} />
      ) : (
        `${prefix}0${suffix}`
      )}
    </motion.span>
  );
}

function CountUp({
  target,
  suffix,
  prefix,
}: {
  target: number;
  suffix: string;
  prefix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span ref={ref}>
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <InternalCounter target={target} suffix={suffix} prefix={prefix} />
        </motion.span>
      ) : (
        `${prefix}0${suffix}`
      )}
    </motion.span>
  );
}

function InternalCounter({
  target,
  suffix,
  prefix,
}: {
  target: number;
  suffix: string;
  prefix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.span
      ref={ref}
      className="tabular-nums"
    >
      {isInView ? (
        <motion.span
          initial={0}
          animate={target}
          transition={{ duration: 2, ease: 'easeOut' }}
          render={({ value }) => `${prefix}${Math.round(value)}${suffix}`}
        />
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
// Landing Page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  const { setCurrentTab } = useVoiceDevStore();

  const features = [
    {
      icon: MessageSquare,
      title: 'Multi-Provider Chat',
      desc: 'Switch between 20+ AI providers seamlessly in one unified interface.',
    },
    {
      icon: Store,
      title: 'Unified Marketplace',
      desc: 'Browse and install tools from Smithery, ClawHub, HuggingFace, npm & PyPI.',
    },
    {
      icon: Zap,
      title: 'Real-Time Streaming',
      desc: 'Watch AI responses stream in real-time with token-by-token display.',
    },
    {
      icon: Code2,
      title: 'Custom Endpoints',
      desc: 'Connect your own API endpoints and custom model deployments.',
    },
    {
      icon: Eye,
      title: 'Voice & Vision',
      desc: 'Upload images, use voice input, and get multimodal AI responses.',
    },
    {
      icon: Shield,
      title: 'Security Scanner',
      desc: 'Built-in security scanning for API keys and data protection.',
    },
  ];

  const stats = [
    { icon: Sparkles, value: 20, suffix: '+', label: 'AI Providers' },
    { icon: Brain, value: 150, suffix: '+', label: 'Verified Models' },
    { icon: Store, value: 6, suffix: '', label: 'Marketplace Sources' },
    { icon: Wrench, value: 250, suffix: '+', label: 'Built-in Tools' },
  ];

  return (
    <div className="min-h-screen overflow-y-auto">
      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 -z-10 gradient-mesh opacity-40 dark:opacity-60" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="glow-text font-bold text-5xl md:text-6xl tracking-tight">
              VoiceDev
            </h1>
            <span className="bg-violet-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
              2.0
            </span>
          </div>

          {/* Tagline */}
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            The AI Agent Platform That Makes You Feel Like You Have a Superpower
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

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="glow-violet bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-8 py-3 text-base font-semibold hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 cursor-pointer"
              onClick={() => setCurrentTab('chat')}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
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
      <section className="py-20 px-4">
        <FadeInSection>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-1">
                    <Icon className="h-6 w-6 text-violet-500" />
                  </div>
                  <span className="text-3xl font-bold">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                    />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </FadeInSection>
      </section>

      {/* ── Story Section ── */}
      <section className="py-20 px-4">
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
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need, One Platform
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            VoiceDev combines the power of every major AI provider with a beautiful,
            unified interface.
          </p>
        </FadeInSection>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <FadeInSection key={feature.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative group h-full rounded-xl border bg-card p-6 hover:border-violet-500/50 transition-colors"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              </FadeInSection>
            );
          })}
        </div>
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
            {PROVIDERS.map((provider) => (
              <motion.div
                key={provider.id}
                whileHover={{ scale: 1.08 }}
                className="relative group"
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md cursor-default"
                  style={{ backgroundColor: provider.color }}
                >
                  <span
                    className="h-2 w-2 rounded-full bg-white/80"
                  />
                  {provider.name}
                </span>
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border">
                  {provider.models.length} model{provider.models.length !== 1 ? 's' : ''}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-4">
        <FadeInSection>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Supercharge Your AI Experience?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of developers who trust VoiceDev as their AI command center.
            </p>
            <Button
              size="lg"
              className="glow-violet bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-8 py-3 text-base font-semibold hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 cursor-pointer"
              onClick={() => setCurrentTab('chat')}
            >
              Get Started for Free
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              No API key required to explore
            </p>
          </div>
        </FadeInSection>
      </section>
    </div>
  );
}
