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
        <label className="block text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="ml-1 text-rose-600">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && <p className="text-[10px] text-slate-500">{helpText}</p>}
      {error && <p className="text-[10px] text-rose-600">{error}</p>}
    </div>
  );
};

export default FormField;
