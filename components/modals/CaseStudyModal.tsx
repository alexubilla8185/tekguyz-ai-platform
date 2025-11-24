
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Sparkles, Building2, Repeat } from 'lucide-react';
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
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setSelectedCaseStudy(null)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={containerRef}
        className={`relative w-full h-[100dvh] sm:h-auto sm:max-w-6xl sm:max-h-[90vh] bg-surface border border-surface-high rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isLoaded ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:scale-95 opacity-0'}`}
      >
        {/* Header - Compact & Adaptive */}
        <div className="relative shrink-0 border-b border-surface-high bg-surface-high/10 overflow-hidden p-5 sm:p-6">
            
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4 pr-10">
                <div className="space-y-2">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {selectedCaseStudy.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded backdrop-blur-md">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h2 id="casestudy-title" className="text-xl md:text-3xl font-bold text-text-primary leading-tight">
                        {selectedCaseStudy.title}
                    </h2>

                    {/* Client Info */}
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Building2 className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm font-medium">{selectedCaseStudy.client}</span>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setSelectedCaseStudy(null)}
                    className="absolute top-0 right-0 sm:static p-2 rounded-full text-text-secondary hover:bg-surface-high hover:text-text-primary transition-colors btn-press"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 h-full">
                
                {/* Left Column: Context (Wider) */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            The Challenge & Solution
                        </h3>
                        <p className="text-text-secondary leading-relaxed whitespace-pre-line text-sm md:text-base">
                            {selectedCaseStudy.fullDescription}
                        </p>
                    </div>
                </div>

                {/* Right Column: Metrics (Compact Grid) */}
                <div className="lg:col-span-5">
                    <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        Key Outcomes
                    </h3>
                    
                    {/* Grid Layout: 1 col mobile, 2 cols desktop to prevent vertical height buildup */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCaseStudy.metrics.map((metric, index) => (
                            <div 
                                key={index} 
                                className="group h-28 perspective-1000 cursor-pointer focus:outline-none"
                                onClick={() => toggleMetricFlip(index)}
                                onKeyDown={(e) => handleMetricKeyDown(e, index)}
                                tabIndex={0}
                                role="button"
                                aria-pressed={flippedMetrics.includes(index)}
                                aria-label={`${metric.label}: ${metric.valueDisplay}. Tap to reveal details.`}
                            >
                                <div className={`flip-card-inner rounded-xl border border-surface-high transition-transform duration-500 ${flippedMetrics.includes(index) ? 'is-flipped' : 'group-hover:rotate-y-180'}`}>
                                    
                                    {/* Front Face */}
                                    <div className="flip-card-front bg-surface-high/10 flex flex-col justify-center px-5 card-hover relative overflow-hidden">
                                        <div className="text-3xl font-bold text-accent mb-1 truncate">
                                            {typeof metric.value === 'number' ? (
                                                <CountUp end={metric.value} suffix={metric.valueDisplay.replace(/[0-9]/g, '')} />
                                            ) : (
                                                metric.valueDisplay
                                            )}
                                        </div>
                                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate">
                                            {metric.label}
                                        </div>

                                        {/* Subtle Flip Indicator */}
                                        <div className="absolute top-2 right-2 text-text-secondary/30 group-hover:text-accent/50 transition-colors">
                                            <Repeat className="w-3 h-3" />
                                        </div>
                                    </div>

                                    {/* Back Face */}
                                    <div className="flip-card-back bg-accent text-white flex items-center justify-center text-center p-3">
                                        <p className="text-xs font-medium leading-snug">
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

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-surface-high bg-surface flex justify-between items-center shrink-0">
            <button 
                onClick={() => setSelectedCaseStudy(null)}
                className="text-text-secondary hover:text-text-primary transition-colors text-xs sm:text-sm font-medium px-2"
            >
                Close
            </button>
            <button 
                onClick={handleStartProject}
                onMouseEnter={prefetchProjectForm}
                className="px-5 py-2.5 bg-text-primary text-background font-bold rounded-xl hover:bg-accent hover:text-white transition-colors text-sm flex items-center gap-2 btn-press shadow-lg"
            >
                Start Similar Project 
            </button>
        </div>

      </div>
      
      {/* CSS for 3D Flip Animation */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        /* Flip state controlled by JS (Click) OR CSS (Hover) */
        .flip-card-inner.is-flipped,
        .group:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front, 
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 0.75rem;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default CaseStudyModal;
