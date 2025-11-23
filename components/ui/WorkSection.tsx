import React, { useState, useMemo } from 'react';
import { ArrowRight, ChevronDown, Building2, Stethoscope, ShoppingBag, Briefcase, Zap } from 'lucide-react';
import { useGlobal } from '../../context/GlobalContext';
import { CaseStudy, AdditionalProject } from '../../types';
import { prefetchCaseStudy } from '../../utils/prefetch';
import OptimizedImage from './OptimizedImage';
import RevealOnScroll from './RevealOnScroll';

interface WorkSectionProps {
  id: string;
}

// --- Data ---
const caseStudies: CaseStudy[] = [
  {
    id: 'cs1',
    title: 'Automated Invoice Processing',
    client: 'LogisticsFlow Inc.',
    description: 'Reduced manual data entry by 90% using custom OCR agents.',
    fullDescription: `LogisticsFlow Inc. was drowning in paperwork. Their accounts payable team spent 40 hours a week manually keying invoice data into their ERP system. Errors were frequent, and late payments were damaging vendor relationships.

    We built a custom AI pipeline that:
    1. Ingests PDF invoices from emails automatically.
    2. Uses Gemini Flash models to extract key fields (Date, Amount, Line Items) with 99.8% accuracy.
    3. Pushes clean JSON data directly into their Quickbooks instance.
    
    The result? The team now spends just 4 hours a week reviewing edge cases, freeing up 36 hours for strategic financial analysis.`,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000&fm=webp', // Added fm=webp
    metrics: [
      { label: 'Time Saved', value: 90, valueDisplay: '90%', detail: 'From 40hrs/week to 4hrs/week.' },
      { label: 'Accuracy', value: 99, valueDisplay: '99%', detail: 'Significant reduction in typo-related payment errors.' },
      { label: 'ROI', value: 450, valueDisplay: '450%', detail: 'System paid for itself in less than 3 months.' }
    ],
    tags: ['Automation', 'Finance', 'OCR']
  },
  {
    id: 'cs2',
    title: 'Smart Customer Onboarding',
    client: 'Apex Realty Group',
    description: 'Cut deal closing time in half with an intelligent document collection portal.',
    fullDescription: `Apex Realty Group struggled with a fragmented onboarding process. Clients were sent 15+ emails to collect IDs, tax forms, and signatures. Deals were stalling due to "email fatigue."

    We developed a secure, white-labeled Client Portal that:
    1. Guides buyers through a dynamic checklist.
    2. Uses AI to validate uploaded documents instantly (e.g., checking if an ID is expired).
    3. Auto-generates contract drafts based on collected data.
    
    Agents now close deals 50% faster, and client satisfaction scores have hit all-time highs.`,
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000&fm=webp', // Added fm=webp
    metrics: [
      { label: 'Turnaround', value: 50, valueDisplay: '50%', detail: 'Closing time reduced from 14 days to 7 days.' },
      { label: 'Emails Sent', value: 75, valueDisplay: '-75%', detail: 'Reduced back-and-forth threads per client.' },
      { label: 'NPS Score', value: 92, valueDisplay: '92', detail: 'Up from 74 prior to implementation.' }
    ],
    tags: ['Real Estate', 'Web Portal', 'UX']
  },
  {
    id: 'cs3',
    title: 'Inventory Prediction Engine',
    client: 'Urban Retailers',
    description: 'Prevented stockouts and reduced waste with predictive analytics.',
    fullDescription: `Urban Retailers faced a classic dilemma: carrying too much stock (tying up cash) or running out of bestsellers (losing revenue). Their Excel-based forecasting was no longer cutting it.

    We deployed a lightweight predictive engine that:
    1. Analyzes 3 years of historical sales data + local events.
    2. Predicts SKU demand for the next 4 weeks.
    3. Auto-generates purchase orders for approval.

    The system reduced dead stock by 25% in the first quarter alone.`,
    imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1000&fm=webp', // Added fm=webp
    metrics: [
      { label: 'Dead Stock', value: 25, valueDisplay: '-25%', detail: 'Less capital tied up in slow-moving items.' },
      { label: 'Stockouts', value: 0, valueDisplay: '~0%', detail: 'Eliminated stockouts for top 50 SKUs.' },
      { label: 'Admin Time', value: 10, valueDisplay: '10h', detail: 'Saved per week on manual ordering.' }
    ],
    tags: ['Retail', 'Data Science', 'Forecasting']
  }
];

const additionalProjectsData: AdditionalProject[] = [
  { id: 'p1', title: 'Legal Case Summarizer', industry: 'Legal', outcome: 'Summarizes 50pg briefs in 30 seconds', tags: ['NLP', 'Legal'], highlight: 'Used primarily for discovery phase efficiency.' },
  { id: 'p2', title: 'Construction Bid Estimator', industry: 'Construction', outcome: 'Generates material lists from blueprints', tags: ['Computer Vision', 'Estimating'], highlight: 'Integrated directly with supplier pricing APIs.' },
  { id: 'p3', title: 'Patient Triage Chatbot', industry: 'Healthcare', outcome: 'Reduces front-desk call volume by 40%', tags: ['Healthcare', 'Chatbot'], highlight: 'HIPAA compliant and secure.' },
  { id: 'p4', title: 'Restaurant Staff Scheduler', industry: 'Hospitality', outcome: 'Auto-assigns shifts based on availability', tags: ['Scheduling', 'Optimization'], highlight: 'Reduced manager scheduling time by 80%.' },
  { id: 'p5', title: 'Marketing Content Generator', industry: 'Agency', outcome: 'Creates monthly social calendars instantly', tags: ['Generative AI', 'Marketing'], highlight: 'Trained on specific brand voice guidelines.' },
];

