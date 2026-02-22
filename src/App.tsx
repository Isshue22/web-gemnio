import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { VoicePartner } from './components/VoicePartner';
import { SongLab } from './components/SongLab';
import { AppView } from './types';
import { Settings as SettingsIcon, Globe, Shield, Bell, User } from 'lucide-react';

const Settings = () => (
  <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 h-full bg-zinc-950 text-white overflow-y-auto pb-24 sm:pb-8">
    <header>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Settings</h1>
      <p className="text-zinc-400 text-sm sm:text-base">Manage your account preferences and app configuration.</p>
    </header>

    <div className="max-w-3xl space-y-4 sm:space-y-6">
      {[
        { icon: User, label: 'Profile Information', desc: 'Update your personal details and avatar.' },
        { icon: Globe, label: 'Language Preferences', desc: 'Set your native and target languages.' },
        { icon: Bell, label: 'Notifications', desc: 'Configure how you want to be notified.' },
        { icon: Shield, label: 'Privacy & Security', desc: 'Manage your password and data settings.' },
      ].map((item, i) => (
        <div key={i} className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800 flex items-center justify-between hover:bg-zinc-800/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 sm:w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">{item.label}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 line-clamp-1">{item.desc}</p>
            </div>
          </div>
          <button className="text-emerald-500 font-medium text-xs sm:text-sm">Edit</button>
        </div>
      ))}

      <div className="pt-6 border-t border-zinc-800">
        <h3 className="text-lg sm:text-xl font-bold mb-4">API Configuration</h3>
        <div className="bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-sm sm:text-base">Gemini API Key</p>
              <p className="text-xs sm:text-sm text-zinc-500">Currently using system-provided key.</p>
            </div>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/10 text-emerald-500 text-[10px] sm:text-xs font-bold rounded-full border border-emerald-500/20">
              Active
            </span>
          </div>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-[10px] sm:text-xs text-zinc-500 truncate">
            ••••••••••••••••••••••••••••••••
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'voice':
        return <VoicePartner />;
      case 'songs':
        return <SongLab />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 relative">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}
