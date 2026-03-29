'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  User,
  Key,
  Palette,
  Rocket,
  Check,
  Globe,
  Zap,
} from 'lucide-react';
import { useVoiceDevStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to VoiceDev 2.0',
    subtitle: 'Your AI Agent Platform',
    icon: Rocket,
    description: 'Connect to 20+ AI providers, 150+ models, and 250+ tools — all in one beautiful interface.',
  },
  {
    id: 'name',
    title: 'What should we call you?',
    subtitle: 'Personalize your experience',
    icon: User,
  },
  {
    id: 'provider',
    title: 'Choose your first AI provider',
    subtitle: 'You can add more later in Settings',
    icon: Key,
  },
  {
    id: 'theme',
    title: 'Pick your look',
    subtitle: 'Customize your appearance',
    icon: Palette,
  },
  {
    id: 'done',
    title: "You're all set!",
    subtitle: 'Let the AI magic begin',
    icon: Sparkles,
  },
];

const PROVIDER_OPTIONS = [
  { id: 'openai', name: 'OpenAI', color: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic', color: '#d4a574' },
  { id: 'google', name: 'Google AI', color: '#ea4335' },
  { id: 'deepseek', name: 'DeepSeek', color: '#4d6bfe' },
  { id: 'groq', name: 'Groq', color: '#f55036' },
];

export default function OnboardingWizard() {
  const { setSetupComplete, setUserName, updateSettings } = useVoiceDevStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'system'>('dark');

  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === 1 && name.trim()) {
      setUserName(name.trim());
    }
    if (currentStep === 3) {
      updateSettings({ theme: selectedTheme });
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSetupComplete(true);
    }
  };

  const handleSkip = () => {
    if (name.trim()) setUserName(name.trim());
    updateSettings({ theme: selectedTheme });
    setSetupComplete(true);
  };

  const canProceed = () => {
    if (currentStep === 1) return name.trim().length > 0;
    if (currentStep === 4) return true;
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md mx-4">
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 shadow-xl">
              <CardContent className="p-8">
                {/* Step icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 mx-auto"
                >
                  <StepIcon className="h-8 w-8 text-violet-500" />
                </motion.div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-1">{step.title}</h2>
                  <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                </div>

                {/* Step Content */}
                {step.id === 'welcome' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {step.description}
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Globe className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                        <p className="text-xs font-medium">20+ Providers</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Zap className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                        <p className="text-xs font-medium">150+ Models</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Sparkles className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                        <p className="text-xs font-medium">250+ Tools</p>
                      </div>
                    </div>
                  </div>
                )}

                {step.id === 'name' && (
                  <div className="space-y-2">
                    <Input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                      placeholder="Enter your name..."
                      className="text-center text-lg h-12"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      This will be used to personalize your experience
                    </p>
                  </div>
                )}

                {step.id === 'provider' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      Select your primary provider (optional)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {PROVIDER_OPTIONS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProvider(p.id === selectedProvider ? null : p.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedProvider === p.id
                              ? 'border-violet-500 bg-violet-500/10'
                              : 'border-border hover:border-violet-500/50'
                          }`}
                        >
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{p.name}</span>
                          {selectedProvider === p.id && (
                            <Check className="h-4 w-4 text-violet-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step.id === 'theme' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center mb-4">
                      Choose your preferred theme
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', preview: 'bg-white border' },
                        { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-gray-700' },
                        { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-gray-900 border' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedTheme(opt.value as 'dark' | 'light' | 'system')}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedTheme === opt.value
                              ? 'border-violet-500 bg-violet-500/10'
                              : 'border-border hover:border-violet-500/50'
                          }`}
                        >
                          <div className={`h-12 w-full rounded-md ${opt.preview}`} />
                          <span className="text-xs font-medium">{opt.label}</span>
                          {selectedTheme === opt.value && (
                            <Check className="h-3.5 w-3.5 text-violet-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step.id === 'done' && (
                  <div className="text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto"
                    >
                      <Check className="h-10 w-10 text-white" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      {name ? `Welcome aboard, ${name}!` : 'Welcome aboard!'} Your VoiceDev is ready.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-8">
                  {currentStep < totalSteps - 1 ? (
                    <button
                      onClick={handleSkip}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Skip setup
                    </button>
                  ) : (
                    <div />
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg px-6 hover:from-violet-500 hover:to-fuchsia-500 cursor-pointer disabled:opacity-50"
                  >
                    {currentStep === totalSteps - 1 ? (
                      'Start Using VoiceDev'
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-violet-500'
                  : i < currentStep
                    ? 'w-1.5 bg-violet-500/50'
                    : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
