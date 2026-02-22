import React from 'react';
import { LayoutDashboard, Mic2, Music, Settings } from 'lucide-react';
import { cn } from '../utils';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'voice', label: 'AI', icon: Mic2 },
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 px-6 py-3 z-50">
      <nav className="flex items-center justify-between">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              currentView === item.id ? "text-emerald-500" : "text-zinc-500"
            )}
          >
            <item.icon className={cn("w-6 h-6", currentView === item.id && "scale-110")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
