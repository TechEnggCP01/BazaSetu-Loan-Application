import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Copy, Loader2 } from 'lucide-react';
import { addressSchema, type AddressFormData } from '../../lib/schemas';
import { useLoanStore } from '../../store/loanStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FadeIn } from '../../components/ui/StepTransition';
import { usePinLookup } from '../../hooks/usePinLookup';

interface Step4Props { onNext: () => void; onBack: () => void; }

const RESIDENCE_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'family_owned', label: 'Family Owned' },
  { value: 'company_provided', label: 'Company Provided' },
];

export const Step4Address: React.FC<Step4Props> = ({ onNext, onBack }) => {
  const { address, updateAddress, markStepComplete } = useLoanStore();
  const currentPinLookup = usePinLookup();
  const permanentPinLookup = usePinLookup();

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      currentAddressLine1: address.currentAddressLine1 ?? '',
      currentAddressLine2: address.currentAddressLine2 ?? '',
      currentPinCode: address.currentPinCode ?? '',
      currentCity: address.currentCity ?? '',
      currentState: address.currentState ?? '',
      currentResidenceType: address.currentResidenceType ?? 'owned',
      currentYearsAtAddress: address.currentYearsAtAddress ?? 0,
      sameAsCurrent: address.sameAsCurrent ?? false,
      permanentAddressLine1: address.permanentAddressLine1 ?? '',
      permanentPinCode: address.permanentPinCode ?? '',
      permanentCity: address.permanentCity ?? '',
      permanentState: address.permanentState ?? '',
      hasPreviousAddress: false,
    },
  });

  const sameAsCurrent = watch('sameAsCurrent');
  const currentPin = watch('currentPinCode');
  const permanentPin = watch('permanentPinCode');
  const yearsAtAddress = watch('currentYearsAtAddress');

  // PIN auto-fill
  useEffect(() => {
    if (currentPin?.length === 6) {
      currentPinLookup.lookup(currentPin).then(() => {
        if (currentPinLookup.city) {
          setValue('currentCity', currentPinLookup.city);
          setValue('currentState', currentPinLookup.state);
        }
      });
    }
  }, [currentPin]); // eslint-disable-line

  useEffect(() => {
    if (currentPinLookup.city) {
      setValue('currentCity', currentPinLookup.city);
      setValue('currentState', currentPinLookup.state);
    }
  }, [currentPinLookup.city, currentPinLookup.state]); // eslint-disable-line

  useEffect(() => {
    if (permanentPin?.length === 6 && !sameAsCurrent) {
      permanentPinLookup.lookup(permanentPin).then(() => {
        if (permanentPinLookup.city) {
          setValue('permanentCity', permanentPinLookup.city);
          setValue('permanentState', permanentPinLookup.state);
        }
      });
    }
  }, [permanentPin]); // eslint-disable-line

  useEffect(() => {
    if (permanentPinLookup.city) {
      setValue('permanentCity', permanentPinLookup.city);
      setValue('permanentState', permanentPinLookup.state);
    }
  }, [permanentPinLookup.city, permanentPinLookup.state]); // eslint-disable-line

  const copyCurrentToPermanent = () => {
    setValue('permanentAddressLine1', watch('currentAddressLine1'));
    setValue('permanentPinCode', watch('currentPinCode'));
    setValue('permanentCity', watch('currentCity'));
    setValue('permanentState', watch('currentState'));
  };

  const onSubmit = (data: AddressFormData) => {
    updateAddress(data);
    markStepComplete(4);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Address Details</h2>
          <p className="text-sm text-slate-400">Enter your current and permanent address</p>
        </div>

        {/* Current Address */}
        <div className="step-card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Current Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                {...register('currentAddressLine1')}
                label="Address Line 1"
                placeholder="House / Flat No, Building Name, Street"
                error={errors.currentAddressLine1?.message}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                {...register('currentAddressLine2')}
                label="Address Line 2"
                placeholder="Area / Locality (Optional)"
              />
            </div>
            <div>
              <Input
                {...register('currentPinCode')}
                label="PIN Code"
                maxLength={6}
                placeholder="400001"
                error={errors.currentPinCode?.message}
                required
                suffix={currentPinLookup.loading ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : undefined}
              />
            </div>
            <div>
              <Input
                {...register('currentCity')}
                label="City"
                placeholder="Auto-filled from PIN"
                error={errors.currentCity?.message}
                required
                readOnly={!!currentPinLookup.city}
              />
            </div>
            <div>
              <Input
                {...register('currentState')}
                label="State"
                placeholder="Auto-filled from PIN"
                error={errors.currentState?.message}
                required
                readOnly={!!currentPinLookup.state}
              />
            </div>
            <div>
              <Select
                {...register('currentResidenceType')}
                label="Residence Type"
                options={RESIDENCE_OPTIONS}
                error={errors.currentResidenceType?.message}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Years at Current Address <span className="text-red-500">*</span>
              </label>
              <Controller
                name="currentYearsAtAddress"
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
                    <span className="text-sm font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-1.5 min-w-[60px] text-center">
                      {field.value}y
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="step-card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Permanent Address
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('sameAsCurrent')}
                onChange={(e) => {
                  setValue('sameAsCurrent', e.target.checked);
                  if (e.target.checked) copyCurrentToPermanent();
                }}
                className="w-4 h-4 rounded border-slate-300 text-brand-600"
              />
              <span className="text-xs font-medium text-slate-600">Same as current</span>
            </label>
          </div>

          <AnimatePresence>
            {!sameAsCurrent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="sm:col-span-2">
                  <Input
                    {...register('permanentAddressLine1')}
                    label="Address Line 1"
                    placeholder="House / Flat No, Building Name, Street"
                  />
                </div>
                <div>
                  <Input
                    {...register('permanentPinCode')}
                    label="PIN Code"
                    maxLength={6}
                    placeholder="110001"
                    suffix={permanentPinLookup.loading ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : undefined}
                  />
                </div>
                <div>
                  <Input
                    {...register('permanentCity')}
                    label="City"
                    placeholder="Auto-filled from PIN"
                    readOnly={!!permanentPinLookup.city}
                  />
                </div>
                <div>
                  <Input
                    {...register('permanentState')}
                    label="State"
                    placeholder="Auto-filled from PIN"
                    readOnly={!!permanentPinLookup.state}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={copyCurrentToPermanent}
                    className="btn-ghost text-brand-600 flex items-center gap-1.5 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy from current address
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {sameAsCurrent && (
            <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
              Permanent address is same as current address
            </p>
          )}
        </div>

        {/* Previous Address if < 2 years */}
        <AnimatePresence>
          {yearsAtAddress < 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="step-card mb-4"
            >
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                ⚠️ Previous Address Required
                <span className="text-xs font-normal text-slate-400">(less than 2 years at current)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    {...register('previousAddressLine1')}
                    label="Previous Address Line 1"
                    placeholder="Enter previous address"
                  />
                </div>
                <Input
                  {...register('previousCity')}
                  label="City"
                  placeholder="City"
                />
                <Input
                  {...register('previousState')}
                  label="State"
                  placeholder="State"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onBack} icon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button type="submit" className="flex-1" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
            Continue to Employment
          </Button>
        </div>
      </FadeIn>
    </form>
  );
};
