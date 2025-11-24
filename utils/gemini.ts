import { GoogleGenAI, Type } from "@google/genai";

/**
 * GEMINI SERVICE ABSTRACTION LAYER
 * 
 * Uses @google/genai SDK directly on the client.
 * Includes graceful fallback to Mock Mode if API key is missing or calls fail.
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

const FALLBACK_AUDIT: AuditResult = {
  assessment: "System Offline Mode: We couldn't analyze your specific text, but generally, manual data entry is the #1 bottleneck for growing SMBs.",
  recommendedActions: ["Map your current workflow steps manually", "Identify where you use spreadsheets", "Contact us for a full personalized audit"],
  impactEstimate: "Typical automation projects save 10-20 hours/week."
};

const FALLBACK_IDEAS: Idea[] = [
  { title: "Example: Client Portal", pitch: "(Offline Fallback) A centralized hub for client documents.", tags: ["Example", "Portal"] },
  { title: "Example: Inventory Bot", pitch: "(Offline Fallback) Automated tracking for stock levels.", tags: ["Example", "Automation"] },
  { title: "Example: Scheduling AI", pitch: "(Offline Fallback) Smart calendar management.", tags: ["Example", "Scheduling"] }
];

// --- Helper for simulated latency (Mock Mode) ---
const simulateNetworkDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // Initialize the SDK with the key defined in vite.config.ts
    // The define plugin in vite.config.ts ensures process.env.API_KEY is populated
    try {
      if (process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } else {
        console.warn("Gemini API Key missing. Falling back to Mock Mode.");
      }
    } catch (error) {
      console.error("Failed to initialize Gemini SDK:", error);
    }
  }

  // --- PUBLIC METHODS ---

  public async sendChat(message: string, context: any[] = []): Promise<ServiceResponse<ChatResponse>> {
    if (!this.ai) return this.mockChat(message);

    try {
      // Basic Text Task: 'gemini-2.5-flash'
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User said: "${message}".`,
        config: {
          systemInstruction: "You are the TEKGUYZ Assistant, a helpful and professional software consultant AI. You help users scope projects, estimate costs, and draft content. Always return valid JSON with 'message' (string), 'suggestions' (string array), and 'projectData' (object).",
          responseMimeType: "application/json",
          // Schema is omitted here to allow 'projectData' to be flexible/loose, but we rely on the prompt to enforce JSON
        }
      });

      const parsedData = JSON.parse(response.text || '{}');

      return {
        status: 'success',
        data: {
            role: 'assistant',
            message: parsedData.message || response.text || "I'm here to help.",
            suggestions: parsedData.suggestions || [],
            projectData: parsedData.projectData || {}
        }
      };

    } catch (error) {
      console.warn("Gemini API Error (Chat):", error);
      return this.mockChat(message);
    }
  }

  public async summarizeChat(history: any[]): Promise<ServiceResponse<string>> {
    if (!this.ai) return { status: 'success', isFallback: true, data: "User inquired about automation. (Mock Summary)" };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize this chat history into a concise project context note:\n${JSON.stringify(history)}`,
      });
      return { status: 'success', data: response.text || "" };
    } catch (e) {
      return { status: 'success', isFallback: true, data: "Summary unavailable (Network Error)" };
    }
  }

  public async auditInput(input: string): Promise<ServiceResponse<AuditResult>> {
    if (!this.ai) {
        await simulateNetworkDelay(1200);
        return { status: 'success', isFallback: true, data: FALLBACK_AUDIT };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Audit this business problem: "${input}". Provide an assessment, recommended actions, and impact estimate.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assessment: { type: Type.STRING },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              impactEstimate: { type: Type.STRING }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      return { status: 'success', data };
    } catch (e) {
      console.warn("Gemini API Error (Audit):", e);
      return { status: 'success', isFallback: true, data: FALLBACK_AUDIT };
    }
  }

  public async generateIdeas(prompt: string): Promise<ServiceResponse<Idea[]>> {
    if (!this.ai) {
        await simulateNetworkDelay(1200);
        return { status: 'success', isFallback: true, data: FALLBACK_IDEAS };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 software project ideas for: "${prompt}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                pitch: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      });

      let data = JSON.parse(response.text || '[]');
      if (!Array.isArray(data) && (data as any).ideas) data = (data as any).ideas;
      
      return { status: 'success', data: Array.isArray(data) ? data : FALLBACK_IDEAS };
    } catch (e) {
      console.warn("Gemini API Error (Ideas):", e);
      return { status: 'success', isFallback: true, data: FALLBACK_IDEAS };
    }
  }

  public async refineText(text: string): Promise<ServiceResponse<string>> {
    if (!this.ai) {
        await simulateNetworkDelay(800);
        return { status: 'success', isFallback: true, data: `Refined: ${text} [Mock Mode]` };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite this text to be professional, clear, and concise for a business proposal: "${text}"`,
      });
      return { status: 'success', data: response.text || text };
    } catch (e) {
      return { status: 'success', isFallback: true, data: text };
    }
  }

  // --- MOCK FALLBACKS ---

  private async mockChat(message: string): Promise<ServiceResponse<ChatResponse>> {
      await simulateNetworkDelay(800);
      
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

export const geminiService = new GeminiService();