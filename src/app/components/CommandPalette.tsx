import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, LayoutDashboard, FileText, Globe, Settings, Moon, Sun, Plus, X } from 'lucide-react';
import { useTheme } from 'next-themes';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { name: 'Dashboard', icon: LayoutDashboard, category: 'Navigation', action: () => navigate('/dashboard') },
    { name: 'My Vault', icon: FileText, category: 'Navigation', action: () => navigate('/documents') },
    { name: 'Global Docs', icon: Globe, category: 'Navigation', action: () => navigate('/public-documents') },
    { name: 'AI Console', icon: Terminal, category: 'Navigation', action: () => navigate('/chat') },
    { name: 'Settings', icon: Settings, category: 'Navigation', action: () => navigate('/profile') },
    { name: 'Toggle Theme', icon: Moon, category: 'Actions', action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
  ];

  const filtered = actions.filter((act) => act.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      {/* Dialog Box */}
      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-white/5 rounded-xl shadow-2xl overflow-hidden font-mono">
        {/* Search Input */}
        <div className="flex items-center border-b border-white/5 px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-stone-600 uppercase tracking-wider"
            autoFocus
          />
          <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.name}
                  onClick={() => {
                    act.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-stone-400 hover:text-white hover:bg-white/5 rounded-lg text-left transition-colors font-semibold uppercase tracking-wider"
                >
                  <Icon className="w-4 h-4 text-stone-500" />
                  <span>{act.name}</span>
                  <span className="ml-auto text-[9px] text-stone-600 font-mono tracking-widest">{act.category}</span>
                </button>
              );
            })
          ) : (
            <p className="text-[10px] text-stone-600 p-3 uppercase tracking-wider">No commands found.</p>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-zinc-950/60 border-t border-white/5 text-[9px] text-stone-500 flex justify-between items-center font-mono">
          <span>ESC TO CLOSE</span>
          <span>SELECT WITH ENTER</span>
        </div>
      </div>
    </div>
  );
}
