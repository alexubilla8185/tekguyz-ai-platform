
import React, { useRef, useState, useEffect } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useGlobal, useChat } from '../../context/GlobalContext';
import { prefetchChatPanel } from '../../utils/prefetch';

const ChatTrigger: React.FC = () => {
  const { showChatPanel, setShowChatPanel } = useGlobal();
  const { chatHistory } = useChat();
  
  const [hasNewResponse, setHasNewResponse] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Logic to determine FAB state
  const lastMessage = chatHistory[chatHistory.length - 1];
  const hasSuggestions = lastMessage?.role === 'model' && (lastMessage.suggestions?.length ?? 0) > 0;

  // Trigger "New Response" animation when chat history updates from 'model'
  useEffect(() => {
    if (lastMessage?.role === 'model') {
      setHasNewResponse(true);
      const timer = setTimeout(() => setHasNewResponse(false), 3000); // 3s highlight
      return () => clearTimeout(timer);
    }
  }, [lastMessage]);

  // Restore focus to FAB when chat panel closes
  useEffect(() => {
    if (!showChatPanel && fabRef.current) {
      fabRef.current.focus();
    }
  }, [showChatPanel]);

  if (showChatPanel) return null;

  return (
    <button
      ref={fabRef}
      onClick={() => setShowChatPanel(true)}
      onMouseEnter={prefetchChatPanel}
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 p-3 md:p-4 rounded-full bg-accent text-white shadow-lg shadow-accent/20 hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group ${
         hasSuggestions ? 'animate-breathe' : ''
      }`}
      aria-label="Open AI Assistant"
    >
      <div className="relative">
         <MessageCircle className={`h-6 w-6 md:h-7 md:w-7 transition-all duration-500 absolute top-0 left-0 ${hasNewResponse ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
         <Sparkles className={`h-6 w-6 md:h-7 md:w-7 transition-all duration-500 ${hasNewResponse ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
         
         {/* Notification Dot (Static, no pinging) */}
         {hasSuggestions && (
             <span className="absolute -top-1 -right-1 flex h-3 w-3">
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-surface"></span>
             </span>
         )}
      </div>
    </button>
  );
};

export default ChatTrigger;
