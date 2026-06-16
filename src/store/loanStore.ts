import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WizardState } from '../types/loan';

interface LoanStore extends WizardState {
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  updateLoanDetails: (data: Partial<WizardState['loanDetails']>) => void;
  updatePersonalInfo: (data: Partial<WizardState['personalInfo']>) => void;
  updateKYC: (data: Partial<WizardState['kyc']>) => void;
  updateAddress: (data: Partial<WizardState['address']>) => void;
  updateEmployment: (data: Partial<WizardState['employment']>) => void;
  updateCoApplicant: (data: Partial<WizardState['coApplicant']>) => void;
  updateDocuments: (data: Partial<WizardState['documents']>) => void;
  setLastSaved: (ts: string) => void;
  setHasUnsavedChanges: (val: boolean) => void;
  resetStore: () => void;
  hasSavedData: () => boolean;
}

const initialState: WizardState = {
  currentStep: 1,
  completedSteps: [],
  lastSaved: null,
  hasUnsavedChanges: false,
  loanDetails: {},
  personalInfo: {},
  kyc: {},
  address: {},
  employment: {},
  coApplicant: {},
  documents: {},
};

export const useLoanStore = create<LoanStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      updateLoanDetails: (data) =>
        set((state) => ({
          loanDetails: { ...state.loanDetails, ...data },
          hasUnsavedChanges: true,
        })),

      updatePersonalInfo: (data) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...data },
          hasUnsavedChanges: true,
        })),

      updateKYC: (data) =>
        set((state) => ({
          kyc: { ...state.kyc, ...data },
          hasUnsavedChanges: true,
        })),

      updateAddress: (data) =>
        set((state) => ({
          address: { ...state.address, ...data },
          hasUnsavedChanges: true,
        })),

      updateEmployment: (data) =>
        set((state) => ({
          employment: { ...state.employment, ...data },
          hasUnsavedChanges: true,
        })),

      updateCoApplicant: (data) =>
        set((state) => ({
          coApplicant: { ...state.coApplicant, ...data },
          hasUnsavedChanges: true,
        })),

      updateDocuments: (data) =>
        set((state) => ({
          documents: { ...state.documents, ...data },
          hasUnsavedChanges: true,
        })),

      setLastSaved: (ts) => set({ lastSaved: ts, hasUnsavedChanges: false }),

      setHasUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),

      resetStore: () => set(initialState),

      hasSavedData: () => {
        const state = get();
        return (
          Object.keys(state.loanDetails).length > 0 ||
          Object.keys(state.personalInfo).length > 0 ||
          state.completedSteps.length > 0
        );
      },
    }),
    {
      name: 'lendswift-application',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
