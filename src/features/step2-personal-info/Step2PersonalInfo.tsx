import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft, Phone, CheckCircle } from 'lucide-react';
import { personalInfoSchema, type PersonalInfoFormData } from '../../lib/schemas';
import { calculateAge } from '../../lib/utils';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FadeIn } from '../../components/ui/StepTransition';
import { OTPModal } from '../../components/modals/OTPModal';
import { useOTP } from '../../hooks/useOTP';
import { PopIn } from '../../components/ui/StepTransition';

interface Step2Props { onNext: () => void; onBack: () => void; }

export const Step2PersonalInfo: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const { personalInfo, updatePersonalInfo, markStepComplete } = useLoanStore();
  const { sendOTP, verifyOTP, resendCooldown } = useOTP();
  const [showOTP, setShowOTP] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(personalInfo.mobileVerified ?? false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: personalInfo.fullName ?? '',
      dateOfBirth: personalInfo.dateOfBirth ?? '',
      gender: personalInfo.gender ?? 'male',
      maritalStatus: personalInfo.maritalStatus ?? 'single',
      fatherName: personalInfo.fatherName ?? '',
      motherName: personalInfo.motherName ?? '',
      email: personalInfo.email ?? '',
      mobileNumber: personalInfo.mobileNumber ?? '',
      alternateMobile: personalInfo.alternateMobile ?? '',
      mobileVerified: mobileVerified,
      emailVerified: personalInfo.emailVerified ?? false,
    },
  });

  const dob = watch('dateOfBirth');
  const mobile = watch('mobileNumber');
  const age = dob ? calculateAge(dob) : null;

  const handleSendOTP = () => {
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) return;
    sendOTP();
    setShowOTP(true);
  };

  const onSubmit = (data: PersonalInfoFormData) => {
    updatePersonalInfo({ ...data, mobileVerified });
    markStepComplete(2);
    onNext();
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  const maritalOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FadeIn>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Personal Information</h2>
            <p className="text-sm text-slate-400">Tell us about yourself</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FadeIn delay={0.05} className="sm:col-span-2">
              <Input
                {...register('fullName')}
                label="Full Name"
                placeholder="As per Aadhaar / PAN"
                error={errors.fullName?.message}
                required
                autoComplete="name"
              />
            </FadeIn>

            <FadeIn delay={0.08}>
              <div>
                <Input
                  {...register('dateOfBirth')}
                  label="Date of Birth"
                  type="date"
                  error={errors.dateOfBirth?.message}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  suffix={
                    age !== null && age >= 18 && age <= 70 ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {age}y
                      </span>
                    ) : null
                  }
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Select
                {...register('gender')}
                label="Gender"
                options={genderOptions}
                error={errors.gender?.message}
                required
              />
            </FadeIn>

            <FadeIn delay={0.12}>
              <Select
                {...register('maritalStatus')}
                label="Marital Status"
                options={maritalOptions}
                error={errors.maritalStatus?.message}
                required
              />
            </FadeIn>

            <FadeIn delay={0.14}>
              <Input
                {...register('fatherName')}
                label="Father's Name"
                placeholder="Full name"
                error={errors.fatherName?.message}
                required
              />
            </FadeIn>

            <FadeIn delay={0.16}>
              <Input
                {...register('motherName')}
                label="Mother's Name"
                placeholder="Full name"
                error={errors.motherName?.message}
                required
              />
            </FadeIn>

            <FadeIn delay={0.18} className="sm:col-span-2">
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                required
                autoComplete="email"
              />
            </FadeIn>

            {/* Mobile with OTP */}
            <FadeIn delay={0.2} className="sm:col-span-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm pointer-events-none">
                      +91
                    </span>
                    <input
                      {...register('mobileNumber')}
                      type="tel"
                      id="mobile-number"
                      maxLength={10}
                      placeholder="98765 43210"
                      className={`input-base pl-12 ${errors.mobileNumber || errors.mobileVerified ? 'input-error' : ''}`}
                    />
                  </div>
                  {mobileVerified ? (
                    <PopIn className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </PopIn>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSendOTP}
                      icon={<Phone className="w-4 h-4" />}
                    >
                      Send OTP
                    </Button>
                  )}
                </div>
                {errors.mobileNumber && <p className="text-xs text-red-600 mt-1">{errors.mobileNumber.message}</p>}
                {errors.mobileVerified && !mobileVerified && (
                  <p className="text-xs text-red-600 mt-1">{errors.mobileVerified.message}</p>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.22} className="sm:col-span-2">
              <Input
                {...register('alternateMobile')}
                label="Alternate Mobile"
                type="tel"
                maxLength={10}
                placeholder="Optional"
                error={errors.alternateMobile?.message}
              />
            </FadeIn>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button type="submit" className="flex-1" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
              Continue to KYC
            </Button>
          </div>
        </FadeIn>
      </form>

      <OTPModal
        open={showOTP}
        mobile={mobile}
        verifyFn={verifyOTP}
        resendCooldown={resendCooldown}
        onResend={sendOTP}
        onVerify={() => {
          setMobileVerified(true);
          setValue('mobileVerified', true);
        }}
        onClose={() => setShowOTP(false)}
      />
    </>
  );
};
