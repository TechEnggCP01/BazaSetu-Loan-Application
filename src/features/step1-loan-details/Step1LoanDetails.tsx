import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, TrendingUp, Calculator, ChevronRight, BadgeCheck } from 'lucide-react';
import { loanDetailsSchema, type LoanDetailsFormData } from '../../lib/schemas';
import { LOAN_CONFIGS, formatINR, formatINRCompact, calculateEMI } from '../../lib/utils';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FadeIn } from '../../components/ui/StepTransition';
import type { LoanType } from '../../types/loan';

const LOAN_TYPES: { type: LoanType; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { type: 'personal', label: 'Personal Loan', icon: <User className="w-6 h-6" />, desc: 'Up to ₹10 Lakh', color: 'indigo' },
  { type: 'home', label: 'Home Loan', icon: <Home className="w-6 h-6" />, desc: 'Up to ₹1 Crore', color: 'blue' },
  { type: 'business', label: 'Business Loan', icon: <Briefcase className="w-6 h-6" />, desc: 'Up to ₹50 Lakh', color: 'violet' },
];

interface Step1Props { onNext: () => void; }

export const Step1LoanDetails: React.FC<Step1Props> = ({ onNext }) => {
  const { loanDetails, updateLoanDetails, markStepComplete } = useLoanStore();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<LoanDetailsFormData>({
    resolver: zodResolver(loanDetailsSchema),
    defaultValues: {
      loanType: (loanDetails.loanType as LoanType) ?? 'personal',
      loanAmount: loanDetails.loanAmount ?? 500000,
      loanTenure: loanDetails.loanTenure ?? 36,
      loanPurpose: loanDetails.loanPurpose ?? '',
      referralCode: loanDetails.referralCode ?? '',
    },
  });

  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');
  const loanTenure = watch('loanTenure');
  const config = LOAN_CONFIGS[loanType];
  const emi = calculateEMI(loanAmount, config.baseRate, loanTenure);

  // Clamp amount when type changes
  useEffect(() => {
    if (loanAmount > config.maxAmount) setValue('loanAmount', config.maxAmount);
    if (loanAmount < config.minAmount) setValue('loanAmount', config.minAmount);
    if (loanTenure > config.maxTenure) setValue('loanTenure', config.maxTenure);
    if (loanTenure < config.minTenure) setValue('loanTenure', config.minTenure);
  }, [loanType]); // eslint-disable-line

  const onSubmit = (data: LoanDetailsFormData) => {
    updateLoanDetails(data);
    markStepComplete(1);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Loan Details</h2>
          <p className="text-sm text-slate-400">Choose your loan type and configure the details</p>
        </div>

        {/* Loan Type Cards */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Select Loan Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {LOAN_TYPES.map(({ type, label, icon, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('loanType', type)}
                aria-pressed={loanType === type}
                className={`loan-type-card ${loanType === type ? 'loan-type-card-active' : 'loan-type-card-inactive'}`}
              >
                <motion.div
                  animate={{ scale: loanType === type ? 1 : 0.9 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    loanType === type ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {icon}
                </motion.div>
                <p className={`text-sm font-semibold ${loanType === type ? 'text-brand-700' : 'text-slate-700'}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                {loanType === type && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute top-2 right-2"
                    initial={false}
                  >
                    <BadgeCheck className="w-4 h-4 text-brand-600" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
          {errors.loanType && (
            <p className="text-xs text-red-600 mt-1">{errors.loanType.message}</p>
          )}
        </div>

        {/* Loan Amount */}
        <FadeIn delay={0.05} className="mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Loan Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm font-semibold pointer-events-none">₹</span>
              <Controller
                name="loanAmount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="loan-amount"
                    placeholder="5,00,000"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={`input-base pl-8 ${errors.loanAmount ? 'input-error' : ''}`}
                  />
                )}
              />
            </div>
            <div className="mt-2 px-1">
              <Controller
                name="loanAmount"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min={config.minAmount}
                    max={config.maxAmount}
                    step={10000}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-label="Loan amount slider"
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                  />
                )}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{formatINRCompact(config.minAmount)}</span>
                <span className="font-semibold text-brand-600">{formatINRCompact(loanAmount || 0)}</span>
                <span>{formatINRCompact(config.maxAmount)}</span>
              </div>
            </div>
            {errors.loanAmount && <p className="text-xs text-red-600 mt-1">{errors.loanAmount.message}</p>}
          </div>
        </FadeIn>

        {/* Loan Tenure */}
        <FadeIn delay={0.1} className="mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Loan Tenure <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 mb-2">
              <Controller
                name="loanTenure"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min={config.minTenure}
                    max={config.maxTenure}
                    step={6}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-label="Loan tenure slider"
                    className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                  />
                )}
              />
              <div className="text-sm font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5 min-w-[80px] text-center">
                {loanTenure} mo
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{config.minTenure} months</span>
              <span>{config.maxTenure} months</span>
            </div>
            {errors.loanTenure && <p className="text-xs text-red-600 mt-1">{errors.loanTenure.message}</p>}
          </div>
        </FadeIn>

        {/* Loan Purpose */}
        <FadeIn delay={0.15} className="mb-5">
          <Select
            {...register('loanPurpose')}
            label="Loan Purpose"
            required
            placeholder="Select purpose"
            error={errors.loanPurpose?.message}
            options={config.purposes.map((p) => ({ value: p, label: p }))}
          />
        </FadeIn>

        {/* Referral Code */}
        <FadeIn delay={0.2} className="mb-6">
          <Input
            {...register('referralCode')}
            label="Referral Code"
            placeholder="Enter referral code (optional)"
            hint="Have a referral? Enter it for better rates"
          />
        </FadeIn>

        {/* EMI Preview Card */}
        <FadeIn delay={0.25}>
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-brand-200" />
              <span className="text-sm font-semibold text-brand-100">EMI Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-brand-200 mb-1">Monthly EMI</p>
                <p className="text-2xl font-bold">{formatINRCompact(emi.emi)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-200 mb-1">Total Interest</p>
                <p className="text-lg font-semibold">{formatINRCompact(emi.totalInterest)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-200 mb-1">Interest Rate</p>
                <p className="text-lg font-semibold">{emi.interestRate}% p.a.</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-brand-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-300" />
              <span className="text-xs text-brand-200">
                Total payable: <strong className="text-white">{formatINR(emi.totalPayable)}</strong>
              </span>
            </div>
          </div>
        </FadeIn>

        <Button type="submit" className="w-full" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
          Continue to Personal Info
        </Button>
      </FadeIn>
    </form>
  );
};
