import { z } from 'zod';

// ── Constants ─────────────────────────────────────────────────────────────────

export const LOAN_LIMITS = {
  personal: { min: 10000, max: 1000000 },
  home: { min: 500000, max: 10000000 },
  business: { min: 50000, max: 5000000 },
} as const;

// ── Step 1: Loan Details ──────────────────────────────────────────────────────

export const loanDetailsSchema = z.object({
  loanType: z.enum(['personal', 'home', 'business'], {
    message: 'Please select a loan type',
  }),
  loanAmount: z
    .number({ message: 'Enter a valid amount' })
    .positive('Amount must be positive'),
  loanTenure: z
    .number({ message: 'Tenure is required' })
    .min(6, 'Minimum tenure is 6 months')
    .max(360, 'Maximum tenure is 360 months'),
  loanPurpose: z.string().min(1, 'Please select a loan purpose'),
  referralCode: z.string().optional(),
}).superRefine((data, ctx) => {
  const limits = LOAN_LIMITS[data.loanType];
  if (data.loanAmount < limits.min) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Minimum amount is ₹${limits.min.toLocaleString('en-IN')}`, path: ['loanAmount'] });
  }
  if (data.loanAmount > limits.max) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Maximum amount is ₹${limits.max.toLocaleString('en-IN')}`, path: ['loanAmount'] });
  }
});

// ── Step 2: Personal Information ──────────────────────────────────────────────

export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  dateOfBirth: z.string().refine((dob) => {
    const date = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 18 && age <= 70;
  }, 'You must be between 18 and 70 years of age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], { message: 'Please select gender' }),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], { message: 'Please select marital status' }),
  fatherName: z.string().min(2, "Father's name is required").regex(/^[a-zA-Z\s]+$/, 'Only letters allowed'),
  motherName: z.string().min(2, "Mother's name is required").regex(/^[a-zA-Z\s]+$/, 'Only letters allowed'),
  email: z.string().email('Enter a valid email address'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  alternateMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
  mobileVerified: z.boolean().refine((v) => v, 'Please verify your mobile number'),
  emailVerified: z.boolean(),
});

// ── Step 3: KYC ───────────────────────────────────────────────────────────────

export const kycSchema = z.object({
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN (e.g. ABCDE1234F)'),
  panVerified: z.boolean().refine((v) => v, 'Please verify your PAN number'),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
  aadhaarVerified: z.boolean().refine((v) => v, 'Please verify your Aadhaar'),
  aadhaarConsent: z.boolean().refine((v) => v, 'Aadhaar consent is required'),
  voterId: z.string().optional().or(z.literal('')),
  passportNumber: z
    .string()
    .regex(/^[A-Z][0-9]{7}$/, 'Enter a valid passport number')
    .optional()
    .or(z.literal('')),
});

// ── Step 4: Address ───────────────────────────────────────────────────────────

export const addressSchema = z.object({
  currentAddressLine1: z.string().min(5, 'Address line 1 is required'),
  currentAddressLine2: z.string().optional(),
  currentPinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  currentCity: z.string().min(2, 'City is required'),
  currentState: z.string().min(2, 'State is required'),
  currentResidenceType: z.enum(['owned', 'rented', 'family_owned', 'company_provided']),
  currentYearsAtAddress: z.number().min(0).max(100),
  sameAsCurrent: z.boolean(),
  permanentAddressLine1: z.string().optional(),
  permanentAddressLine2: z.string().optional(),
  permanentPinCode: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  hasPreviousAddress: z.boolean().optional(),
  previousAddressLine1: z.string().optional(),
  previousCity: z.string().optional(),
  previousState: z.string().optional(),
});

// ── Step 5: Employment ────────────────────────────────────────────────────────

export const salariedSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  designation: z.string().min(2, 'Designation is required'),
  monthlySalary: z.number().min(10000, 'Monthly salary must be at least ₹10,000'),
  yearsOfExperience: z.number().min(0).max(50),
});

export const selfEmployedSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(1, 'Select a business type'),
  annualTurnover: z.number().min(100000, 'Annual turnover must be at least ₹1,00,000'),
  yearsInBusiness: z.number().min(0).max(50),
});

export const businessOwnerSchema = z.object({
  registrationNumber: z.string().min(5, 'Registration number is required'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid GST number').optional().or(z.literal('')),
  annualRevenue: z.number().min(100000, 'Annual revenue must be at least ₹1,00,000'),
});

export const employmentSchema = z.object({
  employmentType: z.enum(['salaried', 'self_employed', 'business_owner']),
  salaried: salariedSchema.partial().optional(),
  selfEmployed: selfEmployedSchema.partial().optional(),
  businessOwner: businessOwnerSchema.partial().optional(),
}).superRefine((data, ctx) => {
  if (data.employmentType === 'salaried') {
    const res = salariedSchema.safeParse(data.salaried);
    if (!res.success) {
      res.error.issues.forEach((issue) => ctx.addIssue({ ...issue, path: ['salaried', ...issue.path] }));
    }
  } else if (data.employmentType === 'self_employed') {
    const res = selfEmployedSchema.safeParse(data.selfEmployed);
    if (!res.success) {
      res.error.issues.forEach((issue) => ctx.addIssue({ ...issue, path: ['selfEmployed', ...issue.path] }));
    }
  } else if (data.employmentType === 'business_owner') {
    const res = businessOwnerSchema.safeParse(data.businessOwner);
    if (!res.success) {
      res.error.issues.forEach((issue) => ctx.addIssue({ ...issue, path: ['businessOwner', ...issue.path] }));
    }
  }
});

// ── Step 6: Co-applicant ─────────────────────────────────────────────────────

export const coApplicantSchema = z.object({
  hasCoApplicant: z.boolean(),
  spouseName: z.string().optional(),
  relationship: z.string().optional(),
  coApplicantIncome: z.number().optional(),
  coApplicantContact: z.string().optional(),
});

// ── Step 7: Documents ─────────────────────────────────────────────────────────

export const documentsSchema = z.object({
  signatureDataUrl: z.string().min(1, 'Please provide your signature'),
});

// ── Step 8: Review Consent ────────────────────────────────────────────────────

export const reviewSchema = z.object({
  termsAccepted: z.boolean().refine((v) => v, 'You must accept the terms and conditions'),
  creditBureauConsent: z.boolean().refine((v) => v, 'Credit bureau consent is required'),
  dataProcessingConsent: z.boolean().refine((v) => v, 'Data processing consent is required'),
});

// ── Inferred Types ────────────────────────────────────────────────────────────
export type LoanDetailsFormData = z.infer<typeof loanDetailsSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type KYCFormData = z.infer<typeof kycSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type EmploymentFormData = z.infer<typeof employmentSchema>;
export type CoApplicantFormData = z.infer<typeof coApplicantSchema>;
export type DocumentsFormData = z.infer<typeof documentsSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
