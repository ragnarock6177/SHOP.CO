"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard delivery takes 3 to 5 business days across North America and Europe. Express delivery options (1-2 business days) are available during checkout.",
    },
    {
      q: "What is your return policy?",
      a: "We offer a 30-day hassle-free return policy on all unworn items with original tags intact. Simply initiate a return from your Account page to receive a prepaid shipping label.",
    },
    {
      q: "How do I choose the correct clothing size?",
      a: "Each product page includes a size selection grid (Small to 4X-Large). We recommend checking our fit details in the Product Details tab.",
    },
    {
      q: "Can I track my order in real time?",
      a: "Yes! As soon as your order ships, a tracking code (e.g. TRK90281471) is emailed to you and added to your Account > My Orders tab.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept Visa, Mastercard, PayPal, Apple Pay, Google Pay, and Cash on Delivery (COD).",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 text-black font-be-vietnam-pro gpu-layer">
      <div className="text-center space-y-2">
        <h1 className="font-be-vietnam-pro-black text-2xl sm:text-4xl font-black uppercase text-black tracking-tight">
          HELP CENTER & FAQS
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-medium">
          Have questions about your order, shipping, or returns? Find answers
          below or get in touch with our customer support team.
        </p>
      </div>

      {/* Support Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#F4F4F4] rounded-3xl p-5 text-center space-y-1.5 shadow-2xs">
          <Mail className="w-5 h-5 text-black mx-auto" />
          <h4 className="font-bold text-xs sm:text-sm text-black">Email Support</h4>
          <p className="text-[11px] text-gray-500 font-medium">support@AIRAVÉ</p>
        </div>

        <div className="bg-[#F4F4F4] rounded-3xl p-5 text-center space-y-1.5 shadow-2xs">
          <Phone className="w-5 h-5 text-black mx-auto" />
          <h4 className="font-bold text-xs sm:text-sm text-black">Phone Helpline</h4>
          <p className="text-[11px] text-gray-500 font-medium">+1 (800) 555-SHOP</p>
        </div>

        <div className="bg-[#F4F4F4] rounded-3xl p-5 text-center space-y-1.5 shadow-2xs">
          <MessageSquare className="w-5 h-5 text-black mx-auto" />
          <h4 className="font-bold text-xs sm:text-sm text-black">Live Chat</h4>
          <p className="text-[11px] text-gray-500 font-medium">Available 24/7</p>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-3.5 shadow-2xs">
        <h3 className="font-be-vietnam-pro-black text-base sm:text-xl font-black text-black border-b border-gray-100 pb-3 uppercase tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h3>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200/80 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left font-bold text-xs sm:text-sm text-black hover:bg-[#F4F4F4] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-black transition-transform duration-200 shrink-0 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="p-3.5 bg-[#F4F4F4] text-xs text-gray-600 border-t border-gray-100 leading-relaxed font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
