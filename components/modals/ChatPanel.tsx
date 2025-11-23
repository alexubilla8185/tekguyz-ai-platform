
import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, Sparkles, User, ArrowRight, Mic } from 'lucide-react';
import { useGlobal, useChat } from '../../context/GlobalContext';
import { geminiService } from '../../utils/gemini';
import { ChatMessage } from '../../types';
import { useChatbotBridge } from '../../hooks/useChatbotBridge';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const ChatPanel: React.FC = () => {
  const { 
    showChatPanel, 
    setShowChatPanel, 
    setShowProjectFormModal,
    setShowAIFeaturesModal
  } = useGlobal();

  // Use Chat Context for messages
  const { chatHistory, addToChatHistory } = useChat();
  const { receiveChatbotData } = useChatbotBridge();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Accessibility: Focus Trap Hook
  const containerRef = useFocusTrap(() => setShowChatPanel(false));

  // Robust Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    // Add a small delay to ensure DOM paint is complete before scrolling
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chatHistory, isTyping]);

  // Initial Greeting if history is empty
  useEffect(() => {
    if (showChatPanel && chatHistory.length === 0 && !isTyping) {
       handleSend("Hello", true);
    }
  }, [showChatPanel]);

  const handleSuggestionClick = (suggestion: string) => {
    const lower = suggestion.toLowerCase();
    
    // Action Routing
    if (lower.includes('start your project') || lower.includes('scope a project')) {
        setShowChatPanel(false);
        setShowProjectFormModal(true);
        return;
    }
    if (lower.includes('see our work') || lower.includes('case studies')) {
        setShowChatPanel(false);
        const workSection = document.getElementById('work');
        if (workSection) {
            workSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.hash = '#work';
        }
        return;
    }
    if (lower.includes('explore ai') || lower.includes('features')) {
        setShowChatPanel(false);
        setShowAIFeaturesModal(true);
        return;
    }

    handleSend(suggestion);
  };

  const handleSend = async (text: string, isSilentInit: boolean = false) => {
    if (!text.trim()) return;

    if (!isSilentInit) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: text,
        timestamp: Date.now(),
      };
      addToChatHistory(userMsg);
      setInput('');
    }

    setIsTyping(true);

    try {
      const response = await geminiService.sendChat(text, []); 
      
      setIsTyping(false);

      if (response.status === 'success' && response.data) {
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: response.data.message,
            timestamp: Date.now(),
            suggestions: response.data.suggestions
        };
        addToChatHistory(aiMsg);

        if (response.data.projectData && Object.keys(response.data.projectData).length > 0) {
            receiveChatbotData(response.data.projectData);
        }
      } else {
        const errorMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'model',
            text: "I'm having a little trouble connecting right now. Please check your internet or try again in a moment.",
            timestamp: Date.now()
        };
        addToChatHistory(errorMsg);
      }
    } catch (e) {
      console.error(e);
      setIsTyping(false);
      const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm having a little trouble connecting right now. Please check your internet or try again in a moment.",
          timestamp: Date.now()
      };
      addToChatHistory(errorMsg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  if (!showChatPanel) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-panel-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setShowChatPanel(false)}
        aria-hidden="true"
      />

      {/* Panel Container */}
      <div 
        ref={containerRef}
        className={`
          absolute bg-surface/95 backdrop-blur-xl shadow-2xl flex flex-col
          w-full h-full inset-0 animate-in slide-in-from-bottom duration-300
          md:w-[450px] md:inset-auto md:top-0 md:bottom-0 md:right-0 md:border-l md:border-surface-high md:animate-in md:slide-in-from-right
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-high bg-surface/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-lg bg-accent/10">
              <Bot className="h-6 w-6 text-accent" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-surface shadow-sm" />
            </div>
            <div>
              <h2 id="chat-panel-title" className="font-bold text-text-primary">
                Nexus Assistant
              </h2>
              <p className="text-xs text-text-secondary">AI-Powered Support</p>
            </div>
          </div>
          <button
            onClick={() => setShowChatPanel(false)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-high rounded-full transition-colors btn-press"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Area - Live Region for Screen Readers */}
        <div 
            className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
            aria-live="polite"
            aria-atomic="false"
        >
          {chatHistory.length === 0 && !isTyping && (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
               <Sparkles className="h-12 w-12 text-accent" aria-hidden="true" />
               <p className="text-sm">Connecting to Nexus AI...</p>
             </div>
          )}

          {chatHistory.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
                <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-surface-high' : 'bg-accent/10 border border-accent/20'}`} aria-hidden="true">
                        {msg.role === 'user' ? <User className="w-4 h-4 text-text-secondary" /> : <Sparkles className="w-4 h-4 text-accent" />}
                    </div>
                    
                    {/* Bubble */}
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-surface-high text-text-primary rounded-tr-none' 
                        : 'bg-surface border border-surface-high text-text-secondary rounded-tl-none shadow-[0_0_15px_rgba(var(--color-accent),0.05)]'
                    }`}>
                        {msg.text}
                    </div>
                </div>

                {/* Suggestions Chips (Only for Model) */}
                {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 ml-11 flex flex-wrap gap-2" role="group" aria-label="Suggested responses">
                        {msg.suggestions.map((sug, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(sug)}
                                className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/5 border border-accent/20 rounded-full hover:bg-accent hover:text-white transition-all duration-200 flex items-center gap-1 group btn-press"
                            >
                                {sug}
                                <ArrowRight className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3 animate-pulse" aria-label="AI is typing">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20" aria-hidden="true">
                    <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-surface border border-surface-high p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-text-secondary/40 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-text-secondary/40 animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-text-secondary/40 animate-bounce delay-200" />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-px w-full" />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-surface-high bg-surface/50 backdrop-blur-md shrink-0">
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your project..."
              className="flex-1 bg-background border border-surface-high rounded-xl pl-4 pr-10 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50"
              aria-label="Chat input"
            />
            {/* Mic Placeholder */}
            <button 
                className="absolute right-14 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors p-1"
                aria-label="Voice input"
            >
                <Mic className="w-4 h-4" />
            </button>

            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-accent text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 active:scale-95 btn-press"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-text-secondary/60">
                Nexus AI can make mistakes. Please verify important info.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatPanel;
