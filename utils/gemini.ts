import { ChatMessage } from "../types";

/**
 * GEMINI SERVICE ABSTRACTION LAYER
 * 
 * Phase 3 - Section G: AI Safety + Fallback Behavior
 * 
 * Rules:
 * 1. No Client-Side API Keys.
 * 2. No direct GoogleGenAI SDK calls (simulated here).
 * 3. Returns strict structured mock data.
 * 4. SAFETY LAYER: Catches all errors and returns graceful "Example" data
 *    so the UI never breaks or shows raw error codes.
 */

// --- Types ---

export interface ServiceResponse<T> {
  data: T | null;
  error?: string;
  status: 'success' | 'error';
  isFallback?: boolean; // New flag to indicate safe mode
}

// 1. Chat Response Format
export interface ChatResponse {
  role: 'assistant';
  message: string;
  suggestions: string[];
  projectData?: Record<string, any>;
}

// 2. Structured Project Intake Format
export interface ProjectIntake {
  companyInfo: {
    name?: string;
    industry?: string;
    size?: string;
  };
  goals: {
    primary?: string;
    secondary?: string[];
  };
  scope: {
    features: string[];
    platforms: string[];
  };
  timeline: {
    expectedStart?: string;
    deadline?: string;
  };
  contact: {
    name?: string;
    email?: string;
  };
}

// 3. Idea Generation Format
export interface Idea {
  title: string;
  pitch: string;
  tags: string[];
}

// 4. Audit Format
export interface AuditResult {
  assessment: string;
  recommendedActions: string[];
  impactEstimate: string;
}

// --- CONSTANTS: SAFE FALLBACK DATA ---

const FALLBACK_CHAT_RESPONSE: ChatResponse = {
  role: 'assistant',
  message: "I'm currently operating in offline mode. I can't process complex queries right now, but you can explore our tools or start a project form manually to get in touch.",
  suggestions: ["Start Project Form", "Explore AI Tools", "Browse Case Studies"],
  projectData: {}
};

const FALLBACK_IDEAS: Idea[] = [
  {
    title: "Example: Client Portal",
    pitch: "(Offline Fallback) A centralized hub for client documents and status updates.",
    tags: ["Example", "Portal"]
  },
  {
    title: "Example: Inventory Bot",
    pitch: "(Offline Fallback) Automated tracking for stock levels and reordering.",
    tags: ["Example", "Automation"]
  },
  {
    title: "Example: Scheduling AI",
    pitch: "(Offline Fallback) Smart calendar management for field teams.",
    tags: ["Example", "Scheduling"]
  }
];

const FALLBACK_AUDIT: AuditResult = {
  assessment: "System Offline Mode: We couldn't analyze your specific text, but generally, manual data entry is the #1 bottleneck for growing SMBs.",
  recommendedActions: [
    "Map your current workflow steps manually",
    "Identify where you use spreadsheets",
    "Contact us for a full personalized audit"
  ],
  impactEstimate: "Typical automation projects save 10-20 hours/week."
};

const FALLBACK_INTAKE: ProjectIntake = {
  companyInfo: { name: "", industry: "", size: "" },
  goals: { primary: "", secondary: [] },
  scope: { features: [], platforms: [] },
  timeline: { expectedStart: "", deadline: "" },
  contact: { name: "", email: "" }
};

