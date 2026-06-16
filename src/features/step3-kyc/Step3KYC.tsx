import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { kycSchema, type KYCFormData } from '../../lib/schemas';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FadeIn, PopIn } from '../../components/ui/StepTransition';
import { useKYCVerification } from '../../hooks/useKYCVerification';

interface Step3Props { onNext: () => void; onBack: () => void; }

type VerificationStatus = 'idle' | 'loading' | 'verified' | 'failed';

const VerificationBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'idle') return null;
  return (
    <AnimatePresence>
      <PopIn key={status}>
        {status === 'loading' && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </div>
        )}
        {status === 'verified' && (
          <div className="badge-verified">
            <CheckCircle className="w-3.5 h-3.5" /> Verified
          </div>
        )}
        {status === 'failed' && (
          <div className="badge-error">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </div>
        )}
      </PopIn>
    </AnimatePresence>
  );
};

export const Step3KYC: React.FC<Step3Props> = ({ onNext, onBack }) => {
  const { kyc, updateKYC, markStepComplete } = useLoanStore();
  const { panStatus, aadhaarStatus, verifyPAN, verifyAadhaar } = useKYCVerification();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      panNumber: kyc.panNumber ?? '',
      panVerified: kyc.panVerified ?? false,
      aadhaarNumber: kyc.aadhaarNumber ?? '',
      aadhaarVerified: kyc.aadhaarVerified ?? false,
      aadhaarConsent: kyc.aadhaarConsent ?? false,
      voterId: kyc.voterId ?? '',
      passportNumber: kyc.passportNumber ?? '',
    },
  });

  const pan = watch('panNumber');
  const aadhaar = watch('aadhaarNumber');
  const aadhaarConsent = watch('aadhaarConsent');
  const panVerified = panStatus === 'verified';
  const aadhaarVerified = aadhaarStatus === 'verified';

  const handleVerifyPAN = async () => {
    const ok = await verifyPAN(pan.toUpperCase());
    if (ok) setValue('panVerified', true);
  };

  const handleVerifyAadhaar = async () => {
    const ok = await verifyAadhaar(aadhaar);
    if (ok) setValue('aadhaarVerified', true);
  };

  const onSubmit = (data: KYCFormData) => {
    updateKYC({ ...data, panVerified, aadhaarVerified });
    markStepComplete(3);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">KYC Verification</h2>
          <p className="text-sm text-slate-400">Verify your identity documents</p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
          <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-brand-700">
            Your data is encrypted and shared only with authorized credit bureaus. We follow RBI-compliant KYC norms.
          </p>
        </div>

        {/* PAN Section */}
        <div className="step-card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            PAN Card Verification
          </h3>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                {...register('panNumber')}
                label="PAN Number"
                placeholder="ABCDE1234F"
                error={errors.panNumber?.message || (errors.panVerified ? errors.panVerified.message : undefined)}
                required
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().slice(0, 10);
                  setValue('panNumber', val);
                  setValue('panVerified', false);
                }}
                suffix={<VerificationBadge status={panStatus} />}
              />
            </div>
            <Button
              type="button"
              variant={panVerified ? 'secondary' : 'primary'}
              onClick={handleVerifyPAN}
              disabled={panStatus === 'loading' || panVerified}
              loading={panStatus === 'loading'}
              className="mb-0 flex-shrink-0 h-[50px]"
            >
              {panVerified ? 'Verified ✓' : 'Verify'}
            </Button>
          </div>
          <AnimatePresence>
            {panVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">PAN verified successfully</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Aadhaar Section */}
        <div className="step-card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Aadhaar Verification
          </h3>

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              {...register('aadhaarConsent')}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 cursor-pointer"
              aria-describedby="aadhaar-consent-desc"
            />
            <div id="aadhaar-consent-desc">
              <p className="text-sm text-slate-700 font-medium">Aadhaar Consent</p>
              <p className="text-xs text-slate-400 mt-0.5">
                I consent to share my Aadhaar number for KYC verification as per UIDAI guidelines.
              </p>
            </div>
          </label>
          {errors.aadhaarConsent && (
            <p className="text-xs text-red-600 mb-3">{errors.aadhaarConsent.message}</p>
          )}

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                {...register('aadhaarNumber')}
                label="Aadhaar Number"
                placeholder="1234 5678 9012"
                maxLength={12}
                disabled={!aadhaarConsent}
                error={errors.aadhaarNumber?.message || (errors.aadhaarVerified ? errors.aadhaarVerified.message : undefined)}
                required
                suffix={<VerificationBadge status={aadhaarStatus} />}
              />
            </div>
            <Button
              type="button"
              variant={aadhaarVerified ? 'secondary' : 'primary'}
              onClick={handleVerifyAadhaar}
              disabled={!aadhaarConsent || aadhaarStatus === 'loading' || aadhaarVerified}
              loading={aadhaarStatus === 'loading'}
              className="flex-shrink-0 h-[50px]"
            >
              {aadhaarVerified ? 'Verified ✓' : 'Verify'}
            </Button>
          </div>
          <AnimatePresence>
            {aadhaarVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">Aadhaar verified successfully</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Optional IDs */}
        <div className="step-card mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Optional Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('voterId')}
              label="Voter ID"
              placeholder="Optional"
              error={errors.voterId?.message}
            />
            <Input
              {...register('passportNumber')}
              label="Passport Number"
              placeholder="A1234567 (Optional)"
              error={errors.passportNumber?.message}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button type="submit" className="flex-1" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
            Continue to Address
          </Button>
        </div>
      </FadeIn>
    </form>
  );
};