const WorkSection: React.FC<WorkSectionProps> = ({ id }) => {
  const { setSelectedCaseStudy, userIntentProfile } = useGlobal();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const toggleProject = (id: string) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleProject(id);
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
        case 'Legal': return <Briefcase className="w-4 h-4" />;
        case 'Construction': return <Building2 className="w-4 h-4" />;
        case 'Healthcare': return <Stethoscope className="w-4 h-4" />;
        case 'Hospitality': return <ShoppingBag className="w-4 h-4" />;
        default: return <Zap className="w-4 h-4" />;
    }
  };

  // Sort projects: If a user intent profile exists with an industry, move matching projects to the top.
  const sortedProjects = useMemo(() => {
    if (!userIntentProfile?.industry) return additionalProjectsData;

    return [...additionalProjectsData].sort((a, b) => {
        const aMatches = a.industry.toLowerCase() === userIntentProfile.industry.toLowerCase();
        const bMatches = b.industry.toLowerCase() === userIntentProfile.industry.toLowerCase();
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
    });
  }, [userIntentProfile]);

  return (
    <section 
      id={id} 
      className="section-padding bg-surface/30 border-b border-surface-high transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <RevealOnScroll>
          <div className="mb-16">
            <h2 className="type-headline mb-4">Real Impact.</h2>
            <p className="type-body max-w-2xl">
              Numbers speak louder than buzzwords. Here is how we have helped other teams reclaim their time and grow their bottom line.
            </p>
          </div>
        </RevealOnScroll>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {caseStudies.map((study, index) => (
            <RevealOnScroll key={study.id} delay={index * 150}>
              <div 
                onClick={() => setSelectedCaseStudy(study)}
                onMouseEnter={prefetchCaseStudy}
                className="group cursor-pointer rounded-2xl bg-surface border border-surface-high overflow-hidden card-hover"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCaseStudy(study);
                  }
                }}
                aria-label={`View Case Study: ${study.title}`}
              >
                {/* Image Container with enforced aspect ratio for CLS prevention */}
                <div className="aspect-[4/3] md:aspect-video overflow-hidden relative bg-surface-high/20">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                  <OptimizedImage 
                    src={study.imageUrl} 
                    alt={study.title}
                    containerClassName="w-full h-full"
                    className="transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                     {study.tags.slice(0, 2).map(tag => (
                         <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded">
                             {tag}
                         </span>
                     ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-xs font-medium text-accent mb-2 uppercase tracking-wide">
                    {study.client}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                    {study.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
                    {study.description}
                  </p>
                  
                  {/* Footer / Highlight Metric */}
                  <div className="pt-4 border-t border-surface-high flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">
                          {study.metrics[0].valueDisplay}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {study.metrics[0].label}
                        </span>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                     </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Additional Projects List */}
        <div className="max-w-4xl mx-auto">
           <RevealOnScroll>
             <h3 className="type-title mb-8 text-center md:text-left">More Solutions</h3>
           </RevealOnScroll>
           <div className="space-y-4">
              {sortedProjects.map((project, index) => (
                 <RevealOnScroll key={project.id} delay={index * 50}>
                   <div 
                     className="card-base bg-surface overflow-hidden hover:shadow-lg transition-all duration-300"
                   >
                      <div 
                          onClick={() => toggleProject(project.id)}
                          onKeyDown={(e) => handleKeyDown(e, project.id)}
                          role="button"
                          tabIndex={0}
                          aria-expanded={expandedProject === project.id}
                          aria-controls={`project-content-${project.id}`}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-high/30 transition-colors focus:outline-none focus:bg-surface-high/30"
                      >
                         <div className="flex items-center gap-4 md:gap-6 flex-1">
                            {/* Industry Chip */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high/50 text-xs font-medium text-text-secondary w-32 shrink-0">
                                {getIndustryIcon(project.industry)}
                                {project.industry}
                            </div>
                            
                            {/* Title & Outcome */}
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                               <span className="font-bold text-text-primary">{project.title}</span>
                               <span className="hidden md:inline text-surface-high mx-2">|</span>
                               <span className="text-sm text-text-secondary">{project.outcome}</span>
                            </div>
                         </div>

                         <div className="flex items-center gap-4">
                            <span className="text-xs text-text-secondary hidden sm:inline opacity-50">Tap to see more</span>
                            <ChevronDown 
                              className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${expandedProject === project.id ? 'rotate-180' : ''}`} 
                              aria-hidden="true"
                            />
                         </div>
                      </div>

                      {/* Expandable Content */}
                      <div 
                          id={`project-content-${project.id}`}
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedProject === project.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                          aria-hidden={expandedProject !== project.id}
                      >
                          <div className="p-5 pt-0 border-t border-surface-high/50 bg-surface-high/10">
                              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
                                  <div className="flex-1">
                                      <span className="text-sm font-bold text-accent">Key Highlight: </span>
                                      <span className="text-sm text-text-secondary">{project.highlight}</span>
                                  </div>
                                  <div className="flex gap-2">
                                      {project.tags.map(tag => (
                                          <span key={tag} className="text-xs px-2 py-1 rounded bg-background border border-surface-high text-text-secondary">
                                              #{tag}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                   </div>
                 </RevealOnScroll>
              ))}
           </div>
        </div>

      </div>
    </section>
  );
};

export default WorkSection;