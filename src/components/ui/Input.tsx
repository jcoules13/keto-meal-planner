import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  className = '',
  label,
  helperText,
  error,
  fullWidth = true,
  icon,
  iconPosition = 'left',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const baseInputClasses = 'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors';
  const errorInputClasses = error 
    ? 'border-error-500 bg-error-50 dark:bg-error-900/20 text-error-900 dark:text-error-200' 
    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white';
  
  const widthClass = fullWidth ? 'w-full' : '';
  const iconClass = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  
  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-block'} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`${baseInputClasses} ${errorInputClasses} ${widthClass} ${iconClass}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500 dark:text-neutral-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-error-600 dark:text-error-400"
        >
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;