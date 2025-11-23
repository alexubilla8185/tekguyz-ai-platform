
import React, { useEffect, useState } from 'react';
import { X, ArrowRight, TrendingUp } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import OptimizedImage from '../ui/OptimizedImage';
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
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
        className={`relative w-full h-[100dvh] sm:h-full sm:max-w-5xl sm:max-h-[90vh] bg-surface border border-surface-high rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isLoaded ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:scale-95 opacity-0'}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedCaseStudy(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-white/20 transition-colors btn-press"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Section */}
        <div className="relative h-48 sm:h-64 md:h-80 shrink-0 overflow-hidden bg-surface-high">
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
          
          <OptimizedImage 
            src={selectedCaseStudy.imageUrl} 
            alt={selectedCaseStudy.title}
            containerClassName="absolute inset-0 w-full h-full"
            className={`transition-transform duration-700 ${isLoaded ? 'scale-105' : 'scale-100'}`}
          />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCaseStudy.tags.map(tag => (
                <span key={tag} className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full backdrop-blur-md">
                  {tag}
                </span>
              ))}
            </div>
            <h2 id="casestudy-title" className="type-headline text-white mb-1 text-2xl md:text-3xl">{selectedCaseStudy.title}</h2>
            <p className="text-base md:text-lg text-gray-300">{selectedCaseStudy.client}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          
          {/* Main Description */}
          <div className="max-w-3xl mb-12">
            <h3 className="type-title mb-4 text-text-primary">The Challenge & Solution</h3>
            <p className="type-body whitespace-pre-line text-sm md:text-base">
              {selectedCaseStudy.fullDescription}
            </p>
          </div>

          {/* Metrics - Flip Cards */}
          <div className="mb-12">
            <h3 className="type-title mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" aria-hidden="true" />
              Key Outcomes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedCaseStudy.metrics.map((metric, index) => (
                <div 
                  key={index} 
                  className="group h-40 md:h-48 perspective-1000 cursor-pointer focus:outline-none"
                  onClick={() => toggleMetricFlip(index)}
                  onKeyDown={(e) => handleMetricKeyDown(e, index)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={flippedMetrics.includes(index)}
                  aria-label={`${metric.label}: ${metric.valueDisplay}. Click for details.`}
                >
                  <div className={`flip-card-inner shadow-lg rounded-xl border border-surface-high ${flippedMetrics.includes(index) ? 'is-flipped' : ''}`}>
                    
                    {/* Front Face */}
                    <div className="flip-card-front bg-surface-high/30 flex flex-col items-center justify-center text-center p-6 card-hover">
                      <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                        {typeof metric.value === 'number' ? (
                           <CountUp end={metric.value} suffix={metric.valueDisplay.replace(/[0-9]/g, '')} />
                        ) : (
                           metric.valueDisplay
                        )}
                      </div>
                      <div className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                        {metric.label}
                      </div>
                      <div className="absolute bottom-4 text-xs text-text-secondary/50 flex items-center gap-1">
                        Hover or tap for details <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="flip-card-back bg-accent text-white flex flex-col items-center justify-center text-center p-6">
                      <p className="text-sm md:text-lg font-medium leading-relaxed">
                        {metric.detail}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-surface-high bg-surface flex justify-between items-center pb-8 sm:pb-6">
            <button 
                onClick={() => setSelectedCaseStudy(null)}
                className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium nav-link-animated"
            >
                Close Case Study
            </button>
            <button 
                onClick={handleStartProject}
                onMouseEnter={prefetchProjectForm}
                className="px-6 py-3 bg-text-primary text-background font-bold rounded-lg hover:bg-accent hover:text-white transition-colors text-sm md:text-base flex items-center gap-2 min-w-[180px] justify-center btn-press"
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
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        /* Flip on Hover (Desktop) OR on State Change (Click) */
        .group:hover .flip-card-inner,
        .flip-card-inner.is-flipped {
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
