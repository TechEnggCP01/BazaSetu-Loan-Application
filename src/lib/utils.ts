import type { LoanType, EMIResult, EligibilityResult, LoanConfig } from '../types/loan';

// ── Loan Configuration ────────────────────────────────────────────────────────

export const LOAN_CONFIGS: Record<LoanType, LoanConfig> = {
  personal: {
    minAmount: 10000,
    maxAmount: 1000000,
    minTenure: 12,
    maxTenure: 60,
    baseRate: 12.5,
    purposes: ['Debt Consolidation', 'Medical Emergency', 'Education', 'Travel', 'Wedding', 'Home Renovation', 'Electronics', 'Other'],
  },
  home: {
    minAmount: 500000,
    maxAmount: 10000000,
    minTenure: 60,
    maxTenure: 360,
    baseRate: 8.5,
    purposes: ['Purchase', 'Construction', 'Renovation', 'Plot Purchase', 'Balance Transfer'],
  },
  business: {
    minAmount: 50000,
    maxAmount: 5000000,
    minTenure: 12,
    maxTenure: 84,
    baseRate: 14.0,
    purposes: ['Working Capital', 'Equipment Purchase', 'Expansion', 'Inventory', 'Marketing', 'Technology Upgrade'],
  },
};

// ── Currency Formatting ───────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

// ── EMI Calculator ────────────────────────────────────────────────────────────

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): EMIResult {
  const monthlyRate = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - principal;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
    interestRate: annualRate,
  };
}

// ── Eligibility Score ─────────────────────────────────────────────────────────

export function calculateEligibility(
  loanAmount: number,
  monthlyIncome: number,
  loanType: LoanType
): EligibilityResult {
  const config = LOAN_CONFIGS[loanType];
  let score = 100;

  // Debt-to-income ratio (EMI should be ≤40% of income)
  const emi = calculateEMI(loanAmount, config.baseRate, config.minTenure).emi;
  const dtiRatio = emi / monthlyIncome;
  if (dtiRatio > 0.6) score -= 40;
  else if (dtiRatio > 0.4) score -= 20;
  else if (dtiRatio > 0.3) score -= 10;

  // Amount vs limit
  if (loanAmount > config.maxAmount * 0.8) score -= 10;

  score = Math.max(0, Math.min(100, score));
  const riskLevel = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high';

  return {
    score,
    riskLevel,
    eligible: score >= 30,
    maxAmount: Math.min(config.maxAmount, monthlyIncome * 60),
  };
}

// ── Age Calculation ───────────────────────────────────────────────────────────

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── PIN lookup simulation ─────────────────────────────────────────────────────

const PIN_DB: Record<string, { city: string; state: string }> = {
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
};

export async function lookupPinCode(pin: string): Promise<{ city: string; state: string } | null> {
  await new Promise((r) => setTimeout(r, 600));
  return PIN_DB[pin] ?? null;
}

// ── OTP Simulation ────────────────────────────────────────────────────────────

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── File Utilities ────────────────────────────────────────────────────────────

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const STEP_NAMES = [
  'Loan Details',
  'Personal Information',
  'KYC Verification',
  'Address Details',
  'Employment & Income',
  'Co-applicant Details',
  'Documents & Signature',
  'Review & Submit',
];
