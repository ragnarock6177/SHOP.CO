"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, ShieldCheck, X } from "lucide-react";
import { AddressForm } from "@/components/address/AddressForm";
import type { AddressFormValues } from "@/types/address";
import { EMPTY_ADDRESS_FORM } from "@/types/address";

interface AddressModalProps {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: AddressFormValues;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
}

export function AddressModal({
  open,
  title,
  submitLabel,
  initialValues,
  loading = false,
  onClose,
  onSubmit,
}: AddressModalProps) {
  const [values, setValues] = useState<AddressFormValues>(initialValues || EMPTY_ADDRESS_FORM);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setValues(initialValues || EMPTY_ADDRESS_FORM);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open, initialValues]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/65 backdrop-blur-[3px] p-0 sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_32px_100px_-24px_rgba(0,0,0,0.55)] sm:max-h-[90vh] sm:rounded-[32px] sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left editorial panel */}
            <div className="relative hidden w-[34%] shrink-0 flex-col justify-between overflow-hidden bg-neutral-950 p-8 text-white sm:flex">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_55%)]" />
              <div className="relative space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/45">
                    AIRAVÉ Delivery
                  </p>
                  <h3 className="font-be-vietnam-pro-black text-2xl font-black uppercase leading-tight tracking-tight">
                    Where should we send your order?
                  </h3>
                  <p className="text-sm leading-relaxed text-white/65">
                    Save once, checkout faster every time. Your address stays private and secure.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-2 text-[11px] font-semibold text-white/50">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Encrypted & stored only for your account</span>
              </div>
            </div>

            {/* Form panel */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-start justify-between border-b border-neutral-100 px-5 py-4 sm:px-7 sm:py-5">
                <div className="min-w-0 pr-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-400">
                    Profile
                  </p>
                  <h3 className="mt-1 font-be-vietnam-pro-black text-lg font-black uppercase tracking-tight text-black sm:text-xl">
                    {title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onSubmit(values);
                }}
              >
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                  <AddressForm
                    values={values}
                    onChange={setValues}
                    showDefaultToggle
                    variant="premium"
                    idPrefix="modal-address"
                  />
                </div>

                <div className="border-t border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
                  <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-neutral-200 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all hover:bg-black disabled:opacity-60"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitLabel}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
