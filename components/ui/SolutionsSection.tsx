import React from 'react';
import { Bot, Workflow, LineChart, Users } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

interface SolutionsSectionProps {
  id: string;
}

const solutions = [
  {
    icon: <Bot className="w-8 h-8 text-accent" />,
    title: "24/7 Customer Agents",
    description: "Automate support and internal queries with intelligent agents that know your business context."
  },
  {
    icon: <Workflow className="w-8 h-8 text-accent" />,
    title: "Workflow Connectors",
    description: "Connect your existing tools. Eliminate manual data entry and create seamless, hands-free processes."
  },
  {
    icon: <LineChart className="w-8 h-8 text-accent" />,
    title: "Live KPI Dashboards",
    description: "Stop guessing. Visualize your key metrics in real-time to make informed decisions faster."
  },
  {
    icon: <Users className="w-8 h-8 text-accent" />,
    title: "Client Portals",
    description: "Impress new clients from day one. Streamline contract signing, data collection, and project kickoff."
  }
];

const SolutionsSection: React.FC<SolutionsSectionProps> = ({ id }) => {
  return (
    <section 
      id={id} 
      className="section-padding bg-background text-text-primary border-b border-surface-high transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <RevealOnScroll>
          <div className="mb-16 max-w-3xl">
              <h2 className="type-headline mb-6">Solve specific problems.</h2>
              <p className="type-body text-xl text-text-secondary leading-relaxed">
                  Off-the-shelf software is too generic. Spreadsheets are too messy. We build the missing link tailored to your workflow.
              </p>
          </div>
        </RevealOnScroll>
        
        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {solutions.map((item, index) => (
             <RevealOnScroll key={index} delay={index * 100}>
               <div 
                 className="group relative p-8 card-base bg-surface card-hover"
               >
                  <div className="mb-6 p-4 rounded-xl bg-accent/10 w-fit group-hover:bg-accent/20 transition-colors duration-300">
                      {item.icon}
                  </div>
                  
                  <h3 className="type-title text-xl mb-3 group-hover:text-accent transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="type-body text-base text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                    {item.description}
                  </p>

                  {/* Decorative corner glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               </div>
             </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;