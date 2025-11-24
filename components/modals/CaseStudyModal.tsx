import React, { useEffect, useState } from 'react';
import { X, TrendingUp, ExternalLink, Info, MousePointerClick, Building2 } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { prefetchProjectForm } from '../../utils/prefetch';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import OptimizedImage from '../ui/OptimizedImage';

// CountUp Component for animated numbers
const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function: easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(ease * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

const CaseStudyModal: React.FC = () => {
  const { selectedCaseStudy, setSelectedCaseStudy, setShowProjectFormModal } = useGlobal();
  const [isLoaded, setIsLoaded] = useState(false);
  const [flippedMetrics, setFlippedMetrics] = useState<number[]>([]);

  // Focus Trap
  const containerRef = useFocusTrap(() => setSelectedCaseStudy(null));

  useEffect(() => {
    if (selectedCaseStudy) {
      // Small delay to allow mounting before transition
      const timer = setTimeout(() => setIsLoaded(true), 50);
      setFlippedMetrics([]);
      return () => clearTimeout(timer);
    } else {
      setIsLoaded(false);
    }
  }, [selectedCaseStudy]);

  const toggleMetricFlip = (index: number) => {
    setFlippedMetrics(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  
  const handleMetricKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMetricFlip(index);
    }
  };

  const handleStartProject = () => {
    setSelectedCaseStudy(null);
    setShowProjectFormModal(true);
  };

  if (!selectedCaseStudy) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="casestudy-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setSelectedCaseStudy(null)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={containerRef}
        className={`relative w-full h-[95vh] sm:h-auto sm:max-w-4xl sm:max-h-[90vh] bg-surface border-t sm:border border-surface-high rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 transform ${isLoaded ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:scale-95 opacity-0'}`}
      >
        {/* Compact Header */}
        <div className="shrink-0 border-b border-surface-high bg-surface/95 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
            <div className="flex flex-col gap-0.5">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-wider">
                     <Building2 className="w-3 h-3" />
                     {selectedCaseStudy.client}
                 </div>
                 <h2 id="casestudy-title" className="text-lg md:text-xl font-bold text-text-primary tracking-tight line-clamp-1">
                    {selectedCaseStudy.title}
                 </h2>
            </div>

            <button
                onClick={() => setSelectedCaseStudy(null)}
                className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-surface-high rounded-full transition-colors btn-press"
                aria-label="Close modal"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-surface">
            
            {/* Hero Image Area */}
            <div className="w-full h-48 sm:h-64 relative bg-surface-high/20">
                 <OptimizedImage 
                    src={selectedCaseStudy.imageUrl} 
                    alt={selectedCaseStudy.title}
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Main Content Area */}
            <div className="p-6 sm:p-8 -mt-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                    
                    {/* Left Column: Narrative */}
                    <div className="md:col-span-7 space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {selectedCaseStudy.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold px-3 py-1 rounded-full bg-surface border border-surface-high text-text-secondary uppercase tracking-wide shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-line text-sm md:text-base border-l-2 border-surface-high pl-4">
                            {selectedCaseStudy.fullDescription}
                        </div>
                    </div>

                    {/* Right Column: Metrics (Interactive Cards) */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-surface-high pb-2">
                            <span className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider">
                                <TrendingUp className="w-4 h-4 text-accent" /> Impact Metrics
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-text-secondary opacity-60">
                                <MousePointerClick className="w-3 h-3"/> Tap or Hover
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {selectedCaseStudy.metrics.map((metric, index) => (
                                <div 
                                    key={index} 
                                    className="group h-24 perspective-1000 cursor-pointer focus:outline-none select-none"
                                    onClick={() => toggleMetricFlip(index)}
                                    onMouseEnter={() => !flippedMetrics.includes(index) && toggleMetricFlip(index)}
                                    onMouseLeave={() => flippedMetrics.includes(index) && toggleMetricFlip(index)}
                                    onKeyDown={(e) => handleMetricKeyDown(e, index)}
                                    tabIndex={0}
                                    role="button"
                                    aria-pressed={flippedMetrics.includes(index)}
                                    aria-label={`${metric.label}: ${metric.valueDisplay}. Flip for details.`}
                                >
                                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flippedMetrics.includes(index) ? 'rotate-y-180' : ''}`}>
                                        
                                        {/* Front Face */}
                                        <div className="absolute inset-0 backface-hidden bg-surface-high/10 border border-surface-high rounded-xl p-4 flex items-center justify-between hover:bg-surface-high/30 hover:border-accent/30 transition-all shadow-sm">
                                            <div className="flex flex-col justify-center h-full">
                                                <div className="text-3xl font-bold text-text-primary group-hover:text-accent transition-colors">
                                                    {typeof metric.value === 'number' ? (
                                                        <CountUp end={metric.value} suffix={metric.valueDisplay.replace(/[0-9]/g, '')} />
                                                    ) : (
                                                        metric.valueDisplay
                                                    )}
                                                </div>
                                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-1">
                                                    {metric.label}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-surface-high/30 flex items-center justify-center text-text-secondary/50 group-hover:bg-accent group-hover:text-white transition-all">
                                                <Info className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Back Face */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-accent text-white rounded-xl p-4 flex items-center justify-center text-center shadow-inner border border-accent">
                                            <p className="text-xs sm:text-sm font-medium leading-snug">
                                                {metric.detail}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-high bg-surface flex justify-between items-center shrink-0">
            <button 
                onClick={() => setSelectedCaseStudy(null)}
                className="text-text-secondary hover:text-text-primary transition-colors text-xs font-bold uppercase tracking-wider px-2"
            >
                Close
            </button>
            <button 
                onClick={handleStartProject}
                onMouseEnter={prefetchProjectForm}
                className="px-6 py-2.5 bg-text-primary text-background font-bold rounded-full hover:bg-accent hover:text-white transition-colors text-sm flex items-center gap-2 btn-press shadow-md"
            >
                Start Similar Project <ExternalLink className="w-3 h-3" />
            </button>
        </div>

      </div>
      
      {/* CSS for 3D Flip Animation */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default CaseStudyModal;
