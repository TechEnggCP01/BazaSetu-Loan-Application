import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useLoanStore } from '../../store/loanStore';
import { STEP_NAMES } from '../../lib/utils';

export const Header: React.FC = () => {
  const { currentStep, lastSaved, hasUnsavedChanges } = useLoanStore();

  const getSaveStatus = () => {
    if (hasUnsavedChanges) return { label: 'Unsaved changes', color: 'text-amber-600', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    if (lastSaved) {
      const diff = Math.floor((Date.now() - new Date(lastSaved).getTime()) / 1000);
      const label = diff < 60 ? 'Saved just now' : `Saved ${Math.floor(diff / 60)}m ago`;
      return { label, color: 'text-emerald-600', icon: <Check className="w-3.5 h-3.5" /> };
    }
    return { label: 'Not saved yet', color: 'text-slate-400', icon: <Clock className="w-3.5 h-3.5" /> };
  };

  const saveStatus = getSaveStatus();

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="LendSwift Logo" className="w-8 h-8 drop-shadow-sm" />
          <div>
            <span className="text-sm font-bold text-slate-700">Loan Application</span>
          </div>
        </div>

        {/* Center: current step name */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-2"
        >
          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Step {currentStep} of 8
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {STEP_NAMES[currentStep - 1]}
          </span>
        </motion.div>

        {/* Save status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${saveStatus.color}`}>
          {saveStatus.icon}
          <span className="hidden sm:inline">{saveStatus.label}</span>
        </div>
      </div>
    </header>
  );
};
