
import React, { useState } from 'react';
import { X, Sparkles, Zap, FileText, Lightbulb, ArrowRight, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { geminiService, AuditResult, Idea } from '../../utils/gemini';
import { useChatbotBridge } from '../../hooks/useChatbotBridge';
import { useFocusTrap } from '../../hooks/useFocusTrap';

type ActiveTab = 'audit' | 'refine' | 'ideas';

const AIFeaturesModal: React.FC = () => {
  const { showAIFeaturesModal, setShowAIFeaturesModal, setShowProjectFormModal } = useGlobal();
  const { receiveChatbotData } = useChatbotBridge();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('audit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Tool States ---
  const [auditInput, setAuditInput] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [refineInput, setRefineInput] = useState('');
  const [refineResult, setRefineResult] = useState<string | null>(null);
  const [ideaInput, setIdeaInput] = useState('');
  const [ideaResults, setIdeaResults] = useState<Idea[]>([]);
  const [flippedIdeaIndex, setFlippedIdeaIndex] = useState<number | null>(null);

  // Focus Trap
  const containerRef = useFocusTrap(() => setShowAIFeaturesModal(false));

  if (!showAIFeaturesModal) return null;

  // --- Handlers ---

  const handleAudit = async () => {
    if (!auditInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await geminiService.auditInput(auditInput);
      if (response.status === 'success' && response.data) {
        setAuditResult(response.data);
      } else {
        setError("We ran into a hiccup running the audit. Please try again.");
      }
    } catch (e) {
      setError("We ran into a hiccup running the audit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await geminiService.refineText(refineInput);
      if (response.status === 'success' && response.data) {
        setRefineResult(response.data);
      } else {
        setError("We couldn't refine the text just now. Please try again.");
      }
    } catch (e) {
      setError("We couldn't refine the text just now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!ideaInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setFlippedIdeaIndex(null);
    try {
      const response = await geminiService.generateIdeas(ideaInput);
      if (response.status === 'success' && response.data) {
        setIdeaResults(response.data);
      } else {
        setError("We couldn't spark any ideas at the moment. Please try again.");
      }
    } catch (e) {
      setError("We couldn't spark any ideas at the moment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseIdea = (idea: Idea) => {
    receiveChatbotData({
      scope: {
        features: [idea.title, ...idea.tags],
        platforms: ["Suggested by Idea Generator"]
      },
      goals: {
        primary: idea.pitch
      }
    });
    setShowAIFeaturesModal(false);
    setShowProjectFormModal(true);
  };

  // Keyboard support for flip cards
  const handleCardKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlippedIdeaIndex(flippedIdeaIndex === index ? null : index);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-features-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => setShowAIFeaturesModal(false)}
        aria-hidden="true"
      />

      {/* Modal Content - Expanded Width for Desktop */}
      <div 
        ref={containerRef}
        className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-7xl bg-surface border border-surface-high rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 sm:zoom-in-95"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-surface-high bg-surface/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent" aria-hidden="true" />
            </div>
            <div>
                <h2 id="ai-features-title" className="text-lg sm:text-xl font-bold text-text-primary">
                AI Playground
                </h2>
                <p className="text-[10px] sm:text-xs text-text-secondary">Explore TEKGUYZ capabilities in real-time</p>
            </div>
          </div>
          <button
            onClick={() => setShowAIFeaturesModal(false)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-high rounded-full transition-colors btn-press"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Body with Sidebar Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Sidebar Navigation - Horizontal Scroll on Mobile */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-surface-high bg-surface-high/5 flex md:flex-col p-2 md:py-4 gap-2 shrink-0 overflow-x-auto snap-x no-scrollbar" role="tablist">
                <button 
                    role="tab"
                    aria-selected={activeTab === 'audit'}
                    onClick={() => setActiveTab('audit')}
                    className={`snap-start shrink-0 btn-press flex items-center gap-3 px-4 py-3 mx-1 md:mx-2 rounded-lg transition-all whitespace-nowrap border ${activeTab === 'audit' ? 'bg-surface border-surface-high shadow-sm text-accent font-medium' : 'border-transparent text-text-secondary hover:bg-surface-high/30 hover:text-text-primary'}`}
                >
                    <Zap className="w-5 h-5 shrink-0" />
                    <span>Quick Audit</span>
                </button>
                <button 
                    role="tab"
                    aria-selected={activeTab === 'refine'}
                    onClick={() => setActiveTab('refine')}
                    className={`snap-start shrink-0 btn-press flex items-center gap-3 px-4 py-3 mx-1 md:mx-2 rounded-lg transition-all whitespace-nowrap border ${activeTab === 'refine' ? 'bg-surface border-surface-high shadow-sm text-accent font-medium' : 'border-transparent text-text-secondary hover:bg-surface-high/30 hover:text-text-primary'}`}
                >
                    <FileText className="w-5 h-5 shrink-0" />
                    <span>Refine Text</span>
                </button>
                <button 
                    role="tab"
                    aria-selected={activeTab === 'ideas'}
                    onClick={() => setActiveTab('ideas')}
                    className={`snap-start shrink-0 btn-press flex items-center gap-3 px-4 py-3 mx-1 md:mx-2 rounded-lg transition-all whitespace-nowrap border ${activeTab === 'ideas' ? 'bg-surface border-surface-high shadow-sm text-accent font-medium' : 'border-transparent text-text-secondary hover:bg-surface-high/30 hover:text-text-primary'}`}
                >
                    <Lightbulb className="w-5 h-5 shrink-0" />
                    <span>Idea Generator</span>
                </button>
            </div>

            {/* Content Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-surface/30" role="tabpanel">
                
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 sticky top-0 z-10 backdrop-blur-md" role="alert">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* --- PANE 1: QUICK AUDIT --- */}
                {activeTab === 'audit' && (
                    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 pb-20">
                        <div className="text-left">
                            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Operational Quick Audit</h3>
                            <p className="text-text-secondary text-sm sm:text-base">Describe a bottleneck in your business. We'll identify the tech solution.</p>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={auditInput}
                                onChange={(e) => setAuditInput(e.target.value)}
                                placeholder="e.g., 'My sales team spends 3 hours a day manually entering leads from emails into our CRM.'"
                                className="w-full h-40 p-4 rounded-xl bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none placeholder:text-text-secondary/50"
                                aria-label="Describe your bottleneck"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAudit}
                                    disabled={isLoading || !auditInput.trim()}
                                    className="w-full sm:w-auto px-8 py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-press"
                                >
                                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Run Audit
                                </button>
                            </div>
                        </div>

                        {/* Result */}
                        {auditResult && (
                            <div className="mt-8 p-6 rounded-xl bg-surface border border-surface-high shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                <h4 className="font-bold text-accent mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Assessment
                                </h4>
                                <p className="text-text-primary text-base sm:text-lg mb-6 leading-relaxed">
                                    {auditResult.assessment}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-lg bg-surface-high/20">
                                        <div className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-2">Impact Estimate</div>
                                        <div className="text-xl font-bold text-green-500">{auditResult.impactEstimate}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-surface-high/20">
                                        <div className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-2">Recommended Actions</div>
                                        <ul className="space-y-2">
                                            {auditResult.recommendedActions.map((action, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- PANE 2: REFINE TEXT --- */}
                {activeTab === 'refine' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 pb-2">
                        <div className="mb-4 sm:mb-6 shrink-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Smart Refiner</h3>
                            <p className="text-text-secondary text-sm sm:text-base">Turn rough notes into polished professional copy.</p>
                        </div>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
                            {/* Input Column */}
                            <div className="flex flex-col gap-2 sm:gap-4 h-full">
                                <label className="text-xs sm:text-sm font-bold text-text-secondary uppercase tracking-wider">Original</label>
                                <textarea
                                    value={refineInput}
                                    onChange={(e) => setRefineInput(e.target.value)}
                                    placeholder="Paste rough text here..."
                                    className="flex-1 p-4 rounded-xl bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none text-sm sm:text-base"
                                />
                                <button
                                    onClick={handleRefine}
                                    disabled={isLoading || !refineInput.trim()}
                                    className="w-full py-3 bg-surface-high text-text-primary font-bold rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-press shrink-0"
                                >
                                     {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Refine Text
                                </button>
                            </div>

                            {/* Output Column */}
                            <div className="flex flex-col gap-2 sm:gap-4 h-full mt-4 lg:mt-0">
                                <label className="text-xs sm:text-sm font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                                    Polished <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">AI</span>
                                </label>
                                <div className="flex-1 p-4 rounded-xl bg-surface border border-surface-high relative overflow-y-auto group min-h-[200px] lg:min-h-0">
                                    {refineResult ? (
                                        <div className="animate-in fade-in zoom-in duration-500">
                                            <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{refineResult}</p>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-text-secondary/20 select-none">
                                            <FileText className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PANE 3: IDEA GENERATOR --- */}
                {activeTab === 'ideas' && (
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-20">
                        <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Idea Spark</h3>
                            <p className="text-text-secondary text-sm sm:text-base">Enter your industry or a loose concept. We'll generate project candidates.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
                            <input
                                value={ideaInput}
                                onChange={(e) => setIdeaInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                                placeholder="e.g. Real Estate, Logistics, Coffee Shop"
                                className="flex-1 p-3 px-5 rounded-full bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                                aria-label="Industry or concept"
                            />
                            <button
                                onClick={handleGenerateIdeas}
                                disabled={isLoading || !ideaInput.trim()}
                                className="px-6 py-3 bg-accent text-white rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50 flex justify-center items-center btn-press"
                                aria-label="Generate Ideas"
                            >
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Results Grid - Flip Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 sm:pt-8">
                            {ideaResults.length === 0 && !isLoading && (
                                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-text-secondary/40 py-12 border-2 border-dashed border-surface-high rounded-xl">
                                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Ideas will appear here</p>
                                </div>
                            )}

                            {ideaResults.map((idea, index) => (
                                <div 
                                    key={index}
                                    className="group h-72 perspective-1000 cursor-pointer focus:outline-none"
                                    onClick={() => setFlippedIdeaIndex(flippedIdeaIndex === index ? null : index)}
                                    onMouseLeave={() => setFlippedIdeaIndex(null)}
                                    onKeyDown={(e) => handleCardKeyDown(e, index)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Idea: ${idea.title}. Click to reveal details.`}
                                    aria-pressed={flippedIdeaIndex === index}
                                >
                                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flippedIdeaIndex === index ? 'rotate-y-180' : 'group-hover:rotate-y-180'}`}>
                                        
                                        {/* Front */}
                                        <div className="absolute inset-0 backface-hidden bg-surface border border-surface-high rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:border-accent/50 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                                <Lightbulb className="w-6 h-6 text-accent" />
                                            </div>
                                            <h4 className="font-bold text-lg text-text-primary mb-2">{idea.title}</h4>
                                            <p className="text-sm text-text-secondary line-clamp-3">{idea.pitch}</p>
                                            <div className="mt-4 text-xs font-bold text-accent uppercase tracking-wider opacity-60">Hover or Tap</div>
                                        </div>

                                        {/* Back */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface-high border border-surface-high rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
                                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                                {idea.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 text-[10px] bg-background rounded border border-white/10 text-text-secondary">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUseIdea(idea);
                                                }}
                                                className="w-full py-2 bg-accent text-white font-bold rounded-lg hover:bg-accent/80 transition-colors flex items-center justify-center gap-2 btn-press"
                                                tabIndex={flippedIdeaIndex === index ? 0 : -1} // Only focusable when flipped
                                            >
                                                Use in Project <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* Inline CSS for specific 3D transforms in this modal */}
        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
            /* Hide Scrollbar for Chrome, Safari and Opera */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            /* Hide Scrollbar for IE, Edge and Firefox */
            .no-scrollbar {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
        `}</style>

      </div>
    </div>
  );
};

export default AIFeaturesModal;
