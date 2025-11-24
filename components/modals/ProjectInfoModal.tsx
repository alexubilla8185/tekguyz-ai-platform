
import React from 'react';
import { X, GitBranch, Layers, Clock, BrainCircuit } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const ProjectInfoModal: React.FC = () => {
  const { showProjectInfoModal, setShowProjectInfoModal } = useGlobal();
  const containerRef = useFocusTrap(() => setShowProjectInfoModal(false));

  if (!showProjectInfoModal) return null;

  const techStack = [
    "React 19", "TypeScript", "Tailwind CSS", "Google GenAI SDK", 
    "Gemini Flash 1.5", "Lucide Icons", "React Router DOM", 
    "Intersection Observer", "WebP Optimization"
  ];

  const changelog = [
    {
      version: "v1.0.0",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      title: "Phase 5 - Gold Master",
      items: [
        "SEO Metadata & Open Graph Integration",
        "Semantic HTML Structure (h1-h6 hierarchy)",
        "Accessibility Audit (WCAG 2.1 AA Compliance)",
        "Performance Optimization (RevealOnScroll, Lazy Loading)",
        "Global Micro-interactions & Polish"
      ]
    },
    {
      version: "v0.9.0",
      date: "November 22, 2025",
      title: "Phase 4 - Core Systems",
      items: [
        "Global State Optimization (Context Splitting)",
        "Reliability & Error Boundaries",
        "Asset Handling & Image Optimization",
        "Navigation Scroll Logic Fixes"
      ]
    },
    {
      version: "v0.8.0",
      date: "November 22, 2025",
      title: "Phase 3 - Intelligence Layer",
      items: [
        "Gemini Service Abstraction Layer",
        "Chatbot Bridge Implementation",
        "Context-Aware Form Filling",
        "AI Playground Tools (Audit, Ideas, Refine)"
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-info-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={() => setShowProjectInfoModal(false)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl max-h-[90vh] bg-surface/95 border border-surface-high rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-high bg-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
              <BrainCircuit className="h-6 w-6 text-accent" />
            </div>
            <div>
                <h2 id="project-info-title" className="text-xl font-bold text-text-primary">
                  TEKGUYZ Platform
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono bg-surface-high px-2 py-0.5 rounded text-text-secondary">public</span>
                    <span className="text-xs text-text-secondary">v1.0.0</span>
                </div>
            </div>
          </div>
          <button
            onClick={() => setShowProjectInfoModal(false)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-high rounded-full transition-colors btn-press"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 scroll-smooth">
          
          {/* About Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-xs mb-2">
                <GitBranch className="w-4 h-4" /> About Project
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
                High-Performance AI Consulting Platform
            </h3>
            <p className="text-text-secondary leading-relaxed text-lg">
                TEKGUYZ is a modern web platform designed to help Small and Medium Businesses (SMBs) scope and build custom software solutions. Built on a performance-first architecture, this application bridges the gap between client intent and technical implementation using embedded AI agents.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-surface border border-surface-high">
                    <h4 className="font-bold text-text-primary mb-2">🧠 AI-Powered Intelli-Form</h4>
                    <p className="text-sm text-text-secondary">Multi-step project wizard that uses Generative AI to refine user input and summarize context.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-surface-high">
                    <h4 className="font-bold text-text-primary mb-2">⚡ Performance Optimized</h4>
                    <p className="text-sm text-text-secondary">Aggressive code-splitting, lazy-loading, and intersection-observer animations for 60fps.</p>
                </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-xs mb-2">
                <Layers className="w-4 h-4" /> Tech Stack
            </div>
            <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-surface-high/30 border border-surface-high text-sm font-medium text-text-primary hover:border-accent/50 transition-colors cursor-default">
                        {tech}
                    </span>
                ))}
            </div>
          </section>

          {/* Changelog */}
          <section className="space-y-6">
             <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-xs mb-2">
                <Clock className="w-4 h-4" /> Changelog
            </div>
            <div className="relative border-l border-surface-high ml-3 space-y-8">
                {changelog.map((log, i) => (
                    <div key={i} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${i === 0 ? 'bg-accent animate-pulse' : 'bg-surface-high'}`} />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg text-text-primary">{log.version}</h4>
                            <span className="hidden sm:inline text-surface-high">•</span>
                            <span className="text-sm text-text-secondary font-mono">{log.date}</span>
                        </div>
                        <h5 className="font-medium text-text-primary mb-3">{log.title}</h5>
                        <ul className="space-y-2 list-disc pl-4 marker:text-accent/50">
                            {log.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-text-secondary leading-relaxed pl-1">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-surface-high bg-surface-high/10 text-center">
            <p className="text-xs text-text-secondary">
                Designed & Built with ❤️ by TEKGUYZ
            </p>
        </div>

      </div>
    </div>
  );
};

export default ProjectInfoModal;
