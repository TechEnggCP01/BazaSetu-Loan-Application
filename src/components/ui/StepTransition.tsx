import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepTransitionProps {
  stepKey: number;
  children: React.ReactNode;
}

export const StepTransition: React.FC<StepTransitionProps> = ({ stepKey, children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Fade in for elements within a step
export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale pop-in for badges, icons
export const PopIn: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className={className}
  >
    {children}
  </motion.div>
);
