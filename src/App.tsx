import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/layout/Header';
import { ProgressStepper } from './components/layout/ProgressStepper';
import { ResumeModal } from './components/modals/ResumeModal';
import { StepTransition } from './components/ui/StepTransition';
import { Step1LoanDetails } from './features/step1-loan-details/Step1LoanDetails';
import { Step2PersonalInfo } from './features/step2-personal-info/Step2PersonalInfo';
import { Step3KYC } from './features/step3-kyc/Step3KYC';
import { Step4Address } from './features/step4-address/Step4Address';
import { Step5Employment } from './features/step5-employment/Step5Employment';
import { Step6CoApplicant } from './features/step6-co-applicant/Step6CoApplicant';
import { Step7Documents } from './features/step7-documents/Step7Documents';
import { Step8Review } from './features/step8-review/Step8Review';
import { useLoanStore } from './store/loanStore';
import { useAutoSave } from './hooks/useAutoSave';
import { CheckCircle, RefreshCw } from 'lucide-react';

function App() {
  const { currentStep, setCurrentStep, resetStore, hasSavedData } = useLoanStore();
  const [showResume, setShowResume] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);
  useAutoSave();

  useEffect(() => {
    if (hasSavedData()) {
      setShowResume(true);
    }
  }, []); // eslint-disable-line

  const goNext = () => setCurrentStep(Math.min(currentStep + 1, 8));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 1));

  const handleStartFresh = () => {
    resetStore();
    setShowResume(false);
  };

  const handleSubmitted = () => {
    setAppSubmitted(true);
  };

  if (appSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center"
        >
          <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Pre-Approval Generated!</h1>
          <p className="text-slate-500 mb-2">
            Your loan application has been submitted successfully.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Our team will contact you within 24 hours on your registered mobile number.
          </p>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-brand-500 font-medium mb-1">Application Reference</p>
            <p className="text-xl font-bold text-brand-700">
              LS{Date.now().toString().slice(-8)}
            </p>
          </div>
          <button
            onClick={() => { handleStartFresh(); setAppSubmitted(false); }}
            className="btn-ghost text-slate-500 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Start New Application
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ProgressStepper />

      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-white/80 backdrop-blur-glass rounded-2xl border border-white/60 shadow-glass p-6 sm:p-8">
            <StepTransition stepKey={currentStep}>
              {currentStep === 1 && <Step1LoanDetails onNext={goNext} />}
              {currentStep === 2 && <Step2PersonalInfo onNext={goNext} onBack={goBack} />}
              {currentStep === 3 && <Step3KYC onNext={goNext} onBack={goBack} />}
              {currentStep === 4 && <Step4Address onNext={goNext} onBack={goBack} />}
              {currentStep === 5 && <Step5Employment onNext={goNext} onBack={goBack} />}
              {currentStep === 6 && <Step6CoApplicant onNext={goNext} onBack={goBack} />}
              {currentStep === 7 && <Step7Documents onNext={goNext} onBack={goBack} />}
              {currentStep === 8 && <Step8Review onBack={goBack} onSubmit={handleSubmitted} />}
            </StepTransition>
          </div>
        </div>
      </main>

      <ResumeModal
        open={showResume}
        onResume={() => setShowResume(false)}
        onStartFresh={handleStartFresh}
      />
    </div>
  );
}

export default App;
