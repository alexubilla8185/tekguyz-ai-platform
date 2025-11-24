
import { useGlobal, useChat } from '../context/GlobalContext';

/**
 * HOOK: useChatbotBridge
 * 
 * Manages the "Intelligence Layer" between the Chatbot and the rest of the application.
 * 
 * Responsibilities:
 * 1. receiveChatbotData: Intelligently merges structured AI data into the Project Form state.
 * 2. summarizeChat: Provides instant context summaries without network calls.
 */
export const useChatbotBridge = () => {
  const { userIntent, setUserIntent } = useGlobal();
  const { chatHistory } = useChat();

  /**
   * Merges incoming AI-suggested data with existing intent state.
   * Handles deep merging for known nested objects (companyInfo, goals, etc)
   * to prevent overwriting existing user inputs.
   */
  const receiveChatbotData = (data: Record<string, any>) => {
    if (!data || Object.keys(data).length === 0) return;

    console.log("Bridge: Merging AI data into User Intent", data);

    // Create a shallow copy of the current state to mutate safely
    const mergedIntent = { ...userIntent };

    // List of keys known to be objects that need deep merging
    const nestedKeys = ['companyInfo', 'goals', 'scope', 'timeline', 'contact'];

    Object.keys(data).forEach((key) => {
      const isNested = nestedKeys.includes(key);
      const isObject = typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key]);

      if (isNested && isObject) {
        // Deep merge for structural objects
        mergedIntent[key] = {
          ...(mergedIntent[key] || {}),
          ...data[key]
        };
      } else {
        // Direct overwrite for primitives or arrays (like tags/features lists)
        mergedIntent[key] = data[key];
      }
    });

    setUserIntent(mergedIntent);
  };

  /**
   * Generates a mocked summary of the conversation history.
   * Does NOT make network requests (Phase 3 Requirement).
   * Used for auto-filling "Notes" or "Context" fields in forms.
   */
  const summarizeChat = (): string => {
    if (!chatHistory || chatHistory.length === 0) {
      return "No conversation history available.";
    }

    const userMsgCount = chatHistory.filter(m => m.role === 'user').length;
    const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');

    if (userMsgCount === 0) return "User has not actively participated yet.";

    // Simple heuristic summary
    return `Session Summary: User exchanged ${userMsgCount} messages. Last topic of interest appeared to be: "${lastUserMsg?.text}". (Auto-generated via TEKGUYZ Bridge)`;
  };

  return {
    receiveChatbotData,
    summarizeChat
  };
};
