
import React from 'react';
import { Target, Workflow, Code2, Rocket } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

interface ProcessSectionProps {
  id: string;
}

const steps = [
  {
    icon: <Target className="w-6 h-6 text-accent" />,
    title: "1. We Listen",
    description: "No sales pitch. We analyze your current workflow to find the bottlenecks costing you time and money."
  },
  {
    icon: <Workflow className="w-6 h-6 text-accent" />,
    title: "2. We Blueprint",
    description: "No black boxes. We design a clear visual map of the system so you know exactly what we're building."
  },
  {
    icon: <Code2 className="w-6 h-6 text-accent" />,
    title: "3. We Build",
    description: "Our engineers build, test, and deploy your custom tools, ensuring they connect with the software you already use."
  },
  {
    icon: <Rocket className="w-6 h-6 text-accent" />,
    title: "4. We Launch",
    description: "Handover is just the start. We train your team and provide ongoing support to keep things running smoothly."
  }
];

const ProcessSection: React.FC<ProcessSectionProps> = ({ id }) => {
  return (
    <section 
      id={id} 
      className="section-padding bg-background text-text-primary transition-colors duration-300 overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <RevealOnScroll>
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="type-headline mb-4">The Roadmap</h2>
            <p className="type-body text-text-secondary">
              A transparent path from chaos to clarity. Four weeks to a smarter business.
            </p>
          </div>
        </RevealOnScroll>

        {/* Timeline Container */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 border-t-2 border-dashed border-surface-high/50 -z-10" />

          {steps.map((step, index) => (
            <RevealOnScroll key={index} delay={index * 150} className="h-full">
              <div 
                className="relative flex flex-col items-center text-center md:items-center md:text-center group h-full"
              >
                {/* Connector Line (Mobile) - Vertical */}
                {index !== steps.length - 1 && (
                   <div className="md:hidden absolute top-16 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-surface-high/50 -z-10 h-full" />
                )}

                {/* Icon Bubble */}
                <div className="w-16 h-16 rounded-full bg-surface border-2 border-surface-high flex items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:border-accent group-hover:scale-110 transition-all duration-300 z-10">
                  {step.icon}
                </div>

                {/* Text Content */}
                <div className="bg-surface/50 md:bg-transparent p-6 md:p-0 rounded-xl border border-surface-high/50 md:border-none backdrop-blur-sm md:backdrop-blur-none w-full">
                  <h3 className="type-title text-lg mb-3 group-hover:text-text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}

        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
