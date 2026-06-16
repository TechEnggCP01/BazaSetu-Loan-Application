import { useState, useCallback } from 'react';

type VerificationStatus = 'idle' | 'loading' | 'verified' | 'failed';

export function useKYCVerification() {
  const [panStatus, setPanStatus] = useState<VerificationStatus>('idle');
  const [aadhaarStatus, setAadhaarStatus] = useState<VerificationStatus>('idle');

  const verifyPAN = useCallback(async (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan)) {
      setPanStatus('failed');
      return false;
    }
    setPanStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    // Simulate: all valid-format PANs pass
    setPanStatus('verified');
    return true;
  }, []);

  const verifyAadhaar = useCallback(async (aadhaar: string) => {
    if (!/^\d{12}$/.test(aadhaar)) {
      setAadhaarStatus('failed');
      return false;
    }
    setAadhaarStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setAadhaarStatus('verified');
    return true;
  }, []);

  const resetPAN = useCallback(() => setPanStatus('idle'), []);
  const resetAadhaar = useCallback(() => setAadhaarStatus('idle'), []);

  return { panStatus, aadhaarStatus, verifyPAN, verifyAadhaar, resetPAN, resetAadhaar };
}
