
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, ChevronRight, ChevronLeft, Undo, Check, BrainCircuit, RefreshCw, Briefcase, Target, Layers, Mail, Phone, Clock, DollarSign } from 'lucide-react';
import { useGlobal, useChat } from '../../context/GlobalContext';
import { geminiService } from '../../utils/gemini';
import { useFocusTrap } from '../../hooks/useFocusTrap';

// --- Types ---

interface FormData {
  // Step 1: Business Context
  industry: string;
  companySize: string;
  description: string;
  
  // Step 2: Challenge & Goals
  targetMetrics: string;
  painPoints: string;
  
  // Step 3: Scope & Timeline
  features: string[];
  budgetBand: 'Fast' | 'Standard' | 'Flexible';
  timeline: string;
  
  // Step 4: Contact
  email: string;
  phone: string;
  saveChatHistory: boolean;
}

const initialFormData: FormData = {
  industry: '',
  companySize: '',
  description: '',
  targetMetrics: '',
  painPoints: '',
  features: [],
  budgetBand: 'Standard',
  timeline: '',
  email: '',
  phone: '',
  saveChatHistory: true
};

const FEATURES_LIST = [
  "Web App", "Mobile App", "Automation", "Dashboard", "AI Agent", "CRM Integration", "E-commerce", "Internal Tool"
];

const TIMELINE_OPTS = ["ASAP", "1-2 Months", "3-6 Months", "Flexible"];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "200+"];

const STEPS = [
  { label: "Context", icon: <Briefcase className="w-4 h-4" /> },
  { label: "Goals", icon: <Target className="w-4 h-4" /> },
  { label: "Scope", icon: <Layers className="w-4 h-4" /> },
  { label: "Contact", icon: <Mail className="w-4 h-4" /> }
];

