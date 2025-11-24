
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/ui/HeroSection';
import AboutSection from './components/ui/AboutSection';
import SolutionsSection from './components/ui/SolutionsSection';
import ProcessSection from './components/ui/ProcessSection';
import Footer from './components/layout/Footer';
import AmbientBackground from './components/ui/AmbientBackground';
import { GlobalProvider, useGlobal } from './context/GlobalContext';
import ChatTrigger from './components/ui/ChatTrigger';

// --- Lazy Loaded Components ---
const WorkSection = React.lazy(() => import('./components/ui/WorkSection'));
const ProjectFormModal = React.lazy(() => import('./components/modals/ProjectFormModal'));
const AIFeaturesModal = React.lazy(() => import('./components/modals/AIFeaturesModal'));
const ChatPanel = React.lazy(() => import('./components/modals/ChatPanel'));
const CaseStudyModal = React.lazy(() => import('./components/modals/CaseStudyModal'));
const ProjectInfoModal = React.lazy(() => import('./components/modals/ProjectInfoModal')); // New Import

// --- Suspense Fallbacks ---

interface SectionSkeletonProps {
  id?: string;
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ id }) => (
  <div id={id} className="py-20 md:py-32 bg-surface/30 border-b border-surface-high">
    <div className="container mx-auto px-4 md:px-6">
      <div className="h-12 w-1/3 bg-surface-high/30 rounded-lg animate-pulse mb-6" />
      <div className="h-6 w-2/3 bg-surface-high/30 rounded-lg animate-pulse mb-16" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-96 bg-surface-high/20 rounded-2xl animate-pulse border border-surface-high/30" />
        ))}
      </div>
    </div>
  </div>
);

const ModalLoadingSpinner = () => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/10 pointer-events-none">
      <div className="bg-surface p-4 rounded-full shadow-xl border border-surface-high animate-in fade-in zoom-in">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
  </div>
);

// Internal Layout component to consume the Global Context
const AppLayout: React.FC = () => {
  const { 
    showProjectFormModal,
    showAIFeaturesModal,
    showProjectInfoModal,
    selectedCaseStudy
  } = useGlobal();

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-300 overflow-x-hidden">
        
      {/* Ambient Background Layer (Fixed, z-0) */}
      <AmbientBackground />

      {/* Main Content Layer (Relative, z-10) */}
      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
        
        <main className="flex-grow flex flex-col">
          <HeroSection id="hero" />
          <AboutSection id="about" />
          <SolutionsSection id="solutions" />
          
          <Suspense fallback={<SectionSkeleton id="work" />}>
            <WorkSection id="work" />
          </Suspense>
          
          <ProcessSection id="process" />
        </main>

        <Footer />
      </div>

      {/* Global Modals - Lazy Loaded */}
      <Suspense fallback={showProjectFormModal ? <ModalLoadingSpinner /> : null}>
         {showProjectFormModal && <ProjectFormModal />}
      </Suspense>
      
      <Suspense fallback={showAIFeaturesModal ? <ModalLoadingSpinner /> : null}>
         {showAIFeaturesModal && <AIFeaturesModal />}
      </Suspense>
      
      <Suspense fallback={selectedCaseStudy ? <ModalLoadingSpinner /> : null}>
         {selectedCaseStudy && <CaseStudyModal />}
      </Suspense>

      <Suspense fallback={showProjectInfoModal ? <ModalLoadingSpinner /> : null}>
         {showProjectInfoModal && <ProjectInfoModal />}
      </Suspense>

      <Suspense fallback={null}>
         <ChatPanel />
      </Suspense>

      {/* Floating Chat Trigger (FAB) - Extracted for performance */}
      <ChatTrigger />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <AppLayout />
    </GlobalProvider>
  );
};

export default App;
