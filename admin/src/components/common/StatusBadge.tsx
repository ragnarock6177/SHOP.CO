'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200/80 bg-amber-50 text-amber-700',
  danger: 'border-rose-200/80 bg-rose-50 text-rose-700',
  info: 'border-sky-200/80 bg-sky-50 text-sky-700',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
};

export function StatusBadge({ status, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide capitalize', variantStyles[variant], className)}>
      {status}
    </Badge>
  );
}
