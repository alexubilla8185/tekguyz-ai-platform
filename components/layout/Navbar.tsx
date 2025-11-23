
import React from 'react';
import { Menu, X, BrainCircuit } from 'lucide-react';
import { NavItem } from '../../types';
import { useGlobal } from '../../context/GlobalContext';
import ThemeSelector from '../ui/ThemeSelector';
import { prefetchProjectForm } from '../../utils/prefetch';

const navItems: NavItem[] = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
];

const Navbar: React.FC = () => {
  const { 
    isMobileMenuOpen, 
    setIsMobileMenuOpen,
    setShowProjectFormModal
  } = useGlobal();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Programmatic Scroll Handler to prevent HashRouter collisions
  // and ensure correct sticky header offset.
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    try {
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        
        if (element) {
          const headerOffset = 80; // ~5rem to clear the sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
    
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
    } catch (error) {
        console.warn("Navigation scroll error:", error);
    }

    setIsMobileMenuOpen(false);
  };

  const handleStartProject = () => {
    setIsMobileMenuOpen(false);
    setShowProjectFormModal(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-surface-high transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#hero" 
          onClick={(e) => handleScroll(e, '#hero')}
          className="flex items-center gap-2 font-bold text-xl text-text-primary z-50 relative group btn-press"
          aria-label="TEKGUYZ Home"
        >
          <BrainCircuit className="h-6 w-6 text-accent transition-transform group-hover:rotate-12" aria-hidden="true" />
          <span>TEKGUYZ</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleScroll(e, item.href)}
              className="nav-link-animated"
            >
              {item.label}
            </a>
          ))}
          
          <div className="flex items-center gap-4">
            {/* New Theme & Accent Selector */}
            <ThemeSelector />

            <button
              onClick={() => setShowProjectFormModal(true)}
              onMouseEnter={prefetchProjectForm}
              className="btn-press px-4 py-2 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-accent hover:text-white transition-colors"
            >
              Start Your Project
            </button>
          </div>
        </nav>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center gap-4 z-50 relative">
            {/* Visible on Mobile too */}
            <ThemeSelector />

            <button
              className="btn-press p-2 text-text-secondary hover:text-text-primary"
              onClick={toggleMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 bg-surface border-t border-surface-high shadow-xl md:hidden animate-in slide-in-from-top-5 duration-300 flex flex-col z-40">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4 overflow-y-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-lg font-medium text-text-secondary hover:text-accent py-3 border-b border-surface-high/50"
                onClick={(e) => handleScroll(e, item.href)}
              >
                {item.label}
              </a>
            ))}
             <button
                onClick={handleStartProject}
                onMouseEnter={prefetchProjectForm}
                className="btn-press mt-6 w-full py-4 rounded-xl bg-accent text-white font-bold text-center hover:opacity-90 transition-opacity text-lg shadow-lg shadow-accent/20"
              >
                Start Your Project
              </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
