
import React from 'react';
import { BrainCircuit } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Reusable scroll handler to avoid HashRouter conflicts
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    try {
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        
        if (element) {
          const headerOffset = 80; 
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
    
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
    } catch (error) {
        console.warn("Footer scroll error:", error);
    }
  };

  return (
    <footer id="footer" className="relative z-10 bg-surface pt-16 pb-8 border-t border-surface-high/30 transition-colors duration-300">
      {/* Ambient Soft Top Gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-surface-high to-transparent" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-surface-high/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-accent" />
              <span className="font-bold text-xl text-text-primary tracking-tight">TEKGUYZ</span>
            </div>
            <p className="type-body text-base text-text-secondary max-w-sm leading-relaxed">
              Custom AI software for growing teams. Less admin, more action.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-4">
             <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider">Company</h4>
             <a href="#about" onClick={(e) => handleScroll(e, '#about')} className="nav-link-animated w-fit">About</a>
             <a href="#solutions" onClick={(e) => handleScroll(e, '#solutions')} className="nav-link-animated w-fit">Solutions</a>
             <a href="#work" onClick={(e) => handleScroll(e, '#work')} className="nav-link-animated w-fit">Work</a>
             <a href="#process" onClick={(e) => handleScroll(e, '#process')} className="nav-link-animated w-fit">Process</a>
          </div>

          {/* Social / Contact */}
           <div className="md:col-span-4 flex flex-col gap-4">
             <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider">Connect</h4>
             <div className="flex flex-col gap-3">
                <a href="#" className="nav-link-animated w-fit">LinkedIn</a>
                <a href="#" className="nav-link-animated w-fit">Twitter / X</a>
                <a href="mailto:hello@tekguyz.com" className="nav-link-animated w-fit">hello@tekguyz.com</a>
             </div>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-8 border-t border-surface-high/30 flex flex-col md:flex-row justify-between items-center gap-4 opacity-80">
           <p className="text-xs text-text-secondary">
             &copy; {currentYear} TEKGUYZ Solutions. All rights reserved.
           </p>
           <div className="flex gap-6">
              <span className="text-xs text-text-secondary hover:text-text-primary cursor-pointer transition-colors hover:underline">Privacy Policy</span>
              <span className="text-xs text-text-secondary hover:text-text-primary cursor-pointer transition-colors hover:underline">Terms of Service</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
