
export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
}

export interface ProjectItem {
  title: string;
  category: string;
  imageUrl: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  metrics: {
    label: string;
    value: number; // Numeric value for count-up
    valueDisplay: string; // Display string (e.g. "65%")
    detail: string; // Context for back of card
  }[];
  tags: string[];
}

export interface AdditionalProject {
  id: string;
  title: string;
  industry: string;
  outcome: string;
  tags: string[];
  highlight: string;
}

export type Theme = 'dark' | 'true-dark';

// Defines RGB structure for accent colors
export interface AccentColor {
  name: string;
  value: string; // RGB values like "59 130 246"
  hex: string;   // Hex for UI display
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  suggestions?: string[];
}

export interface GlobalState {
  theme: Theme;
  accentColor: AccentColor;
  isMobileMenuOpen: boolean;
  showProjectFormModal: boolean;
  showAIFeaturesModal: boolean;
  showChatPanel: boolean;
  selectedCaseStudy: CaseStudy | null;
  activeSection: string;
  // chatHistory moved to ChatState
  aiContext: any[]; // Flexible type for AI context chunks
  userIntent: Record<string, any>;
  userIntentProfile: Record<string, any>;
  ambientParticleDensity: number;
}

// Separate Chat Context for Performance Isolation
export interface ChatContextType {
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[]) => void;
  addToChatHistory: (message: ChatMessage) => void;
}

// Main UI/Data Context
export interface GlobalContextType extends GlobalState {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccentColor: (color: AccentColor) => void;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setShowProjectFormModal: (show: boolean) => void;
  setShowAIFeaturesModal: (show: boolean) => void;
  setShowChatPanel: (show: boolean) => void;
  setSelectedCaseStudy: (study: CaseStudy | null) => void;
  setActiveSection: (section: string) => void;
  // Chat setters moved to ChatContextType
  setAiContext: (context: any[]) => void;
  setUserIntent: (intent: Record<string, any>) => void;
  setUserIntentProfile: (profile: Record<string, any>) => void;
  setAmbientParticleDensity: (density: number) => void;
}

// Placeholder for future API types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
