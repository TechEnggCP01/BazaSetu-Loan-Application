import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Briefcase, User, TrendingUp } from 'lucide-react';
import { employmentSchema, type EmploymentFormData } from '../../lib/schemas';
import { formatINR, formatINRCompact } from '../../lib/utils';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FadeIn } from '../../components/ui/StepTransition';
import type { EmploymentType } from '../../types/loan';

interface Step5Props { onNext: () => void; onBack: () => void; }

const EMPLOYMENT_TYPES: { type: EmploymentType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'salaried', label: 'Salaried', icon: <User className="w-5 h-5" />, desc: 'Full-time employee' },
  { type: 'self_employed', label: 'Self Employed', icon: <TrendingUp className="w-5 h-5" />, desc: 'Freelancer / Consultant' },
  { type: 'business_owner', label: 'Business Owner', icon: <Briefcase className="w-5 h-5" />, desc: 'Own business or company' },
];

const BUSINESS_TYPES = [
  { value: 'retail', label: 'Retail / Trading' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

export const Step5Employment: React.FC<Step5Props> = ({ onNext, onBack }) => {
  const { employment, loanDetails, updateEmployment, markStepComplete } = useLoanStore();

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      employmentType: (employment.employmentType as EmploymentType) ?? 'salaried',
      salaried: employment.salaried ?? { companyName: '', designation: '', monthlySalary: 50000, yearsOfExperience: 2 },
      selfEmployed: employment.selfEmployed ?? { businessName: '', businessType: '', annualTurnover: 500000, yearsInBusiness: 1 },
      businessOwner: employment.businessOwner ?? { registrationNumber: '', gstNumber: '', annualRevenue: 1000000 },
    },
  });

  const empType = watch('employmentType');
  const salary = watch('salaried.monthlySalary');
  const turnover = watch('selfEmployed.annualTurnover');
  const revenue = watch('businessOwner.annualRevenue');

  const getMonthlyIncome = () => {
    if (empType === 'salaried') return salary ?? 0;
    if (empType === 'self_employed') return (turnover ?? 0) / 12;
    return (revenue ?? 0) / 12;
  };

  const dti = loanDetails.loanAmount && getMonthlyIncome()
    ? ((loanDetails.loanAmount / (loanDetails.loanTenure ?? 36)) / getMonthlyIncome()) * 100
    : 0;

  const onSubmit = (data: EmploymentFormData) => {
    updateEmployment(data as any);
    markStepComplete(5);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Employment & Income</h2>
          <p className="text-sm text-slate-400">Share your employment and income details</p>
        </div>

        {/* Employment Type Cards */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {EMPLOYMENT_TYPES.map(({ type, label, icon, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('employmentType', type)}
                aria-pressed={empType === type}
                className={`loan-type-card ${empType === type ? 'loan-type-card-active' : 'loan-type-card-inactive'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                  empType === type ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {icon}
                </div>
                <p className={`text-sm font-semibold ${empType === type ? 'text-brand-700' : 'text-slate-700'}`}>{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Forms */}
        <AnimatePresence mode="wait">
          {empType === 'salaried' && (
            <motion.div
              key="salaried"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-card mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="sm:col-span-2">
                <Input
                  {...register('salaried.companyName')}
                  label="Company Name"
                  placeholder="Infosys, TCS, etc."
                  error={errors.salaried?.companyName?.message}
                  required
                />
              </div>
              <Input
                {...register('salaried.designation')}
                label="Designation"
                placeholder="Software Engineer, Manager, etc."
                error={errors.salaried?.designation?.message}
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Monthly Salary (₹) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="salaried.monthlySalary"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={`input-base ${errors.salaried?.monthlySalary ? 'input-error' : ''}`}
                      placeholder="50000"
                    />
                  )}
                />
                {errors.salaried?.monthlySalary && (
                  <p className="text-xs text-red-600 mt-1">{errors.salaried.monthlySalary.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Years of Experience</label>
                <Controller
                  name="salaried.yearsOfExperience"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                      />
                      <span className="text-sm font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5 min-w-[50px] text-center">
                        {field.value}y
                      </span>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          {empType === 'self_employed' && (
            <motion.div
              key="self"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-card mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Input
                {...register('selfEmployed.businessName')}
                label="Business / Practice Name"
                placeholder="Your business name"
                error={errors.selfEmployed?.businessName?.message}
                required
              />
              <Select
                {...register('selfEmployed.businessType')}
                label="Business Type"
                options={BUSINESS_TYPES}
                placeholder="Select type"
                error={errors.selfEmployed?.businessType?.message}
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Annual Turnover (₹) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="selfEmployed.annualTurnover"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={`input-base ${errors.selfEmployed?.annualTurnover ? 'input-error' : ''}`}
                    />
                  )}
                />
                {errors.selfEmployed?.annualTurnover && (
                  <p className="text-xs text-red-600 mt-1">{errors.selfEmployed.annualTurnover.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Years in Business</label>
                <Controller
                  name="selfEmployed.yearsInBusiness"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-600"
                      />
                      <span className="text-sm font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5 min-w-[50px] text-center">
                        {field.value}y
                      </span>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}

          {empType === 'business_owner' && (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-card mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Input
                {...register('businessOwner.registrationNumber')}
                label="Registration Number"
                placeholder="CIN / LLPIN / Partnership No."
                error={errors.businessOwner?.registrationNumber?.message}
                required
              />
              <Input
                {...register('businessOwner.gstNumber')}
                label="GST Number"
                placeholder="29ABCDE1234F1Z5 (Optional)"
                error={errors.businessOwner?.gstNumber?.message}
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Annual Revenue (₹) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="businessOwner.annualRevenue"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className={`input-base ${errors.businessOwner?.annualRevenue ? 'input-error' : ''}`}
                    />
                  )}
                />
                {errors.businessOwner?.annualRevenue && (
                  <p className="text-xs text-red-600 mt-1">{errors.businessOwner.annualRevenue.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Income Eligibility Card */}
        <FadeIn delay={0.2} className="mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Income Eligibility</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                dti < 40 ? 'bg-emerald-100 text-emerald-700' : dti < 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {dti < 40 ? 'Excellent' : dti < 60 ? 'Moderate' : 'High Risk'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Monthly Income</p>
                <p className="font-bold text-slate-800">{formatINR(getMonthlyIncome())}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Debt-to-Income Ratio</p>
                <p className={`font-bold ${dti < 40 ? 'text-emerald-700' : dti < 60 ? 'text-amber-700' : 'text-red-700'}`}>
                  {dti.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Max eligible: {formatINRCompact(getMonthlyIncome() * 60)} based on income
            </div>
          </div>
        </FadeIn>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button type="submit" className="flex-1" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
            Continue
          </Button>
        </div>
      </FadeIn>
    </form>
  );
};