// --- Helper for simulated latency ---
const simulateNetworkDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export class GeminiService {
  
  /**
   * 1) sendChat
   * Returns: { role, message, suggestions, projectData }
   */
  public async sendChat(message: string, context: any[] = []): Promise<ServiceResponse<ChatResponse>> {
    try {
      await simulateNetworkDelay(1000);
      
      const msgLower = message.toLowerCase();
      
      // Simulate an error for testing "Safety" if message is "error"
      if (msgLower === 'error') throw new Error("Simulated Crash");

      let responseData: ChatResponse = {
        role: 'assistant',
        message: "I'm Nexus, your AI assistant. I can help you scope projects, estimate costs, or draft content. How can I help your business today?",
        suggestions: ["Scope a project", "Estimate costs", "Draft a proposal"],
        projectData: {}
      };

      if (msgLower.includes('price') || msgLower.includes('cost')) {
        responseData = {
          role: 'assistant',
          message: "Project costs vary based on complexity. Typically, our automation solutions range from $5k–$15k, while full platform builds start at $25k. Would you like to run a scope analysis?",
          suggestions: ["Run scope analysis", "See case studies", "Contact sales"],
          projectData: { estimatedRange: "$5k - $25k" }
        };
      } else if (msgLower.includes('hello') || msgLower.includes('hi')) {
        responseData = {
          role: 'assistant',
          message: "Hello! Ready to optimize your operations? Tell me a bit about what you're looking to build.",
          suggestions: ["Automate a workflow", "Build a customer portal", "Analyze my data"],
          projectData: {}
        };
      }

      return { status: 'success', data: responseData };

    } catch (error) {
      console.warn("GeminiService Safety Layer triggered: sendChat failed.");
      // Graceful Fallback: Return success status with safe message
      return {
        status: 'success',
        isFallback: true,
        data: FALLBACK_CHAT_RESPONSE
      };
    }
  }

  /**
   * 2) summarizeChat
   * Compresses chat history.
   */
  public async summarizeChat(history: ChatMessage[]): Promise<ServiceResponse<string>> {
    try {
      await simulateNetworkDelay(600);
      if (!history || history.length === 0) throw new Error("No history");
      
      return {
        status: 'success',
        data: "User inquired about pricing for an automation bot. AI provided range $5k-$15k."
      };
    } catch (error) {
      console.warn("GeminiService Safety Layer triggered: summarizeChat failed.");
      return { 
        status: 'success', // Prevent UI error states
        isFallback: true,
        data: "Unable to generate specific summary at this time. (Offline Mode)" 
      };
    }
  }

  /**
   * 3) auditInput
   * Returns: { assessment, recommendedActions, impactEstimate }
   */
  public async auditInput(input: string): Promise<ServiceResponse<AuditResult>> {
    try {
      await simulateNetworkDelay(1200);
      
      if (!input) throw new Error("Empty input");

      // Mock logic based on keywords
      const isTech = input.toLowerCase().includes('app') || input.toLowerCase().includes('web');
      
      return {
        status: 'success',
        data: {
          assessment: isTech 
            ? "Your request involves custom software development. Key challenges include integration and user adoption." 
            : "This appears to be an operational optimization request. Efficiency gains are likely high.",
          recommendedActions: [
            "Map current workflow steps",
            "Identify key bottlenecks",
            "Define success metrics (KPIs)"
          ],
          impactEstimate: "Potential to reduce manual processing time by 40-60%."
        }
      };
    } catch (error) {
       console.warn("GeminiService Safety Layer triggered: auditInput failed.");
      // Return Safe Example Data
      return { 
        status: 'success', 
        isFallback: true,
        data: FALLBACK_AUDIT
      };
    }
  }

  /**
   * 4) generateIdeas
   * Returns: Idea[]
   */
  public async generateIdeas(prompt: string): Promise<ServiceResponse<Idea[]>> {
    try {
      await simulateNetworkDelay(1200);
      return {
        status: 'success',
        data: [
          {
            title: "Automated Client Portal",
            pitch: "A secure dashboard for your clients to upload documents and track status, reducing email clutter.",
            tags: ["Customer Service", "Web App"]
          },
          {
            title: "Inventory Prediction Engine",
            pitch: "Use your historical sales data to predict stock needs 4 weeks out.",
            tags: ["Data Science", "Retail"]
          },
          {
            title: "Smart Triage Bot",
            pitch: "An AI agent that routes incoming support tickets to the right department instantly.",
            tags: ["Automation", "Support"]
          }
        ]
      };
    } catch (error) {
      console.warn("GeminiService Safety Layer triggered: generateIdeas failed.");
      return { 
        status: 'success', 
        isFallback: true,
        data: FALLBACK_IDEAS 
      };
    }
  }

  /**
   * 5) refineText
   * Polishes raw user input.
   */
  public async refineText(text: string): Promise<ServiceResponse<string>> {
    try {
      await simulateNetworkDelay(800);
      if (!text) throw new Error("Empty text");
      return {
        status: 'success',
        data: `Refined: ${text} [Polished for clarity and impact.]`
      };
    } catch (error) {
      console.warn("GeminiService Safety Layer triggered: refineText failed.");
      // Safe fallback: Return original text so user loses nothing
      return { 
        status: 'success', 
        isFallback: true,
        data: text 
      };
    }
  }

  /**
   * 6) extractProjectDetails
   * Returns: ProjectIntake
   */
  public async extractProjectDetails(rawInput: string): Promise<ServiceResponse<ProjectIntake>> {
    try {
      await simulateNetworkDelay(1500);
      return {
        status: 'success',
        data: {
          companyInfo: {
            name: "Acme Corp",
            industry: "Logistics",
            size: "10-50"
          },
          goals: {
            primary: "Reduce manual data entry",
            secondary: ["Improve accuracy", "Faster billing cycles"]
          },
          scope: {
            features: ["OCR Parsing", "Quickbooks Integration", "Email Bot"],
            platforms: ["Web", "Cloud"]
          },
          timeline: {
            expectedStart: "ASAP",
            deadline: "Q4 2024"
          },
          contact: {
            name: "John Doe",
            email: "john@example.com"
          }
        }
      };
    } catch (error) {
      console.warn("GeminiService Safety Layer triggered: extractProjectDetails failed.");
      return { 
        status: 'success', 
        isFallback: true,
        data: FALLBACK_INTAKE 
      };
    }
  }
}

export const geminiService = new GeminiService();