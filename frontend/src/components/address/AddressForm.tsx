"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RealPhoneInput } from "@/components/ui/RealPhoneInput";
import { CustomSelect } from "@/components/ui/select";
import { INDIAN_STATES } from "@/lib/indianStates";
import type { AddressFormValues, AddressLabel } from "@/types/address";

const LABEL_OPTIONS: AddressLabel[] = ["Home", "Work", "Other"];

interface AddressFormProps {
  values: AddressFormValues;
  onChange: (values: AddressFormValues) => void;
  showEmail?: boolean;
  showDefaultToggle?: boolean;
  showSaveHint?: boolean;
  idPrefix?: string;
  variant?: "default" | "premium";
}

function FieldLabel({
  htmlFor,
  children,
  optional,
  premium,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
  premium?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block mb-2 font-bold uppercase tracking-[0.14em]",
        premium ? "text-[10px] text-neutral-500" : "text-[11px] text-gray-700",
      )}
    >
      {children}
      {optional && (
        <span className={cn("font-semibold normal-case", premium ? "text-neutral-400" : "text-gray-400")}>
          {" "}
          (optional)
        </span>
      )}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-neutral-400">
        {children}
      </p>
      <div className="h-px flex-1 bg-neutral-200/80" />
    </div>
  );
}

export function AddressForm({
  values,
  onChange,
  showEmail = false,
  showDefaultToggle = true,
  showSaveHint = false,
  idPrefix = "address",
  variant = "default",
}: AddressFormProps) {
  const premium = variant === "premium";

  const inputClassName = premium
    ? "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/5"
    : "w-full bg-[#F4F4F4] rounded-full px-4 py-2.5 text-xs text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all";

  const selectTriggerClassName = premium
    ? "h-[46px] rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium shadow-none hover:border-neutral-300"
    : "h-[42px] rounded-full bg-[#F4F4F4] border-transparent px-4 text-xs font-semibold";

  const setField = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className={cn("space-y-5", premium && "space-y-6")}>
      <div>
        <FieldLabel premium={premium}>Address type</FieldLabel>
        <div
          className={cn(
            premium
              ? "grid grid-cols-3 gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 p-1"
              : "flex flex-wrap gap-2",
          )}
        >
          {LABEL_OPTIONS.map((label) => {
            const active = values.label === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setField("label", label)}
                className={cn(
                  "text-[11px] font-extrabold uppercase tracking-[0.12em] transition-all duration-200",
                  premium
                    ? cn(
                        "rounded-xl px-3 py-2.5",
                        active
                          ? "bg-white text-neutral-950 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-neutral-200"
                          : "text-neutral-500 hover:text-neutral-800",
                      )
                    : cn(
                        "rounded-full px-4 py-2",
                        active
                          ? "bg-black text-white shadow-[0_8px_24px_-10px_rgba(0,0,0,0.35)]"
                          : "bg-[#F4F4F4] text-neutral-700 hover:bg-neutral-200/70",
                      ),
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {premium && <SectionTitle>Contact details</SectionTitle>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel htmlFor={`${idPrefix}-firstName`} premium={premium}>
            First name
          </FieldLabel>
          <input
            id={`${idPrefix}-firstName`}
            type="text"
            value={values.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            required
            className={inputClassName}
          />
        </div>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-lastName`} premium={premium}>
            Last name
          </FieldLabel>
          <input
            id={`${idPrefix}-lastName`}
            type="text"
            value={values.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      {showEmail && (
        <div>
          <FieldLabel htmlFor={`${idPrefix}-email`} premium={premium}>
            Email address
          </FieldLabel>
          <input
            id={`${idPrefix}-email`}
            type="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            required
            className={inputClassName}
          />
        </div>
      )}

      <div>
        <FieldLabel premium={premium}>Mobile number</FieldLabel>
        <div
          className={cn(
            premium &&
              "[&>div>div]:rounded-2xl [&>div>div]:border [&>div>div]:border-neutral-200 [&>div>div]:bg-white [&>div>div]:px-3 [&>div>div]:py-1.5 [&>div>div]:shadow-none [&>div>div]:focus-within:border-neutral-950 [&>div>div]:focus-within:ring-2 [&>div>div]:focus-within:ring-neutral-950/5",
          )}
        >
          <RealPhoneInput
            value={values.phone}
            onChange={(phone) => setField("phone", phone)}
            defaultCountry="IN"
          />
        </div>
      </div>

      {premium && <SectionTitle>Address details</SectionTitle>}

      <div>
        <FieldLabel htmlFor={`${idPrefix}-line1`} premium={premium}>
          House / flat / building
        </FieldLabel>
        <input
          id={`${idPrefix}-line1`}
          type="text"
          value={values.addressLine1}
          onChange={(e) => setField("addressLine1", e.target.value)}
          required
          placeholder="Flat 402, Skyline Residency"
          className={inputClassName}
        />
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}-line2`} premium={premium}>
          Street / area
        </FieldLabel>
        <input
          id={`${idPrefix}-line2`}
          type="text"
          value={values.addressLine2}
          onChange={(e) => setField("addressLine2", e.target.value)}
          placeholder="Bandra West, Linking Road"
          className={inputClassName}
        />
      </div>

      <div>
        <FieldLabel htmlFor={`${idPrefix}-landmark`} premium={premium} optional>
          Landmark
        </FieldLabel>
        <input
          id={`${idPrefix}-landmark`}
          type="text"
          value={values.landmark}
          onChange={(e) => setField("landmark", e.target.value)}
          placeholder="Near City Mall"
          className={inputClassName}
        />
      </div>

      {premium && <SectionTitle>Location</SectionTitle>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <FieldLabel htmlFor={`${idPrefix}-city`} premium={premium}>
            City
          </FieldLabel>
          <input
            id={`${idPrefix}-city`}
            type="text"
            value={values.city}
            onChange={(e) => setField("city", e.target.value)}
            required
            className={inputClassName}
          />
        </div>
        <div>
          <FieldLabel premium={premium}>State</FieldLabel>
          <CustomSelect
            value={values.state}
            onChange={(state) => setField("state", state)}
            placeholder="Select state"
            options={INDIAN_STATES.map((state) => ({ value: state, label: state }))}
            triggerClassName={selectTriggerClassName}
          />
        </div>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-pin`} premium={premium}>
            PIN code
          </FieldLabel>
          <input
            id={`${idPrefix}-pin`}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={values.postalCode}
            onChange={(e) => setField("postalCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            className={inputClassName}
          />
        </div>
      </div>

      {showDefaultToggle && (
        <button
          type="button"
          role="switch"
          aria-checked={values.isDefault}
          onClick={() => setField("isDefault", !values.isDefault)}
          className={cn(
            "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all",
            premium
              ? values.isDefault
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-neutral-50/80 hover:border-neutral-300"
              : "border-transparent",
          )}
        >
          <div>
            <p
              className={cn(
                "text-sm font-bold",
                premium && values.isDefault ? "text-white" : "text-neutral-900",
              )}
            >
              Set as default address
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs font-medium",
                premium && values.isDefault ? "text-white/70" : "text-neutral-500",
              )}
            >
              Used automatically at checkout
            </p>
          </div>
          <span
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              values.isDefault
                ? premium
                  ? "bg-white"
                  : "bg-black"
                : "bg-neutral-300",
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 rounded-full shadow-sm transition-transform",
                values.isDefault
                  ? premium
                    ? "translate-x-5 bg-neutral-950"
                    : "translate-x-5 bg-white"
                  : "translate-x-0.5 bg-white",
              )}
            />
          </span>
        </button>
      )}

      {showSaveHint && (
        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
          This address will be saved securely to your AIRAVÉ account for faster checkout next time.
        </p>
      )}
    </div>
  );
}
