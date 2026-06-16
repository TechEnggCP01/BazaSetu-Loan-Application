import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, className, id, ...props }, ref) => {
    const checkId = id || `checkbox-${Math.random().toString(36).slice(2)}`;
    const errorId = `${checkId}-error`;

    return (
      <div className="w-full">
        <label htmlFor={checkId} className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkId}
              aria-describedby={error ? errorId : undefined}
              aria-invalid={!!error}
              className={cn(
                'peer sr-only',
                className
              )}
              {...props}
            />
            <div className={cn(
              'w-5 h-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center',
              'peer-checked:bg-brand-600 peer-checked:border-brand-600',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30 peer-focus-visible:ring-offset-1',
              error ? 'border-red-400' : 'border-slate-300 group-hover:border-brand-400'
            )}>
              <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" style={{ display: 'block' }} />
            </div>
            {/* Visible check icon overlay */}
            <div className="absolute inset-0 w-5 h-5 rounded-md flex items-center justify-center pointer-events-none">
              <Check className={cn(
                'w-3 h-3 text-white transition-opacity duration-150',
                props.checked ? 'opacity-100' : 'opacity-0'
              )} />
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-700 font-medium">{label}</span>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
        </label>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 ml-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
