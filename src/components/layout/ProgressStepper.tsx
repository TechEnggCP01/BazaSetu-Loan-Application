import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, Shield, MapPin, Briefcase, Users, FileText, ClipboardCheck } from 'lucide-react';
import { useLoanStore } from '../../store/loanStore';
import { cn } from '../../lib/utils';

const STEPS = [
  { label: 'Loan Details', icon: ClipboardCheck },
  { label: 'Personal Info', icon: User },
  { label: 'KYC', icon: Shield },
  { label: 'Address', icon: MapPin },
  { label: 'Employment', icon: Briefcase },
  { label: 'Co-applicant', icon: Users },
  { label: 'Documents', icon: FileText },
  { label: 'Review', icon: ClipboardCheck },
];

export const ProgressStepper: React.FC = () => {
  const { currentStep, completedSteps, setCurrentStep } = useLoanStore();
  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4">
      <div className="max-w-[900px] mx-auto">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">
            {completedSteps.length} of {STEPS.length} steps completed
          </span>
          <span className="text-xs font-bold text-brand-600">
            {Math.round(progressPct)}% complete
          </span>
        </div>
        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
          <motion.div
            className="absolute inset-y-0 left-0 gradient-brand rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-1">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = completedSteps.includes(stepNum);
            const isCurrent = currentStep === stepNum;
            const isClickable = isCompleted || stepNum <= Math.max(...completedSteps, currentStep);
            const Icon = step.icon;

            return (
              <React.Fragment key={stepNum}>
                <button
                  type="button"
                  onClick={() => isClickable && setCurrentStep(stepNum)}
                  disabled={!isClickable}
                  aria-label={`Step ${stepNum}: ${step.label}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 min-w-[48px] transition-all duration-200',
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border-2',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'hidden sm:block text-[10px] font-medium text-center leading-tight max-w-[56px]',
                      isCurrent ? 'text-brand-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 rounded-full transition-colors duration-300 min-w-[8px]',
                      completedSteps.includes(stepNum) ? 'bg-emerald-300' : 'bg-slate-100'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
