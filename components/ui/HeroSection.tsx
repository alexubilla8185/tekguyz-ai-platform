
import React from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { prefetchProjectForm, prefetchAIFeatures, prefetchWorkSection, prefetchProjectInfo } from '../../utils/prefetch';

interface HeroSectionProps {
  id: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ id }) => {
  const { setShowProjectFormModal, setShowAIFeaturesModal, setShowProjectInfoModal } = useGlobal();

  const handleScrollToWork = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('work');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section 
      id={id} 
      className="relative min-h-screen flex items-center pt-16 md:pt-0 overflow-hidden"
    >
      {/* Decorative Local Gradient to emphasize Hero area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col space-y-8 text-center md:text-left z-10 max-w-2xl mx-auto md:mx-0">
            
            {/* Value Badge (EASTER EGG TRIGGER) */}
            <div className="header-fade">
              <button 
                onClick={() => setShowProjectInfoModal(true)}
                onMouseEnter={prefetchProjectInfo}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/50 border border-surface-high backdrop-blur-sm text-sm font-medium text-accent hover:bg-accent/10 hover:border-accent/30 transition-all cursor-pointer group"
                aria-label="View Project Architecture"
              >
                <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>AI For Growing Teams</span>
              </button>
            </div>

            {/* Headline */}
            <h1 className="type-display header-fade delay-100">
              Custom applications that actually work for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">
                your business
              </span>
            </h1>

            {/* Subheadline */}
            <p className="type-body text-lg md:text-xl text-text-secondary header-fade delay-200">
              Stop drowning in spreadsheets. We build secure, private AI tools that automate your specific workflows and drive real revenue.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4 header-fade delay-300">
              <button
                onClick={() => setShowProjectFormModal(true)}
                onMouseEnter={prefetchProjectForm}
                className="btn-press group relative px-8 py-4 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/40 flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">Start Your Project</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <a
                href="#work"
                onClick={handleScrollToWork}
                onMouseEnter={prefetchWorkSection}
                className="btn-press px-8 py-4 bg-surface border border-surface-high text-text-primary font-bold rounded-xl hover:bg-surface-high flex items-center justify-center transition-colors"
              >
                See Case Studies
              </a>
            </div>

            {/* Tertiary Action */}
            <div className="header-fade delay-300">
              <button
                onClick={() => setShowAIFeaturesModal(true)}
                onMouseEnter={prefetchAIFeatures}
                className="group inline-flex items-center gap-3 text-text-secondary hover:text-accent transition-colors btn-press"
              >
                <div className="w-10 h-10 rounded-full bg-surface border border-surface-high flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all duration-300">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <span className="font-medium border-b border-transparent group-hover:border-accent transition-all">
                  Try Our AI Demo
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Motion Graphic */}
          <div className="hidden md:flex relative items-center justify-center h-full min-h-[500px] animate-in fade-in zoom-in duration-700 delay-300">
            {/* Abstract Tech Pattern */}
            <div className="relative w-full max-w-lg aspect-square">
              
              {/* Pulsing Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[60px] animate-pulse-slow" />

              {/* Rotating Rings */}
              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full animate-[spin_30s_linear_infinite] opacity-40">
                <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" fill="none" className="text-surface-high" strokeDasharray="10 20" />
                <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" fill="none" className="text-text-secondary" strokeDasharray="4 8" />
              </svg>

              <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite_reverse] opacity-30">
                 <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" fill="none" className="text-accent" strokeDasharray="2 10" />
              </svg>

              {/* Floating Interface Element (EASTER EGG TRIGGER) */}
              <div 
                onClick={() => setShowProjectInfoModal(true)}
                onMouseEnter={prefetchProjectInfo}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-surface/80 backdrop-blur-xl border border-surface-high rounded-2xl shadow-2xl p-6 transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer card-hover group"
                role="button"
                aria-label="View Project Info"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="h-2 w-16 bg-surface-high rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-surface-high group-hover:border-accent/30 transition-colors">
                    <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 w-2/3 bg-text-secondary/40 rounded-full" />
                      <div className="h-2 w-1/2 bg-surface-high rounded-full" />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-surface-high/30 rounded-full" />
                  <div className="h-2 w-5/6 bg-surface-high/30 rounded-full" />
                  <div className="flex justify-between items-center pt-2">
                     <div className="h-6 w-20 bg-accent/10 rounded-md" />
                     <div className="text-xs font-mono text-accent">98% Efficiency</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
