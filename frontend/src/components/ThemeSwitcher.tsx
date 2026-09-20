import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const themes = [
  { id: 'light', name: 'Light', iconColor: 'bg-white border-gray-300' },
  { id: 'dark', name: 'Dark', iconColor: 'bg-slate-900 border-slate-700' },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        title="Change Theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2">
            <h3 className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Themes</h3>
            <div className="space-y-1 mt-1">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded-sm transition-colors ${
                    theme === t.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full border ${t.iconColor}`}></div>
                    <span>{t.name}</span>
                  </div>
                  {theme === t.id && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
