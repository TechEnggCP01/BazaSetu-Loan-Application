import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Users, UserPlus, Info } from 'lucide-react';
import { coApplicantSchema, type CoApplicantFormData } from '../../lib/schemas';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FadeIn } from '../../components/ui/StepTransition';

interface Step6Props { onNext: () => void; onBack: () => void; }

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'other', label: 'Other' },
];

export const Step6CoApplicant: React.FC<Step6Props> = ({ onNext, onBack }) => {
  const { coApplicant, personalInfo, loanDetails, updateCoApplicant, markStepComplete } = useLoanStore();

  const isMarried = personalInfo.maritalStatus === 'married';
  const isHighAmount = (loanDetails.loanAmount ?? 0) > 2000000;
  const shouldShow = isMarried || isHighAmount;

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<CoApplicantFormData>({
    resolver: zodResolver(coApplicantSchema),
    defaultValues: {
      hasCoApplicant: coApplicant.hasCoApplicant ?? shouldShow,
      spouseName: coApplicant.spouseName ?? '',
      relationship: coApplicant.relationship ?? (isMarried ? 'spouse' : ''),
      coApplicantIncome: coApplicant.coApplicantIncome ?? 0,
      coApplicantContact: coApplicant.coApplicantContact ?? '',
    },
  });

  const hasCoApplicant = watch('hasCoApplicant');

  const onSubmit = (data: CoApplicantFormData) => {
    updateCoApplicant(data);
    markStepComplete(6);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Co-applicant Details</h2>
          <p className="text-sm text-slate-400">Add a co-applicant to strengthen your application</p>
        </div>

        {/* Why banner */}
        {shouldShow && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              {isMarried && 'A co-applicant is recommended for married applicants. '}
              {isHighAmount && 'Your loan amount requires a co-applicant for amounts above ₹20 Lakh. '}
              Adding a co-applicant can improve your approval chances.
            </p>
          </div>
        )}

        {/* Toggle */}
        <div className="step-card mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Add Co-applicant</p>
                <p className="text-xs text-slate-400">Improves loan eligibility</p>
              </div>
            </div>
            <Controller
              name="hasCoApplicant"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  aria-checked={field.value}
                  role="switch"
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    field.value ? 'bg-brand-600' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: field.value ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
              )}
            />
          </div>
        </div>

        {/* Co-applicant Form */}
        <AnimatePresence>
          {hasCoApplicant && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="step-card mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-semibold text-slate-700">Co-applicant Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      {...register('spouseName')}
                      label="Co-applicant Full Name"
                      placeholder="As per Aadhaar / PAN"
                      error={errors.spouseName?.message}
                    />
                  </div>
                  <Select
                    {...register('relationship')}
                    label="Relationship"
                    options={RELATIONSHIP_OPTIONS}
                    placeholder="Select relationship"
                    error={errors.relationship?.message}
                  />
                  <Input
                    {...register('coApplicantContact')}
                    label="Contact Number"
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    error={errors.coApplicantContact?.message}
                  />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Monthly Income (₹)
                    </label>
                    <Controller
                      name="coApplicantIncome"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="50000"
                          className="input-base"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasCoApplicant && !shouldShow && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <Info className="w-4 h-4 text-slate-400" />
            <p className="text-sm text-slate-500">
              Skip this step if you don't have a co-applicant. You can always add one later.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button type="submit" className="flex-1" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
            Continue to Documents
          </Button>
        </div>
      </FadeIn>
    </form>
  );
};
