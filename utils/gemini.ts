import { ChatMessage } from "../types";

/**
 * GEMINI SERVICE ABSTRACTION LAYER
 * 
 * Supports both:
 * 1. REAL AI (via Netlify Proxy) - Used if deployed and configured.
 * 2. MOCK AI (Client-side Simulation) - Used if local or proxy fails.
 */

// --- Types ---

export interface ServiceResponse<T> {
  data: T | null;
  error?: string;
  status: 'success' | 'error';
  isFallback?: boolean;
}

export interface ChatResponse {
  role: 'assistant';
  message: string;
  suggestions: string[];
  projectData?: Record<string, any>;
}

export interface ProjectIntake {
  companyInfo: { name?: string; industry?: string; size?: string; };
  goals: { primary?: string; secondary?: string[]; };
  scope: { features: string[]; platforms: string[]; };
  timeline: { expectedStart?: string; deadline?: string; };
  contact: { name?: string; email?: string; };
}

export interface Idea {
  title: string;
  pitch: string;
  tags: string[];
}

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
  { title: "Example: Client Portal", pitch: "(Offline Fallback) A centralized hub for client documents.", tags: ["Example", "Portal"] },
  { title: "Example: Inventory Bot", pitch: "(Offline Fallback) Automated tracking for stock levels.", tags: ["Example", "Automation"] },
  { title: "Example: Scheduling AI", pitch: "(Offline Fallback) Smart calendar management.", tags: ["Example", "Scheduling"] }
];

const FALLBACK_AUDIT: AuditResult = {
  assessment: "System Offline Mode: We couldn't analyze your specific text, but generally, manual data entry is the #1 bottleneck for growing SMBs.",
  recommendedActions: ["Map your current workflow steps manually", "Identify where you use spreadsheets", "Contact us for a full personalized audit"],
  impactEstimate: "Typical automation projects save 10-20 hours/week."
};

const FALLBACK_INTAKE: ProjectIntake = {
  companyInfo: { name: "", industry: "", size: "" },
  goals: { primary: "", secondary: [] },
  scope: { features: [], platforms: [] },
  timeline: { expectedStart: "", deadline: "" },
  contact: { name: "", email: "" }
};

// --- Helper for simulated latency (Mock Mode) ---
const simulateNetworkDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export class GeminiService {
  
  /**
   * PROXY HANDLER
   * Attempts to call the serverless function. Throws error if fails/404.
   */
  private async callProxy(prompt: string, systemInstruction?: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Proxy Error: ${response.status}`);
      
      const data = await response.json();
      return data.text;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Bubble up to trigger fallback
    }
  }

  // --- PUBLIC METHODS ---

  public async sendChat(message: string, context: any[] = []): Promise<ServiceResponse<ChatResponse>> {
    try {
      // 1. Try Real AI
      const prompt = `User said: "${message}". Respond as TEKGUYZ Assistant (helpful, professional, outcome-focused). JSON format: { "message": string, "suggestions": string[], "projectData": object }`;
      const jsonStr = await this.callProxy(prompt, "You are a helpful software consultant AI. Always return valid JSON.");
      
      // Clean markdown if present
      const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      return {
        status: 'success',
        data: {
            role: 'assistant',
            message: parsedData.message || parsedData.text,
            suggestions: parsedData.suggestions || [],
            projectData: parsedData.projectData || {}
        }
      };

    } catch (error) {
      console.warn("Using Mock Fallback for Chat:", error);
      await simulateNetworkDelay(800);
      
      // Mock Logic
      const msgLower = message.toLowerCase();
      let responseData: ChatResponse = {
        role: 'assistant',
        message: "I'm the TEKGUYZ Assistant. I can help you scope projects, estimate costs, or draft content. How can I help your business today?",
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
      }

      return { status: 'success', isFallback: true, data: responseData };
    }
  }

  public async summarizeChat(history: any[]): Promise<ServiceResponse<string>> {
    try {
      const prompt = `Summarize this chat history into a concise project context note:\n${JSON.stringify(history)}`;
      const text = await this.callProxy(prompt);
      return { status: 'success', data: text };
    } catch (e) {
      await simulateNetworkDelay(600);
      return { status: 'success', isFallback: true, data: "User inquired about pricing for an automation bot. AI provided range $5k-$15k. (Mock Summary)" };
    }
  }

  public async auditInput(input: string): Promise<ServiceResponse<AuditResult>> {
    try {
      const prompt = `Audit this business problem: "${input}". Return JSON: { "assessment": string, "recommendedActions": string[], "impactEstimate": string }`;
      const jsonStr = await this.callProxy(prompt, "You are a business analyst AI. Return valid JSON.");
      const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      return { status: 'success', data };
    } catch (e) {
      await simulateNetworkDelay(1200);
      return { status: 'success', isFallback: true, data: FALLBACK_AUDIT };
    }
  }

  public async generateIdeas(prompt: string): Promise<ServiceResponse<Idea[]>> {
    try {
      const fullPrompt = `Generate 3 software project ideas for: "${prompt}". Return JSON array of objects: { "title": string, "pitch": string, "tags": string[] }`;
      const jsonStr = await this.callProxy(fullPrompt, "You are a creative product manager AI. Return valid JSON.");
      const cleanJson = jsonStr.replace(/```json|```/g, '').trim();
      let data = JSON.parse(cleanJson);
      if(!Array.isArray(data)) data = data.ideas || []; // Handle potential nesting
      return { status: 'success', data };
    } catch (e) {
      await simulateNetworkDelay(1200);
      return { status: 'success', isFallback: true, data: FALLBACK_IDEAS };
    }
  }

  public async refineText(text: string): Promise<ServiceResponse<string>> {
    try {
      const prompt = `Rewrite this text to be professional and clear: "${text}"`;
      const result = await this.callProxy(prompt);
      return { status: 'success', data: result };
    } catch (e) {
      await simulateNetworkDelay(800);
      return { status: 'success', isFallback: true, data: `Refined: ${text} [Polished for clarity and impact - Mock Mode]` };
    }
  }
}

export const geminiService = new GeminiService();