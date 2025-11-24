
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Sparkles, Building2, Repeat, Info, ExternalLink } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { prefetchProjectForm } from '../../utils/prefetch';
import { useFocusTrap } from '../../hooks/useFocusTrap';

// CountUp Component for animated numbers
const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
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
      // Small delay to trigger animation
      const timer = setTimeout(() => setIsLoaded(true), 10);
      // Reset flipped state when opening new study
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="casestudy-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setSelectedCaseStudy(null)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={containerRef}
        className={`relative w-full h-[100dvh] sm:h-auto sm:max-w-4xl sm:max-h-[85vh] bg-surface border border-surface-high rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isLoaded ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:scale-95 opacity-0'}`}
      >
        {/* Header - Compact */}
        <div className="relative shrink-0 border-b border-surface-high bg-surface/95 backdrop-blur-md px-5 py-4 flex items-center justify-between z-10">
            <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                     <Building2 className="w-3 h-3" />
                     {selectedCaseStudy.client}
                 </div>
                 <h2 id="casestudy-title" className="text-xl md:text-2xl font-bold text-text-primary tracking-tight line-clamp-1">
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
        <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-surface">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Narrative (Wider) */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        {/* Tags Inline */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedCaseStudy.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded bg-surface-high/30 border border-surface-high text-text-secondary uppercase tracking-wide">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
                           <Sparkles className="w-4 h-4 text-accent" /> Challenge & Solution
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-line text-sm md:text-base">
                            {selectedCaseStudy.fullDescription}
                        </div>
                    </div>
                </div>

                {/* Right Column: Metrics (Stacked) */}
                <div className="md:col-span-1 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase tracking-wider opacity-80">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        Impact
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {selectedCaseStudy.metrics.map((metric, index) => (
                            <div 
                                key={index} 
                                className="group h-20 perspective-1000 cursor-pointer focus:outline-none"
                                onClick={() => toggleMetricFlip(index)}
                                onKeyDown={(e) => handleMetricKeyDown(e, index)}
                                tabIndex={0}
                                role="button"
                                aria-pressed={flippedMetrics.includes(index)}
                                aria-label={`${metric.label}: ${metric.valueDisplay}. Click to see details.`}
                            >
                                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flippedMetrics.includes(index) ? 'rotate-y-180' : 'group-hover:rotate-y-180'}`}>
                                    
                                    {/* Front Face */}
                                    <div className="absolute inset-0 backface-hidden bg-surface-high/20 border border-surface-high rounded-lg px-4 flex items-center justify-between hover:border-accent/30 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">
                                                {typeof metric.value === 'number' ? (
                                                    <CountUp end={metric.value} suffix={metric.valueDisplay.replace(/[0-9]/g, '')} />
                                                ) : (
                                                    metric.valueDisplay
                                                )}
                                            </span>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                                {metric.label}
                                            </span>
                                        </div>
                                        <Info className="w-4 h-4 text-surface-high group-hover:text-accent/50 transition-colors" />
                                    </div>

                                    {/* Back Face */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-accent text-white rounded-lg px-4 flex items-center justify-center text-center">
                                        <p className="text-xs font-medium leading-tight line-clamp-3">
                                            {metric.detail}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Callout */}
                    <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/10">
                        <p className="text-xs text-text-secondary leading-relaxed">
                            <strong className="text-accent">Result:</strong> Client saw immediate ROI within the first quarter of deployment.
                        </p>
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
                className="px-5 py-2.5 bg-text-primary text-background font-bold rounded-lg hover:bg-accent hover:text-white transition-colors text-sm flex items-center gap-2 btn-press shadow-sm"
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
