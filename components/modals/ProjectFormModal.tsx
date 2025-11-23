
import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, ChevronRight, ChevronLeft, Undo, Check, BrainCircuit, RefreshCw, Rocket, ArrowRight, AlertCircle } from 'lucide-react';
import { useGlobal, useChat } from '../../context/GlobalContext';
import { geminiService } from '../../utils/gemini';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface FormData {
  name: string;
  email: string;
  company: string;
  goals: string;
  scope: string;
  timeline: string;
  notes: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  company: '',
  goals: '',
  scope: '',
  timeline: '',
  notes: ''
};

const ProjectFormModal: React.FC = () => {
  const { 
    showProjectFormModal, 
    setShowProjectFormModal, 
    userIntent
  } = useGlobal();

  const { chatHistory } = useChat();

  // --- Form State ---
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- AI States ---
  const [isRefining, setIsRefining] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [undoStack, setUndoStack] = useState<{ field: keyof FormData, value: string } | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Focus Trap
  const containerRef = useFocusTrap(() => setShowProjectFormModal(false));

  // --- Initialization from Bridge Data ---
  useEffect(() => {
    if (showProjectFormModal && userIntent && !isSubmitted) {
      setFormData(prev => ({
        ...prev,
        name: userIntent.contact?.name || prev.name,
        email: userIntent.contact?.email || prev.email,
        company: userIntent.companyInfo?.name || prev.company,
        goals: userIntent.goals?.primary || prev.goals,
        scope: userIntent.scope?.features?.join(', ') || prev.scope,
        timeline: userIntent.timeline?.expectedStart || prev.timeline
      }));
    }
  }, [showProjectFormModal, userIntent, isSubmitted]);

  // Reset on close
  useEffect(() => {
    if (!showProjectFormModal) {
      setTimeout(() => {
        setStep(1);
        setIsSubmitted(false);
        setFormData(initialFormData);
        setAiMessage(null);
        setUndoStack(null);
        setValidationError(null);
      }, 300);
    }
  }, [showProjectFormModal]);

  if (!showProjectFormModal) return null;

  // --- Handlers ---

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError(null); // Clear error on edit
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
        if (!formData.name.trim() || !formData.email.trim()) {
            setValidationError("Please fill in your name and email.");
            return false;
        }
        if (!formData.email.includes('@')) {
            setValidationError("Please enter a valid email address.");
            return false;
        }
    }
    if (currentStep === 2) {
        if (!formData.goals.trim()) {
            setValidationError("Please tell us a bit about your goals.");
            return false;
        }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
        setStep(prev => Math.min(prev + 1, 4));
        setValidationError(null);
    }
  };

  const handleBack = () => {
      setStep(prev => Math.max(prev - 1, 1));
      setValidationError(null);
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
        setIsSubmitted(true);
    }
  };

  const handleStartNew = () => {
    setIsSubmitted(false);
    setStep(1);
    setFormData(initialFormData);
  };

  const handleGoToWork = () => {
    setShowProjectFormModal(false);
    // Use a small timeout to allow modal close animation to start
    setTimeout(() => {
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
    }, 100);
  };

  // AI Feature: Refine Text (Step 2)
  const handleRefineGoals = async () => {
    if (!formData.goals.trim()) return;
    
    setIsRefining(true);
    setAiMessage(null);
    setUndoStack({ field: 'goals', value: formData.goals });

    try {
      const response = await geminiService.refineText(formData.goals);
      if (response.status === 'success' && response.data) {
        handleChange('goals', response.data);
        setAiMessage("Text polished for clarity!");
      } else {
        setAiMessage("We couldn't polish your text just now. Feel free to keep writing.");
      }
    } catch (e) {
      setAiMessage("We couldn't polish your text just now. Feel free to keep writing.");
    } finally {
      setIsRefining(false);
      setTimeout(() => setAiMessage(null), 3000);
    }
  };

  // AI Feature: Undo Refine
  const handleUndo = () => {
    if (undoStack) {
      handleChange(undoStack.field, undoStack.value);
      setUndoStack(null);
      setAiMessage("Changes reverted.");
      setTimeout(() => setAiMessage(null), 2000);
    }
  };

  // AI Feature: Summarize Chat (Step 3)
  const handleSummarizeChat = async () => {
    if (chatHistory.length === 0) {
      setAiMessage("No chat history to summarize.");
      return;
    }

    setIsSummarizing(true);
    setAiMessage(null);

    try {
      const response = await geminiService.summarizeChat(chatHistory);
      if (response.status === 'success' && response.data) {
        const currentNotes = formData.notes ? formData.notes + "\n\n" : "";
        handleChange('notes', currentNotes + "AI Context Summary:\n" + response.data);
        setAiMessage("Chat context added to notes.");
      } else {
        setAiMessage("We couldn't summarize the chat right now. You can enter notes manually.");
      }
    } catch (e) {
      setAiMessage("We couldn't summarize the chat right now. You can enter notes manually.");
    } finally {
      setIsSummarizing(false);
      setTimeout(() => setAiMessage(null), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setShowProjectFormModal(false)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-surface border border-surface-high rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-300 sm:zoom-in-95"
      >
        
        {/* SUCCESS STATE */}
        {isSubmitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse-slow" />
                    <div className="relative w-24 h-24 bg-surface border border-surface-high rounded-full flex items-center justify-center shadow-xl shadow-accent/10">
                        <Rocket className="w-10 h-10 text-accent animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                </div>
                
                <div className="space-y-4 max-w-md">
                    <h2 className="text-3xl font-bold text-text-primary">We've got your blueprint!</h2>
                    <p className="text-text-secondary text-lg leading-relaxed">
                        Thanks {formData.name || 'partner'}. <br/>
                        We're analyzing your roadmap now. Expect a personal reach-out at <span className="text-text-primary font-medium">{formData.email}</span> within 24 hours.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-4">
                    <button
                        onClick={handleGoToWork}
                        className="flex-1 px-6 py-4 bg-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-accent/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 btn-press"
                    >
                        See Our Work <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleStartNew}
                        className="flex-1 px-6 py-4 bg-surface border border-surface-high text-text-secondary font-bold rounded-xl hover:text-text-primary hover:bg-surface-high transition-all btn-press"
                    >
                        Start Another
                    </button>
                </div>
                
                <button 
                  onClick={() => setShowProjectFormModal(false)}
                  className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-high transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>
        ) : (
        <>
            {/* STANDARD FORM STATE */}
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-high bg-surface/50">
            <div>
                <h2 id="project-modal-title" className="text-xl font-bold text-text-primary">
                Project Roadmap
                </h2>
                <div className="text-xs text-text-secondary mt-1" aria-live="polite">
                Step {step} of 4
                </div>
            </div>
            <button
                onClick={() => setShowProjectFormModal(false)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-high rounded-full transition-colors btn-press"
                aria-label="Close modal"
            >
                <X className="h-5 w-5" />
            </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-surface-high" role="progressbar" aria-valuenow={(step / 4) * 100} aria-valuemin={0} aria-valuemax={100}>
            <div 
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
            />
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            
            {/* Validation Error Banner */}
            {validationError && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{validationError}</span>
                </div>
            )}
            
            {/* STEP 1: Contact Info */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <h3 className="text-2xl font-bold text-text-primary">Let's start with the basics.</h3>
                <div className="space-y-4">
                    <div>
                    <label htmlFor="name" className="block text-xs font-bold text-text-secondary uppercase mb-2">Name <span className="text-accent">*</span></label>
                    <input 
                        id="name"
                        type="text" 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                        placeholder="Jane Doe"
                        required
                    />
                    </div>
                    <div>
                    <label htmlFor="email" className="block text-xs font-bold text-text-secondary uppercase mb-2">Email <span className="text-accent">*</span></label>
                    <input 
                        id="email"
                        type="email" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                        placeholder="jane@company.com"
                        required
                    />
                    </div>
                    <div>
                    <label htmlFor="company" className="block text-xs font-bold text-text-secondary uppercase mb-2">Company / Organization</label>
                    <input 
                        id="company"
                        type="text" 
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                        placeholder="Acme Corp"
                    />
                    </div>
                </div>
                </div>
            )}

            {/* STEP 2: Challenges & Goals (AI ENHANCED) */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <h3 className="text-2xl font-bold text-text-primary">What are we solving?</h3>
                
                <div className="relative group">
                    <label htmlFor="goals" className="block text-xs font-bold text-text-secondary uppercase mb-2">Primary Business Goals <span className="text-accent">*</span></label>
                    <textarea 
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => handleChange('goals', e.target.value)}
                    className="w-full h-40 p-4 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent resize-none leading-relaxed"
                    placeholder="e.g. We need to automate our invoicing process to save 10 hours a week..."
                    required
                    />
                    
                    {/* AI Tools Bar */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {aiMessage && (
                        <span className="text-xs text-accent font-medium animate-in fade-in" aria-live="polite">{aiMessage}</span>
                    )}
                    
                    {undoStack && (
                        <button
                        onClick={handleUndo}
                        className="p-2 bg-surface border border-surface-high text-text-secondary rounded-lg hover:text-text-primary transition-colors text-xs font-medium flex items-center gap-1 btn-press"
                        aria-label="Undo AI changes"
                        >
                        <Undo className="w-3 h-3" /> Undo
                        </button>
                    )}

                    <button
                        onClick={handleRefineGoals}
                        disabled={isRefining || !formData.goals}
                        className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-lg hover:bg-accent hover:text-white transition-colors text-xs font-bold flex items-center gap-2 btn-press"
                    >
                        {isRefining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Polish with AI
                    </button>
                    </div>
                </div>
                
                <p className="text-xs text-text-secondary">
                    Tip: Be specific about the outcomes you want (e.g., "Reduce errors by 50%").
                </p>
                </div>
            )}

            {/* STEP 3: Scope & Timeline (AI ENHANCED) */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <h3 className="text-2xl font-bold text-text-primary">Scope & Context</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="scope" className="block text-xs font-bold text-text-secondary uppercase mb-2">Key Features Needed</label>
                        <input 
                        id="scope"
                        type="text" 
                        value={formData.scope}
                        onChange={(e) => handleChange('scope', e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                        placeholder="e.g. Dashboard, Mobile App, API"
                        />
                    </div>
                    <div>
                        <label htmlFor="timeline" className="block text-xs font-bold text-text-secondary uppercase mb-2">Target Timeline</label>
                        <input 
                        id="timeline"
                        type="text" 
                        value={formData.timeline}
                        onChange={(e) => handleChange('timeline', e.target.value)}
                        className="w-full p-3 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                        placeholder="e.g. Q4 2024, ASAP"
                        />
                    </div>
                </div>

                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                    <label htmlFor="notes" className="block text-xs font-bold text-text-secondary uppercase">Additional Notes</label>
                    
                    {/* Autofill Trigger */}
                    <button 
                        onClick={handleSummarizeChat}
                        disabled={isSummarizing || chatHistory.length === 0}
                        className="text-[10px] font-bold text-accent uppercase tracking-wider hover:underline flex items-center gap-1 disabled:opacity-50 btn-press"
                    >
                        {isSummarizing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                        Summarize from Chat
                    </button>
                    </div>
                    <textarea 
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full h-32 p-4 rounded-lg bg-background border border-surface-high text-text-primary focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                    placeholder="Any other details? Or click 'Summarize from Chat' to auto-fill from your conversation."
                    />
                    {aiMessage && (
                        <span className="absolute bottom-4 right-4 text-xs text-accent font-medium animate-in fade-in" aria-live="polite">{aiMessage}</span>
                    )}
                </div>
                </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                        <Check className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">Ready to Launch?</h3>
                    <p className="text-text-secondary">Review your details below before sending.</p>
                </div>

                <div className="bg-surface-high/20 rounded-xl p-6 space-y-4 text-sm border border-surface-high">
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-text-secondary">Contact:</span>
                        <span className="col-span-2 font-medium text-text-primary">{formData.name} ({formData.email})</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-text-secondary">Company:</span>
                        <span className="col-span-2 font-medium text-text-primary">{formData.company}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-text-secondary">Goals:</span>
                        <span className="col-span-2 font-medium text-text-primary">{formData.goals}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-text-secondary">Scope:</span>
                        <span className="col-span-2 font-medium text-text-primary">{formData.scope}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <span className="text-text-secondary">Notes:</span>
                        <span className="col-span-2 font-medium text-text-primary whitespace-pre-wrap">{formData.notes || "None"}</span>
                    </div>
                </div>
                </div>
            )}

            </div>

            {/* Footer Navigation */}
            <div className="p-4 sm:p-6 border-t border-surface-high bg-surface/50 flex justify-between items-center pb-8 sm:pb-6">
            {step > 1 ? (
                <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 btn-press"
                >
                <ChevronLeft className="w-4 h-4" /> Back
                </button>
            ) : (
                <div /> /* Spacer */
            )}

            {step < 4 ? (
                <button
                onClick={handleNext}
                disabled={step === 1 ? (!formData.name || !formData.email) : step === 2 ? !formData.goals : false}
                className="px-6 py-2 bg-text-primary text-background font-bold rounded-lg hover:bg-accent hover:text-white transition-all flex items-center gap-2 btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Next Step <ChevronRight className="w-4 h-4" />
                </button>
            ) : (
                <button
                className="px-8 py-2 bg-accent text-white font-bold rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-2 btn-press"
                onClick={handleSubmit}
                >
                Submit Project <Send className="w-4 h-4" />
                </button>
            )}
            </div>
        </>
        )}

      </div>
    </div>
  );
};

export default ProjectFormModal;
