
/**
 * PREFETCH UTILITIES
 * 
 * Phase 4 - Section E: Intelligent Preloading
 * 
 * These functions manually trigger the import() of lazy-loaded components.
 * Call these on interaction events (like onMouseEnter) to start downloading
 * the code chunk before the user actually clicks.
 */

// Prefetch the Project Intake Wizard
export const prefetchProjectForm = () => {
    import('../components/modals/ProjectFormModal');
};

// Prefetch the AI Features Modal
export const prefetchAIFeatures = () => {
    import('../components/modals/AIFeaturesModal');
};

// Prefetch the Chat Panel
export const prefetchChatPanel = () => {
    import('../components/modals/ChatPanel');
};

// Prefetch the Case Study Modal
export const prefetchCaseStudy = () => {
    import('../components/modals/CaseStudyModal');
};

// Prefetch the heavy Work Section (if not already loaded via scroll)
export const prefetchWorkSection = () => {
    import('../components/ui/WorkSection');
};

// Prefetch the Project Info (Easter Egg) Modal
export const prefetchProjectInfo = () => {
    import('../components/modals/ProjectInfoModal');
};
