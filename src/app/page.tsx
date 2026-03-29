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
import DashboardPage from '@/components/voice-dev/dashboard-page';
import HistoryPage from '@/components/voice-dev/history-page';
import WorkflowsPage from '@/components/voice-dev/workflows-page';
import PromptsPage from '@/components/voice-dev/prompts-page';
import ArenaPage from '@/components/voice-dev/arena-page';
import PluginsPage from '@/components/voice-dev/plugins-page';
import NotesPage from '@/components/voice-dev/notes-page';
import FilesPage from '@/components/voice-dev/files-page';
import EditorPage from '@/components/voice-dev/editor-page';
import TerminalPage from '@/components/voice-dev/terminal-page';
import ProfilePage from '@/components/voice-dev/profile-page';
import IntegrationsPage from '@/components/voice-dev/integrations-page';
import TemplatesPage from '@/components/voice-dev/templates-page';

const PAGE_MAP: Record<string, React.ComponentType> = {
  landing: LandingPage,
  chat: ChatPage,
  marketplace: MarketplacePage,
  providers: ProvidersPage,
  settings: SettingsPage,
  dashboard: DashboardPage,
  history: HistoryPage,
  workflows: WorkflowsPage,
  prompts: PromptsPage,
  arena: ArenaPage,
  plugins: PluginsPage,
  notes: NotesPage,
  files: FilesPage,
  editor: EditorPage,
  terminal: TerminalPage,
  profile: ProfilePage,
  integrations: IntegrationsPage,
  templates: TemplatesPage,
};

export default function Home() {
  const { currentTab, setupComplete } = useVoiceDevStore();
  const isLanding = currentTab === 'landing';
  const PageComponent = PAGE_MAP[currentTab];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {!isLanding && <Navigation />}
      <main className={`h-full transition-all duration-300 ${isLanding ? '' : 'md:pl-[220px] pb-14 md:pb-0'}`}>
        {PageComponent ? <PageComponent /> : <LandingPage />}
      </main>
      <CommandPalette />
      <KeyboardShortcuts />
      {!setupComplete && <OnboardingWizard />}
    </div>
  );
}
