import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, className = '' }) => {
  return (
    <ReactMarkdown
      className={`markdown-content space-y-2 ${className}`}
      components={{
        // Paragraphs
        p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
        
        // Lists
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        
        // Headings (Small within chat)
        h1: ({ children }) => <h3 className="font-bold text-lg mt-2 mb-1">{children}</h3>,
        h2: ({ children }) => <h4 className="font-bold text-base mt-2 mb-1">{children}</h4>,
        h3: ({ children }) => <h5 className="font-bold text-sm mt-2 mb-1">{children}</h5>,
        
        // Emphasis
        strong: ({ children }) => <span className="font-bold text-accent">{children}</span>,
        em: ({ children }) => <span className="italic text-text-primary/80">{children}</span>,
        
        // Code
        code: ({ className, children, ...props }: any) => {
          // Destructure 'node' to prevent it from being passed to the DOM element
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          return isInline ? (
            <code className="bg-surface-high/50 px-1 py-0.5 rounded text-xs font-mono text-accent" {...rest}>
              {children}
            </code>
          ) : (
            <div className="bg-black/30 rounded-lg p-2 my-2 border border-surface-high overflow-x-auto">
              <code className="text-xs font-mono text-text-secondary" {...rest}>
                {children}
              </code>
            </div>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent/50 pl-3 py-1 my-2 text-text-secondary italic bg-surface-high/10 rounded-r-lg">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent underline underline-offset-2 hover:text-white transition-colors"
          >
            {children}
          </a>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;