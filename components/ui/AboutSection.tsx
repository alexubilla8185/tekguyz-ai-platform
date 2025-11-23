import React from 'react';
import { Zap, ShieldCheck, BarChart3, CheckCircle2 } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

interface AboutSectionProps {
  id: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ id }) => {
  const pillars = [
    {
      icon: <Zap className="w-6 h-6 text-accent" />,
      title: "Automate the Busywork",
      description: "We identify the repetitive tasks slowing you down and build agents to handle them instantly."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-accent" />,
      title: "Scale Without Chaos",
      description: "Stop relying on fragile spreadsheets. We build reliable software infrastructure that grows with you."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      title: "Decide with Data",
      description: "Turn messy records into clean dashboards. Know exactly where your business stands in real-time."
    }
  ];

  return (
    <section 
      id={id} 
      className="section-padding bg-surface/50 border-b border-surface-high transition-colors duration-300 relative overflow-hidden"
    >
      {/* Subtle Background Glow for this section */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text & Pillars */}
          <div className="space-y-8">
            <RevealOnScroll>
              <div className="space-y-4">
                <h2 className="type-headline text-text-primary">
                  Practical Tech. No Magic Tricks.
                </h2>
                <p className="type-body text-lg">
                  You don't need a research lab. You need software that works. We build tools that remove bottlenecks so your team can focus on serving customers and closing deals.
                </p>
              </div>
            </RevealOnScroll>

            <div className="space-y-6">
              {pillars.map((pillar, index) => (
                <RevealOnScroll key={index} delay={index * 100}>
                  <div 
                    className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-surface-high hover:bg-surface transition-all duration-300"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                      {pillar.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="type-title text-lg">{pillar.title}</h3>
                      <p className="type-body text-sm leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Representation */}
          <RevealOnScroll delay={200} className="h-full">
            <div className="relative h-full min-h-[400px] flex items-center justify-center">
               {/* Abstract System Illustration */}
               <div className="relative w-full max-w-md aspect-square">
                  
                  {/* Central Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-surface border border-surface-high rounded-full flex items-center justify-center z-20 shadow-2xl shadow-accent/10">
                    <div className="text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-1">Your</div>
                      <div className="text-xl font-bold text-text-primary">Business</div>
                    </div>
                  </div>

                  {/* Orbiting Elements */}
                  <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
                     {/* Top Node */}
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-12 w-48 p-4 bg-surface/80 backdrop-blur-md border border-surface-high rounded-xl shadow-lg flex items-center gap-3 transform -rotate-0 transition-transform hover:scale-105">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-sm font-medium">Auto-Invoicing</div>
                     </div>

                     {/* Bottom Right Node */}
                     <div className="absolute bottom-12 right-0 translate-x-4 w-48 p-4 bg-surface/80 backdrop-blur-md border border-surface-high rounded-xl shadow-lg flex items-center gap-3 transform rotate-0 transition-transform hover:scale-105">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-sm font-medium">Client Sync</div>
                     </div>

                     {/* Bottom Left Node */}
                     <div className="absolute bottom-12 left-0 -translate-x-4 w-48 p-4 bg-surface/80 backdrop-blur-md border border-surface-high rounded-xl shadow-lg flex items-center gap-3 transform rotate-0 transition-transform hover:scale-105">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-sm font-medium">Smart Scheduling</div>
                     </div>
                  </div>
                  
                  {/* Connecting Lines (Decorative) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 400">
                    <path d="M200 200 L200 60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-text-secondary" />
                    <path d="M200 200 L320 300" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-text-secondary" />
                    <path d="M200 200 L80 300" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-text-secondary" />
                    <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" fill="none" className="text-surface-high" />
                  </svg>

               </div>
            </div>
          </RevealOnScroll>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;