"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-black">
      <div className="border-b border-gray-200 pb-6 space-y-2">
        <h1 className="font-be-vietnam-pro-black text-3xl sm:text-4xl font-black uppercase text-black">
          TERMS & PRIVACY POLICY
        </h1>
        <p className="text-xs text-gray-500">Last updated: August 12, 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-black uppercase">
            1. Overview & Agreement
          </h2>
          <p>
            Welcome to AIRAVÉ. By accessing our website, purchasing products, or
            creating an account, you agree to be bound by these Terms &
            Conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-black uppercase">
            2. Purchasing & Pricing
          </h2>
          <p>
            All prices are listed in USD ($). We reserve the right to modify
            prices or discontinue items at any time. Promotional discount codes
            (e.g. SUMMER2026) are subject to specific expiration criteria.
          </p>
        </section>

        <section
          id="privacy"
          className="space-y-2 pt-4 border-t border-gray-200"
        >
          <h2 className="font-bold text-base text-black uppercase">
            3. Privacy Policy & Data Protection
          </h2>
          <p>
            Your personal information (name, email, shipping address, and
            payment credentials) is encrypted using industry-standard 256-Bit
            SSL technology. We never sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-black uppercase">
            4. Return & Refund Conditions
          </h2>
          <p>
            Items returned within 30 days of purchase in original unworn
            condition with tags will be refunded to the original payment method
            within 3 business days of warehouse receipt.
          </p>
        </section>
      </div>
    </div>
  );
}
