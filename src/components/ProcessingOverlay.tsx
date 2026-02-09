import React from 'react';
import TomatoLoader from './TomatoLoader';

interface ProcessingOverlayProps {
  status: 'extracting' | 'analyzing' | 'optimizing';
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ status }) => {
  const titles = {
    extracting: 'Reading Resume...',
    analyzing: 'TomatoAI Analysis...',
    optimizing: 'Tailoring Resume...'
  };

  const descriptions = {
    extracting: 'Extracting text structure and content from your PDF file.',
    analyzing: 'TomatoAI is evaluating your profile against modern industry standards.',
    optimizing: 'TomatoAI is crafting a perfectly tailored version for your target role.'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center border border-slate-100 dark:border-slate-800">
        <div className="mb-8">
          <TomatoLoader />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {titles[status]}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {descriptions[status]}
        </p>
        <div className="mt-8 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full bg-red-500 transition-all duration-1000 ${status === 'extracting' ? 'w-1/3' :
            status === 'analyzing' ? 'w-2/3' : 'w-full'
            }`}></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
