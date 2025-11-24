
import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useGlobal, useChat } from '../../context/GlobalContext';
import { prefetchChatPanel } from '../../utils/prefetch';

const ChatTrigger: React.FC = () => {
  const { showChatPanel, setShowChatPanel } = useGlobal();
  const { chatHistory } = useChat();
  
  const fabRef = useRef<HTMLButtonElement>(null);

  // Logic to determine FAB state (Red Dot & Breathing)
  const lastMessage = chatHistory[chatHistory.length - 1];
  const hasSuggestions = lastMessage?.role === 'model' && (lastMessage.suggestions?.length ?? 0) > 0;

  // Restore focus to FAB when chat panel closes
  useEffect(() => {
    if (!showChatPanel && fabRef.current) {
      // Small timeout ensures focus doesn't trigger before visibility transition completes
      setTimeout(() => fabRef.current?.focus(), 50);
    }
  }, [showChatPanel]);

  // NOTE: We use CSS transitions for visibility (opacity/scale) instead of 
  // returning null. This prevents the component from unmounting and remounting,
  // which was causing the entrance animation to "flash" every time the chat closed.

  return (
    <button
      ref={fabRef}
      onClick={() => setShowChatPanel(true)}
      onMouseEnter={prefetchChatPanel}
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 p-3 md:p-4 rounded-full bg-accent text-white shadow-lg shadow-accent/20 transition-all duration-300 group
        ${/* Entrance Animation: Runs once on mount */ 'animate-in fade-in zoom-in duration-500'}
        ${/* Visibility Logic: Smooth transition instead of jarring unmount */ showChatPanel ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}
        ${/* Interaction State: Breathing vs Hover Scale */ hasSuggestions ? 'animate-breathe' : 'hover:scale-105'}
      `}
      aria-label="Open AI Assistant"
      aria-hidden={showChatPanel}
    >
      <div className="relative">
         <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
         
         {/* Notification Dot (Static) */}
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
