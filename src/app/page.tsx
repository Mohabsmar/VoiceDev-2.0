'use client';
import { useVoiceDevStore } from '@/lib/store';
import Navigation from '@/components/voice-dev/navigation';
import LandingPage from '@/components/voice-dev/landing';
import ChatPage from '@/components/voice-dev/chat-page';
import MarketplacePage from '@/components/voice-dev/marketplace-page';
import ProvidersPage from '@/components/voice-dev/providers-page';
import SettingsPage from '@/components/voice-dev/settings-page';
import CommandPalette from '@/components/voice-dev/command-palette';
import OnboardingWizard from '@/components/voice-dev/onboarding-wizard';
import KeyboardShortcuts from '@/components/voice-dev/keyboard-shortcuts';

export default function Home() {
  const { currentTab, setupComplete } = useVoiceDevStore();
  const isLanding = currentTab === 'landing';

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {!isLanding && <Navigation />}
      <main className={`h-full transition-all duration-300 ${
        isLanding ? '' : 'md:pl-16 pb-14 md:pb-0'
      }`}>
        {currentTab === 'landing' && <LandingPage />}
        {currentTab === 'chat' && <ChatPage />}
        {currentTab === 'marketplace' && <MarketplacePage />}
        {currentTab === 'providers' && <ProvidersPage />}
        {currentTab === 'settings' && <SettingsPage />}
      </main>
      <CommandPalette />
      <KeyboardShortcuts />
      {!setupComplete && <OnboardingWizard />}
    </div>
  );
}
