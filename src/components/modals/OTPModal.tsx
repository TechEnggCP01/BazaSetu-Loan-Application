import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface OTPModalProps {
  open: boolean;
  mobile: string;
  onVerify: () => void;
  onClose: () => void;
  onResend: () => void;
  verifyFn: (otp: string) => boolean;
  resendCooldown: number;
}

export const OTPModal: React.FC<OTPModalProps> = ({
  open,
  mobile,
  onVerify,
  onClose,
  onResend,
  verifyFn,
  resendCooldown,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setDigits(['', '', '', '', '', '']);
      setError('');
      setSuccess(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    }
  }, [open]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otp = digits.join('');
    if (otp.length < 6) { setError('Please enter all 6 digits'); return; }
    if (verifyFn(otp)) {
      setSuccess(true);
      setTimeout(() => { onVerify(); onClose(); }, 1200);
    } else {
      setError('Incorrect OTP. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Card */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center py-4"
                >
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-3" />
                  <p className="text-lg font-bold text-slate-800">Verified!</p>
                  <p className="text-sm text-slate-500">Mobile number confirmed</p>
                </motion.div>
              ) : (
                <motion.div key="form">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 mb-4 mx-auto">
                    <MessageSquare className="w-6 h-6 text-brand-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 text-center mb-1">Verify Mobile</h2>
                  <p className="text-sm text-slate-500 text-center mb-6">
                    OTP sent to <span className="font-semibold text-slate-700">+91 {mobile}</span>
                    <br />
                    <span className="text-xs text-brand-600">(Check browser console for OTP)</span>
                  </p>

                  {/* OTP inputs */}
                  <div className="flex justify-center gap-2 mb-4">
                    {digits.map((d, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        aria-label={`OTP digit ${idx + 1}`}
                        className="otp-input"
                      />
                    ))}
                  </div>

                  {error && (
                    <p role="alert" className="text-xs text-red-600 text-center mb-3">{error}</p>
                  )}

                  <Button className="w-full mb-3" onClick={handleVerify}>
                    Verify OTP
                  </Button>

                  <div className="text-center">
                    {resendCooldown > 0 ? (
                      <span className="text-xs text-slate-400">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={onResend}
                        className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend OTP
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
