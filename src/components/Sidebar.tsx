import React from 'react';
import { LayoutDashboard, Mic2, Music, Settings, Languages } from 'lucide-react';
import { cn } from '../utils';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'voice', label: 'AI Partner', icon: Mic2 },
    { id: 'songs', label: 'Song Lab', icon: Music },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="hidden sm:flex w-64 bg-zinc-950 border-r border-zinc-800 flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
          <Languages className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">LingoFlow</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              currentView === item.id
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-zinc-500">Pro Learner</p>
            </div>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3" />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Level 12 • 2,450 XP to next</p>
        </div>
      </div>
    </div>
  );
};
