// ── Loan Types ────────────────────────────────────────────────────────────────
export type LoanType = 'personal' | 'home' | 'business';
export type EmploymentType = 'salaried' | 'self_employed' | 'business_owner';
export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type ResidenceType = 'owned' | 'rented' | 'family_owned' | 'company_provided';
export type RiskLevel = 'low' | 'medium' | 'high';

// ── Step Data ─────────────────────────────────────────────────────────────────

export interface LoanDetailsData {
  loanType: LoanType;
  loanAmount: number;
  loanTenure: number; // in months
  loanPurpose: string;
  referralCode?: string;
}

export interface PersonalInfoData {
  fullName: string;
  dateOfBirth: string; // ISO date string
  gender: GenderType;
  maritalStatus: MaritalStatus;
  fatherName: string;
  motherName: string;
  email: string;
  mobileNumber: string;
  alternateMobile?: string;
  mobileVerified: boolean;
  emailVerified: boolean;
}

export interface KYCData {
  panNumber: string;
  panVerified: boolean;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  aadhaarConsent: boolean;
  voterId?: string;
  passportNumber?: string;
}

export interface AddressData {
  // Current Address
  currentAddressLine1: string;
  currentAddressLine2?: string;
  currentPinCode: string;
  currentCity: string;
  currentState: string;
  currentResidenceType: ResidenceType;
  currentYearsAtAddress: number;

  // Permanent Address
  sameAsCurrent: boolean;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentPinCode?: string;
  permanentCity?: string;
  permanentState?: string;

  // Previous Address (if < 2 years at current)
  hasPreviousAddress?: boolean;
  previousAddressLine1?: string;
  previousCity?: string;
  previousState?: string;
}

export interface SalariedData {
  companyName: string;
  designation: string;
  monthlySalary: number;
  yearsOfExperience: number;
}

export interface SelfEmployedData {
  businessName: string;
  businessType: string;
  annualTurnover: number;
  yearsInBusiness: number;
}

export interface BusinessOwnerData {
  registrationNumber: string;
  gstNumber?: string;
  annualRevenue: number;
}

export interface EmploymentData {
  employmentType: EmploymentType;
  salaried?: SalariedData;
  selfEmployed?: SelfEmployedData;
  businessOwner?: BusinessOwnerData;
}

export interface CoApplicantData {
  hasCoApplicant: boolean;
  spouseName?: string;
  relationship?: string;
  coApplicantIncome?: number;
  coApplicantContact?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 preview
  uploadedAt: string;
}

export interface DocumentsData {
  // Identity
  panCard?: UploadedFile;
  aadhaarCard?: UploadedFile;
  // Address
  utilityBill?: UploadedFile;
  passport?: UploadedFile;
  // Income
  salarySlip?: UploadedFile;
  bankStatement?: UploadedFile;
  itr?: UploadedFile;
  // Signature
  signatureDataUrl?: string;
}

// ── Wizard State ──────────────────────────────────────────────────────────────

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  lastSaved: string | null; // ISO timestamp
  hasUnsavedChanges: boolean;
  loanDetails: Partial<LoanDetailsData>;
  personalInfo: Partial<PersonalInfoData>;
  kyc: Partial<KYCData>;
  address: Partial<AddressData>;
  employment: Partial<EmploymentData>;
  coApplicant: Partial<CoApplicantData>;
  documents: Partial<DocumentsData>;
}

// ── EMI ───────────────────────────────────────────────────────────────────────
export interface EMIResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
  interestRate: number;
}

// ── Eligibility ───────────────────────────────────────────────────────────────
export interface EligibilityResult {
  score: number; // 0–100
  riskLevel: RiskLevel;
  eligible: boolean;
  maxAmount: number;
}

// ── Loan Config ───────────────────────────────────────────────────────────────
export interface LoanConfig {
  minAmount: number;
  maxAmount: number;
  minTenure: number; // months
  maxTenure: number;
  baseRate: number; // annual %
  purposes: string[];
}
