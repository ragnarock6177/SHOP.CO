"use client";

import React from "react";

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  helpText,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-zinc-300">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && <p className="text-[10px] text-zinc-500">{helpText}</p>}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
};

export default FormField;
