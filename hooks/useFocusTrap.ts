
import { useEffect, useRef } from 'react';

/**
 * useFocusTrap Hook
 * 
 * Manages focus within a modal dialog to ensure WCAG compliance:
 * 1. Traps focus within the container (Tab / Shift+Tab).
 * 2. Closes on Escape key.
 * 3. Restores focus to the triggering element on unmount.
 * 4. Sets initial focus to the first interactive element or input.
 */
export const useFocusTrap = (onClose: () => void) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 1. Capture the element that triggered the modal for restoration
    triggerRef.current = document.activeElement as HTMLElement;
    
    // 2. Initialize Focus
    // Small timeout ensures the DOM is fully rendered before attempting focus
    const timer = setTimeout(() => {
      if (containerRef.current) {
        // Find all focusable elements
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // Smart Focus: Prefer inputs/textareas for forms/chat, otherwise first button
        const input = containerRef.current.querySelector('input, textarea') as HTMLElement;
        if (input) {
            input.focus();
        } else if (focusable.length > 0) {
            focusable[0].focus();
        } else {
            // Fallback to container if no interactive elements exist
            containerRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Handle Tab (Focus Trap)
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: Wrap from first to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: Wrap from last to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      
      // 3. Restore focus to triggering element
      // Wrap in timeout to ensure unmount cycle is complete
      setTimeout(() => {
        if (triggerRef.current && document.body.contains(triggerRef.current)) {
          triggerRef.current.focus();
        }
      }, 0);
    };
  }, [onClose]);

  return containerRef;
};
