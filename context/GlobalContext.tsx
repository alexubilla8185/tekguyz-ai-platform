
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { GlobalContextType, ChatContextType, Theme, ChatMessage, CaseStudy, AccentColor } from '../types';

// UPDATED: Colors moved to 600-series for WCAG AA (4.5:1) Compliance on white text
export const ACCENT_COLORS: AccentColor[] = [
  { name: 'TEKGUYZ Blue', value: '37 99 235', hex: '#2563EB' },   // blue-600
  { name: 'Vivid Purple', value: '124 58 237', hex: '#7C3AED' }, // violet-600
  { name: 'Emerald', value: '5 150 105', hex: '#059669' },      // emerald-600
  { name: 'Rose', value: '225 29 72', hex: '#E11D48' },         // rose-600
  { name: 'Amber', value: '217 119 6', hex: '#D97706' },        // amber-600
];

// --- Default States ---

const defaultGlobalState: GlobalContextType = {
  theme: 'true-dark',
  accentColor: ACCENT_COLORS[0],
  isMobileMenuOpen: false,
  showProjectFormModal: false,
  showAIFeaturesModal: false,
  showChatPanel: false,
  showProjectInfoModal: false,
  selectedCaseStudy: null,
  activeSection: 'hero',
  aiContext: [],
  userIntent: {},
  userIntentProfile: {},
  ambientParticleDensity: 50,
  setTheme: () => {},
  toggleTheme: () => {},
  setAccentColor: () => {},
  setIsMobileMenuOpen: () => {},
  setShowProjectFormModal: () => {},
  setShowAIFeaturesModal: () => {},
  setShowChatPanel: () => {},
  setShowProjectInfoModal: () => {},
  setSelectedCaseStudy: () => {},
  setActiveSection: () => {},
  setAiContext: () => {},
  setUserIntent: () => {},
  setUserIntentProfile: () => {},
  setAmbientParticleDensity: () => {},
};

const defaultChatState: ChatContextType = {
  chatHistory: [],
  setChatHistory: () => {},
  addToChatHistory: () => {},
};

// --- Contexts ---
const GlobalContext = createContext<GlobalContextType>(defaultGlobalState);
const ChatContext = createContext<ChatContextType>(defaultChatState);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- UI State ---
  const [theme, setThemeState] = useState<Theme>('true-dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>(ACCENT_COLORS[0]);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProjectFormModal, setShowProjectFormModalState] = useState(false);
  const [showAIFeaturesModal, setShowAIFeaturesModalState] = useState(false);
  const [showChatPanel, setShowChatPanelState] = useState(false);
  const [showProjectInfoModal, setShowProjectInfoModalState] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudyState] = useState<CaseStudy | null>(null);
  const [activeSection, setActiveSection] = useState('hero');

  // --- AI / Data State ---
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiContext, setAiContext] = useState<any[]>([]);
  const [userIntent, setUserIntent] = useState<Record<string, any>>({});
  const [userIntentProfile, setUserIntentProfile] = useState<Record<string, any>>({});
  const [ambientParticleDensity, setAmbientParticleDensity] = useState(50);

  // --- Persistence & Injection Logic ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedAccentName = localStorage.getItem('accentColor');
    
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      setThemeState('true-dark');
    }
    
    if (savedAccentName) {
      const savedAccent = ACCENT_COLORS.find(c => c.name === savedAccentName);
      if (savedAccent) {
        setAccentColorState(savedAccent);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accentColor.value);
    localStorage.setItem('accentColor', accentColor.name);
  }, [accentColor]);

  // --- Actions ---

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'true-dark' ? 'dark' : 'true-dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor);
  };

  // --- Mutual Exclusion Setters (QA Fix for Mobile Z-Index Overlaps) ---

  const setShowProjectFormModal = (show: boolean) => {
    if (show) {
      setShowAIFeaturesModalState(false);
      setShowChatPanelState(false);
      setShowProjectInfoModalState(false);
      setSelectedCaseStudyState(null);
      setIsMobileMenuOpen(false);
    }
    setShowProjectFormModalState(show);
  };

  const setShowAIFeaturesModal = (show: boolean) => {
    if (show) {
      setShowProjectFormModalState(false);
      setShowChatPanelState(false);
      setShowProjectInfoModalState(false);
      setSelectedCaseStudyState(null);
      setIsMobileMenuOpen(false);
    }
    setShowAIFeaturesModalState(show);
  };

  const setShowChatPanel = (show: boolean) => {
    if (show) {
      setShowProjectFormModalState(false);
      setShowAIFeaturesModalState(false);
      setShowProjectInfoModalState(false);
      setSelectedCaseStudyState(null);
      setIsMobileMenuOpen(false);
    }
    setShowChatPanelState(show);
  };

  const setShowProjectInfoModal = (show: boolean) => {
    if (show) {
      setShowProjectFormModalState(false);
      setShowAIFeaturesModalState(false);
      setShowChatPanelState(false);
      setSelectedCaseStudyState(null);
      setIsMobileMenuOpen(false);
    }
    setShowProjectInfoModalState(show);
  };

  const setSelectedCaseStudy = (study: CaseStudy | null) => {
    if (study) {
      setShowProjectFormModalState(false);
      setShowAIFeaturesModalState(false);
      setShowChatPanelState(false);
      setShowProjectInfoModalState(false);
      setIsMobileMenuOpen(false);
    }
    setSelectedCaseStudyState(study);
  };

  const addToChatHistory = (message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  // --- Memoized Values ---

  // 1. Global UI & Data Value (Low Frequency)
  const globalValue: GlobalContextType = useMemo(() => ({
    theme,
    accentColor,
    isMobileMenuOpen,
    showProjectFormModal,
    showAIFeaturesModal,
    showChatPanel,
    showProjectInfoModal,
    selectedCaseStudy,
    activeSection,
    aiContext,
    userIntent,
    userIntentProfile,
    ambientParticleDensity,
    setTheme,
    toggleTheme,
    setAccentColor,
    setIsMobileMenuOpen,
    setShowProjectFormModal,
    setShowAIFeaturesModal,
    setShowChatPanel,
    setShowProjectInfoModal,
    setSelectedCaseStudy,
    setActiveSection,
    setAiContext,
    setUserIntent,
    setUserIntentProfile,
    setAmbientParticleDensity,
  }), [
    theme, accentColor, isMobileMenuOpen, 
    showProjectFormModal, showAIFeaturesModal, showChatPanel, showProjectInfoModal,
    selectedCaseStudy, activeSection, 
    aiContext, userIntent, userIntentProfile, ambientParticleDensity
  ]);

  // 2. Chat Value (High Frequency)
  const chatValue: ChatContextType = useMemo(() => ({
    chatHistory,
    setChatHistory,
    addToChatHistory
  }), [chatHistory]);

  return (
    <GlobalContext.Provider value={globalValue}>
      <ChatContext.Provider value={chatValue}>
        {children}
      </ChatContext.Provider>
    </GlobalContext.Provider>
  );
};

// --- Hooks ---

/**
 * useGlobal
 * Returns Main UI & Data state.
 * Does NOT trigger re-renders on chat history updates.
 */
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

/**
 * useChat
 * Returns Chat state (history + setters).
 * Use this only in components that render the chat log.
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a GlobalProvider');
  }
  return context;
};