// --- Confetti Component ---
const ConfettiParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50,
    y: Math.random() * -100 - 50,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 4)],
    delay: Math.random() * 0.2
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full animate-confetti opacity-0"
          style={{
            backgroundColor: p.color,
            '--tx': `${p.x}vw`,
            '--ty': `${p.y}vh`,
            animationDelay: `${p.delay}s`,
            animationDuration: '3s',
            animationName: 'confetti-explode'
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
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
  
  // Validation
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isShaking, setIsShaking] = useState(false);

  // AI States
  const [isRefining, setIsRefining] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [undoStack, setUndoStack] = useState<{ field: keyof FormData, value: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Focus Trap
  const containerRef = useFocusTrap(() => setShowProjectFormModal(false));

  // --- Initialization ---
  useEffect(() => {
    if (showProjectFormModal && userIntent && !isSubmitted) {
      setFormData(prev => ({
        ...prev,
        industry: userIntent.companyInfo?.industry || prev.industry,
        companySize: userIntent.companyInfo?.size || prev.companySize,
        description: userIntent.companyInfo?.description || prev.description,
        features: userIntent.scope?.features || prev.features,
        painPoints: userIntent.goals?.primary || prev.painPoints,
        email: userIntent.contact?.email || prev.email,
        phone: userIntent.contact?.phone || prev.phone,
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
        setErrors({});
        setToastMessage(null);
      }, 300);
    }
  }, [showProjectFormModal]);

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!showProjectFormModal) return null;

  // --- Helpers ---

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, boolean>> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.industry.trim()) { newErrors.industry = true; isValid = false; }
      if (!formData.companySize) { newErrors.companySize = true; isValid = false; }
    }
    if (currentStep === 2) {
      if (!formData.painPoints.trim()) { newErrors.painPoints = true; isValid = false; }
    }
    if (currentStep === 3) {
      if (formData.features.length === 0) { newErrors.features = true; isValid = false; }
      if (!formData.timeline) { newErrors.timeline = true; isValid = false; }
    }
    if (currentStep === 4) {
      if (!formData.email.trim() || !formData.email.includes('@')) { newErrors.email = true; isValid = false; }
    }

    setErrors(newErrors);
    if (!isValid) triggerShake();
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      setIsSubmitted(true);
      setTimeout(() => {
        setShowProjectFormModal(false);
      }, 3000);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => {
      const exists = prev.features.includes(feature);
      const newFeatures = exists 
        ? prev.features.filter(f => f !== feature) 
        : [...prev.features, feature];
      return { ...prev, features: newFeatures };
    });
    if (errors.features) setErrors(prev => ({ ...prev, features: false }));
  };

  const formatPhone = (val: string) => {
    const cleaned = ('' + val).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return val;
  };

  // --- AI Actions ---

  const handleRefinePainPoints = async () => {
    if (!formData.painPoints.trim()) return;
    
    setIsRefining(true);
    setUndoStack({ field: 'painPoints', value: formData.painPoints });

    try {
      const response = await geminiService.refineText(formData.painPoints);
      if (response.status === 'success' && response.data) {
        handleChange('painPoints', response.data);
        setToastMessage("Polished for clarity");
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleSummarizeChat = async () => {
    if (chatHistory.length === 0) return;
    setIsSummarizing(true);
    try {
      const response = await geminiService.summarizeChat(chatHistory);
      if (response.status === 'success' && response.data) {
        const current = formData.description ? formData.description + "\n\n" : "";
        handleChange('description', current + "[Chat Summary]: " + response.data);
        setToastMessage("Context added from chat");
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleUndo = () => {
    if (undoStack) {
      handleChange(undoStack.field, undoStack.value);
      setUndoStack(null);
      setToastMessage("Changes reverted");
    }
  };

  // --- Rendering ---

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes confetti-explode {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>

      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setShowProjectFormModal(false)}
      />

      {/* Modal */}
      <div 
        ref={containerRef}
        className={`relative w-full max-w-2xl bg-surface border border-surface-high rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 max-h-[90vh] ${isShaking ? 'animate-shake' : ''} ${isSubmitted ? 'scale-105' : 'animate-in zoom-in-95'}`}
      >
        
        {isSubmitted && <ConfettiParticles />}

        {/* Header */}
        {!isSubmitted && (
          <div className="bg-surface border-b border-surface-high p-6">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-2xl font-bold text-text-primary">Project Blueprint</h2>
                   <p className="text-sm text-text-secondary">Let's scope your solution.</p>
                </div>
                <button onClick={() => setShowProjectFormModal(false)} className="text-text-secondary hover:text-text-primary btn-press">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             {/* Clean Standard Stepper */}
             <div className="relative flex items-center justify-between px-4">
                {/* Connecting Line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-surface-high -z-10" />
                
                {STEPS.map((stepItem, index) => {
                    const stepNum = index + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    
                    return (
                        <div key={stepItem.label} className="flex flex-col items-center bg-surface px-2">
                            <div 
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${isActive 
                                        ? 'bg-accent border-accent text-white shadow-lg shadow-accent/25' 
                                        : isCompleted 
                                            ? 'bg-green-500 border-green-500 text-white' 
                                            : 'bg-surface border-surface-high text-text-secondary'
                                    }
                                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                            </div>
                            <span className={`text-xs font-bold mt-2 uppercase tracking-wide transition-colors ${isActive ? 'text-accent' : 'text-text-secondary'}`}>
                                {stepItem.label}
                            </span>
                        </div>
                    );
                })}
             </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth relative">
            
            {toastMessage && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2 z-20">
                  <Sparkles className="w-3 h-3" /> {toastMessage}
               </div>
            )}

            {isSubmitted ? (
               <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                     <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-text-primary mb-2">Received!</h2>
                  <p className="text-text-secondary">We're analyzing your blueprint. <br/>Closing in 3 seconds...</p>
               </div>
            ) : (
               <div className="space-y-6">

                  {/* STEP 1: CONTEXT */}
                  {step === 1 && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-text-secondary uppercase">Industry</label>
                              <div className="relative">
                                 <Briefcase className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                                 <input 
                                    value={formData.industry}
                                    onChange={(e) => handleChange('industry', e.target.value)}
                                    className={`w-full pl-10 p-3 rounded-xl bg-background border ${errors.industry ? 'border-red-500' : 'border-surface-high'} text-text-primary focus:border-accent outline-none`}
                                    placeholder="e.g. Healthcare"
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-text-secondary uppercase">Company Size</label>
                              <select 
                                 value={formData.companySize}
                                 onChange={(e) => handleChange('companySize', e.target.value)}
                                 className={`w-full p-3 rounded-xl bg-background border ${errors.companySize ? 'border-red-500' : 'border-surface-high'} text-text-primary focus:border-accent outline-none appearance-none`}
                              >
                                 <option value="">Select...</option>
                                 {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-text-secondary uppercase">Short Description</label>
                              <button 
                                 onClick={handleSummarizeChat}
                                 disabled={isSummarizing || chatHistory.length === 0}
                                 className="px-2 py-1 rounded bg-surface-high/30 hover:bg-accent hover:text-white transition-colors text-[10px] text-accent font-bold uppercase flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 {isSummarizing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                                 Fill from Chat
                              </button>
                           </div>
                           <textarea 
                              value={formData.description}
                              onChange={(e) => handleChange('description', e.target.value)}
                              className="w-full h-32 p-4 rounded-xl bg-background border border-surface-high text-text-primary focus:border-accent outline-none resize-none"
                              placeholder="What does your company do?"
                           />
                        </div>
                     </div>
                  )}

                  {/* STEP 2: GOALS */}
                  {step === 2 && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-text-secondary uppercase">Target Metrics (Success Criteria)</label>
                           <div className="relative">
                              <Target className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                              <input 
                                 value={formData.targetMetrics}
                                 onChange={(e) => handleChange('targetMetrics', e.target.value)}
                                 className="w-full pl-10 p-3 rounded-xl bg-background border border-surface-high text-text-primary focus:border-accent outline-none"
                                 placeholder="e.g. Reduce costs by 20%, Increase leads"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-xs font-bold text-text-secondary uppercase">Top Pain Point</label>
                           <div className="relative group">
                              <textarea 
                                 value={formData.painPoints}
                                 onChange={(e) => handleChange('painPoints', e.target.value)}
                                 className={`w-full h-40 p-4 rounded-xl bg-background border ${errors.painPoints ? 'border-red-500' : 'border-surface-high'} text-text-primary focus:border-accent outline-none resize-none`}
                                 placeholder="Describe the biggest bottleneck..."
                              />
                              <div className="absolute bottom-3 right-3 flex gap-2">
                                 {undoStack && (
                                    <button onClick={handleUndo} className="px-3 py-1.5 bg-surface border border-surface-high rounded-lg text-text-secondary hover:text-text-primary text-xs flex items-center gap-1 shadow-sm">
                                       <Undo className="w-3 h-3" /> Undo
                                    </button>
                                 )}
                                 <button 
                                    onClick={handleRefinePainPoints}
                                    disabled={isRefining || !formData.painPoints}
                                    className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-accent/20 disabled:opacity-0"
                                 >
                                    {isRefining ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Polish with AI
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* STEP 3: SCOPE */}
                  {step === 3 && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                        {/* Features */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2">
                              <Layers className="w-3 h-3" /> Services Required <span className="text-red-500">*</span>
                           </label>
                           <div className={`flex flex-wrap gap-2 ${errors.features ? 'p-2 border border-red-500/50 rounded-lg' : ''}`}>
                              {FEATURES_LIST.map(f => (
                                 <button
                                    key={f}
                                    onClick={() => toggleFeature(f)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                       formData.features.includes(f) 
                                       ? 'bg-accent border-accent text-white' 
                                       : 'bg-background border-surface-high text-text-secondary hover:border-accent/50'
                                    }`}
                                 >
                                    {f}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2">
                               <DollarSign className="w-3 h-3" /> Budget Preference
                           </label>
                           <div className="grid grid-cols-3 gap-3">
                              {(['Fast', 'Standard', 'Flexible'] as const).map((band) => (
                                 <button
                                    key={band}
                                    onClick={() => handleChange('budgetBand', band)}
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                       formData.budgetBand === band
                                       ? 'bg-accent/10 border-accent text-accent'
                                       : 'bg-background border-surface-high text-text-secondary hover:border-text-secondary'
                                    }`}
                                 >
                                    <div className="text-sm font-bold">{band}</div>
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2">
                               <Clock className="w-3 h-3" /> Ideal Timeline <span className="text-red-500">*</span>
                           </label>
                           <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${errors.timeline ? 'p-2 border border-red-500/50 rounded-lg' : ''}`}>
                              {TIMELINE_OPTS.map(t => (
                                 <button
                                    key={t}
                                    onClick={() => handleChange('timeline', t)}
                                    className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                                       formData.timeline === t
                                       ? 'bg-text-primary text-background border-text-primary'
                                       : 'bg-background border-surface-high text-text-secondary hover:border-text-secondary'
                                    }`}
                                 >
                                    {t}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* STEP 4: CONTACT */}
                  {step === 4 && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-text-secondary uppercase">Email Address <span className="text-red-500">*</span></label>
                           <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                              <input 
                                 type="email"
                                 value={formData.email}
                                 onChange={(e) => handleChange('email', e.target.value)}
                                 className={`w-full pl-10 p-3 rounded-xl bg-background border ${errors.email ? 'border-red-500' : 'border-surface-high'} text-text-primary focus:border-accent outline-none`}
                                 placeholder="you@company.com"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-xs font-bold text-text-secondary uppercase">Phone Number</label>
                           <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                              <input 
                                 type="tel"
                                 value={formData.phone}
                                 onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                                 className="w-full pl-10 p-3 rounded-xl bg-background border border-surface-high text-text-primary focus:border-accent outline-none"
                                 placeholder="(555) 000-0000"
                              />
                           </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-surface-high/10 rounded-xl border border-surface-high">
                           <input 
                              type="checkbox" 
                              id="saveChat"
                              checked={formData.saveChatHistory}
                              onChange={(e) => handleChange('saveChatHistory', e.target.checked)}
                              className="mt-1 w-4 h-4 accent-accent"
                           />
                           <label htmlFor="saveChat" className="text-sm text-text-secondary">
                              <strong>Persist Chat Context?</strong>
                              <br/>
                              Allows our team to read your conversation with the AI to better understand your needs.
                           </label>
                        </div>
                     </div>
                  )}

               </div>
            )}

         </div>

         {/* Footer */}
         {!isSubmitted && (
            <div className="bg-surface border-t border-surface-high p-4 flex justify-between items-center">
               <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors btn-press"
               >
                  <ChevronLeft className="w-4 h-4" /> Back
               </button>

               <button
                  onClick={step === 4 ? handleSubmit : handleNext}
                  className={`
                     px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all duration-300 btn-press
                     ${step === 4 
                        ? 'bg-accent text-white hover:shadow-accent/30 w-40 justify-center' 
                        : 'bg-text-primary text-background hover:bg-white/90'
                     }
                  `}
               >
                  {step === 4 ? (
                     <>Submit <Send className="w-4 h-4" /></>
                  ) : (
                     <>Next <ChevronRight className="w-4 h-4" /></>
                  )}
               </button>
            </div>
         )}

      </div>
    </div>
  );
};

export default ProjectFormModal;
