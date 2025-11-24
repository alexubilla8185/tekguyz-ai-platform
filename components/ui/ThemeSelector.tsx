import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { ACCENT_COLORS } from '../../context/GlobalContext';

const ThemeSelector: React.FC = () => {
  const { theme, toggleTheme, accentColor, setAccentColor } = useGlobal();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-text-secondary hover:bg-surface-high hover:text-accent transition-all duration-300"
        aria-label="Appearance settings"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Palette className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Popup */}
      {isOpen && (
        <div 
            className="absolute right-0 mt-3 w-64 bg-surface border border-surface-high rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200 z-[60]"
            role="dialog"
            aria-label="Appearance options"
        >
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-high">
            <span className="text-sm font-bold text-text-primary">Appearance</span>
            <button 
               onClick={toggleTheme}
               className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-high/30 hover:bg-surface-high text-xs font-medium text-text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-accent"
               aria-label={`Switch to ${theme === 'dark' ? 'True Dark' : 'Dark'} Mode`}
            >
               {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
               {theme === 'dark' ? 'Dark' : 'True Dark'}
            </button>
          </div>

          {/* Accent Palette */}
          <div>
            <span className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-3 block" id="accent-label">Accent Color</span>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-labelledby="accent-label">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setAccentColor(color)}
                  className="group relative w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-text-primary"
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                  aria-checked={accentColor.name === color.name}
                  role="radio"
                  title={color.name}
                >
                  {accentColor.name === color.name && (
                    <Check className="w-4 h-4 text-white drop-shadow-md animate-in zoom-in duration-200" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;