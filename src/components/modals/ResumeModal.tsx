import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, PlayCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLoanStore } from '../../store/loanStore';
import { STEP_NAMES } from '../../lib/utils';

interface ResumeModalProps {
  open: boolean;
  onResume: () => void;
  onStartFresh: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ open, onResume, onStartFresh }) => {
  const { currentStep, completedSteps, lastSaved } = useLoanStore();

  const savedAgo = lastSaved
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(lastSaved).getTime()) / 1000 / 60);
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff} minutes ago`;
        return `${Math.floor(diff / 60)} hours ago`;
      })()
    : 'recently';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 mb-5 mx-auto">
              <FileText className="w-7 h-7 text-brand-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Resume Application?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              We found a saved application from <strong>{savedAgo}</strong>.
            </p>

            {/* Progress summary */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Progress saved</span>
                <span className="text-xs font-bold text-brand-600">Step {currentStep} of 8</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-brand rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 7) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Last step: <span className="font-semibold text-slate-700">{STEP_NAMES[currentStep - 1]}</span>
                {' · '}{completedSteps.length} steps completed
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                className="w-full"
                icon={<PlayCircle className="w-4 h-4" />}
                onClick={onResume}
              >
                Resume Application
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={onStartFresh}
              >
                Start Fresh
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
