import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ChevronLeft, CheckCircle, Edit3, CreditCard, User, Shield,
  MapPin, Briefcase, Users, FileText, TrendingUp, AlertCircle, Sparkles
} from 'lucide-react';
import { reviewSchema, type ReviewFormData } from '../../lib/schemas';
import { LOAN_CONFIGS, formatINR, formatINRCompact, calculateEMI, calculateEligibility } from '../../lib/utils';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/ui/StepTransition';
import type { LoanType } from '../../types/loan';

interface Step8Props { onBack: () => void; onSubmit: () => void; }

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, onEdit, children }) => (
  <div className="step-card mb-3">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="btn-ghost text-xs text-brand-600 flex items-center gap-1"
      >
        <Edit3 className="w-3 h-3" /> Edit
      </button>
    </div>
    {children}
  </div>
);

const ReviewRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline py-1.5 border-b border-slate-50 last:border-0">
    <span className="text-xs text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-700 text-right max-w-[55%]">{value || '—'}</span>
  </div>
);

export const Step8Review: React.FC<Step8Props> = ({ onBack, onSubmit: onFinalSubmit }) => {
  const [submitted, setSubmitted] = useState(false);
  const store = useLoanStore();
  const { loanDetails, personalInfo, kyc, address, employment, coApplicant, documents, setCurrentStep } = store;

  const { register, handleSubmit, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { termsAccepted: false, creditBureauConsent: false, dataProcessingConsent: false },
  });

  const config = LOAN_CONFIGS[(loanDetails.loanType as LoanType) ?? 'personal'];
  const emi = calculateEMI(loanDetails.loanAmount ?? 0, config.baseRate, loanDetails.loanTenure ?? 12);
  const getMonthlyIncome = () => {
    if (employment.employmentType === 'salaried') return employment.salaried?.monthlySalary ?? 0;
    if (employment.employmentType === 'self_employed') return (employment.selfEmployed?.annualTurnover ?? 0) / 12;
    if (employment.employmentType === 'business_owner') return (employment.businessOwner?.annualRevenue ?? 0) / 12;
    return 0;
  };
  const monthlyIncome = getMonthlyIncome();
  const eligibility = calculateEligibility(loanDetails.loanAmount ?? 0, monthlyIncome, (loanDetails.loanType as LoanType) ?? 'personal');

  const docsUploaded = [
    documents.panCard,
    documents.aadhaarCard,
    documents.salarySlip,
    documents.bankStatement,
  ].filter(Boolean).length;

  const onSubmit = () => {
    setSubmitted(true);
    setTimeout(onFinalSubmit, 2500);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mb-5 shadow-lg"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
        <p className="text-slate-500 mb-4">Your pre-approval is being generated...</p>
        <div className="flex gap-1 items-center">
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-brand-600" />
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-brand-600" />
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-brand-600" />
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Review & Submit</h2>
          <p className="text-sm text-slate-400">Please review all details before submitting</p>
        </div>

        {/* Eligibility Banner */}
        <div className={`rounded-2xl p-5 mb-5 text-white ${
          eligibility.riskLevel === 'low' ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
          : eligibility.riskLevel === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-600'
          : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Loan Eligibility</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              eligibility.riskLevel === 'low' ? 'bg-white/20' : 'bg-white/20'
            }`}>
              {eligibility.riskLevel.toUpperCase()} RISK
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs opacity-75 mb-1">Eligibility Score</p>
              <p className="text-2xl font-bold">{eligibility.score}</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1">Monthly EMI</p>
              <p className="text-xl font-bold">{formatINRCompact(emi.emi)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1">Max Eligible</p>
              <p className="text-xl font-bold">{formatINRCompact(eligibility.maxAmount)}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <SectionCard title="Loan Details" icon={<CreditCard className="w-4 h-4" />} onEdit={() => setCurrentStep(1)}>
          <ReviewRow label="Loan Type" value={loanDetails.loanType?.charAt(0).toUpperCase() + (loanDetails.loanType?.slice(1) ?? '')} />
          <ReviewRow label="Amount" value={formatINR(loanDetails.loanAmount ?? 0)} />
          <ReviewRow label="Tenure" value={`${loanDetails.loanTenure} months`} />
          <ReviewRow label="Purpose" value={loanDetails.loanPurpose} />
          <ReviewRow label="Interest Rate" value={`${config.baseRate}% p.a.`} />
        </SectionCard>

        <SectionCard title="Personal Information" icon={<User className="w-4 h-4" />} onEdit={() => setCurrentStep(2)}>
          <ReviewRow label="Full Name" value={personalInfo.fullName} />
          <ReviewRow label="Date of Birth" value={personalInfo.dateOfBirth} />
          <ReviewRow label="Gender" value={personalInfo.gender} />
          <ReviewRow label="Marital Status" value={personalInfo.maritalStatus} />
          <ReviewRow label="Mobile" value={`+91 ${personalInfo.mobileNumber}`} />
          <ReviewRow label="Email" value={personalInfo.email} />
        </SectionCard>

        <SectionCard title="KYC" icon={<Shield className="w-4 h-4" />} onEdit={() => setCurrentStep(3)}>
          <ReviewRow label="PAN Number" value={kyc.panNumber ? `${kyc.panNumber.slice(0, 3)}**${kyc.panNumber.slice(-2)}` : undefined} />
          <ReviewRow label="PAN Status" value={kyc.panVerified ? '✓ Verified' : 'Not Verified'} />
          <ReviewRow label="Aadhaar" value={kyc.aadhaarNumber ? `****-****-${kyc.aadhaarNumber.slice(-4)}` : undefined} />
          <ReviewRow label="Aadhaar Status" value={kyc.aadhaarVerified ? '✓ Verified' : 'Not Verified'} />
        </SectionCard>

        <SectionCard title="Address" icon={<MapPin className="w-4 h-4" />} onEdit={() => setCurrentStep(4)}>
          <ReviewRow label="Current Address" value={[address.currentAddressLine1, address.currentCity, address.currentState].filter(Boolean).join(', ')} />
          <ReviewRow label="PIN Code" value={address.currentPinCode} />
          <ReviewRow label="Residence Type" value={address.currentResidenceType} />
        </SectionCard>

        <SectionCard title="Employment & Income" icon={<Briefcase className="w-4 h-4" />} onEdit={() => setCurrentStep(5)}>
          <ReviewRow label="Employment Type" value={employment.employmentType} />
          {employment.salaried && (
            <>
              <ReviewRow label="Company" value={employment.salaried.companyName} />
              <ReviewRow label="Monthly Salary" value={formatINR(employment.salaried.monthlySalary)} />
            </>
          )}
          {employment.selfEmployed && (
            <>
              <ReviewRow label="Business" value={employment.selfEmployed.businessName} />
              <ReviewRow label="Annual Turnover" value={formatINR(employment.selfEmployed.annualTurnover)} />
            </>
          )}
          {employment.businessOwner && (
            <ReviewRow label="Annual Revenue" value={formatINR(employment.businessOwner.annualRevenue)} />
          )}
        </SectionCard>

        {coApplicant.hasCoApplicant && (
          <SectionCard title="Co-applicant" icon={<Users className="w-4 h-4" />} onEdit={() => setCurrentStep(6)}>
            <ReviewRow label="Name" value={coApplicant.spouseName} />
            <ReviewRow label="Relationship" value={coApplicant.relationship} />
            <ReviewRow label="Contact" value={coApplicant.coApplicantContact} />
          </SectionCard>
        )}

        <SectionCard title="Documents & Signature" icon={<FileText className="w-4 h-4" />} onEdit={() => setCurrentStep(7)}>
          <ReviewRow label="Documents Uploaded" value={`${docsUploaded} document${docsUploaded !== 1 ? 's' : ''}`} />
          <ReviewRow label="E-Signature" value={documents.signatureDataUrl ? '✓ Signed' : 'Not Signed'} />
          {documents.signatureDataUrl && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg">
              <img src={documents.signatureDataUrl} alt="Signature preview" className="h-12 object-contain" />
            </div>
          )}
        </SectionCard>

        {/* Consent Section */}
        <div className="step-card mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Consents & Declarations
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('termsAccepted')} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer" />
              <div>
                <p className="text-sm text-slate-700">I accept the <span className="text-brand-600 underline cursor-pointer">Terms & Conditions</span> and Privacy Policy</p>
                {errors.termsAccepted && <p className="text-xs text-red-600 mt-0.5">{errors.termsAccepted.message}</p>}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('creditBureauConsent')} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer" />
              <div>
                <p className="text-sm text-slate-700">I consent to credit bureau enquiry (CIBIL / Experian / Equifax)</p>
                {errors.creditBureauConsent && <p className="text-xs text-red-600 mt-0.5">{errors.creditBureauConsent.message}</p>}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('dataProcessingConsent')} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer" />
              <div>
                <p className="text-sm text-slate-700">I consent to processing of my personal and financial data for loan assessment</p>
                {errors.dataProcessingConsent && <p className="text-xs text-red-600 mt-0.5">{errors.dataProcessingConsent.message}</p>}
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 gradient-brand border-0 shadow-lg shadow-brand-200"
            size="lg"
            icon={<Sparkles className="w-5 h-5" />}
          >
            Generate Pre-Approval
          </Button>
        </div>
      </FadeIn>
    </form>
  );
};
