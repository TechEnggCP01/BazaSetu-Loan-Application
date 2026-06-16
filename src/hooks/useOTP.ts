import { useState, useEffect } from 'react';
import { generateOTP } from '../lib/utils';

interface UseOTPReturn {
  otp: string | null;
  verified: boolean;
  resendCooldown: number;
  sendOTP: () => void;
  verifyOTP: (input: string) => boolean;
  reset: () => void;
}

export function useOTP(): UseOTPReturn {
  const [otp, setOtp] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendOTP = () => {
    const generated = generateOTP();
    setOtp(generated);
    setResendCooldown(30);
    console.info(`[LendSwift OTP] Your OTP is: ${generated}`); // Dev-only
  };

  const verifyOTP = (input: string): boolean => {
    if (input === otp) {
      setVerified(true);
      return true;
    }
    return false;
  };

  const reset = () => {
    setOtp(null);
    setVerified(false);
    setResendCooldown(0);
  };

  return { otp, verified, resendCooldown, sendOTP, verifyOTP, reset };
}
