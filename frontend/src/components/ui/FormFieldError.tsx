"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldErrorProps {
  message?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 px-3 py-1.5 bg-red-50 border border-red-200/80 rounded-xl text-red-600 text-[11px] font-medium shadow-2xs animate-fade-in-up">
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  );
};
