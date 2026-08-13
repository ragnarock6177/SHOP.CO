"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-black">
      <div className="text-center space-y-3">
        <h1 className="font-integral text-3xl sm:text-4xl font-black uppercase text-black">
          HELP CENTER & FAQS
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
          Have questions about your order, shipping, or returns? Find answers
          below or get in touch with our customer support team.
        </p>
      </div>

      {/* Support Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F0F0F0] rounded-3xl p-6 text-center space-y-2">
          <Mail className="w-6 h-6 text-black mx-auto" />
          <h4 className="font-bold text-sm text-black">Email Support</h4>
          <p className="text-xs text-gray-500">support@AIRAVÉ</p>
        </div>

        <div className="bg-[#F0F0F0] rounded-3xl p-6 text-center space-y-2">
          <Phone className="w-6 h-6 text-black mx-auto" />
          <h4 className="font-bold text-sm text-black">Phone Helpline</h4>
          <p className="text-xs text-gray-500">+1 (800) 555-SHOP</p>
        </div>

        <div className="bg-[#F0F0F0] rounded-3xl p-6 text-center space-y-2">
          <MessageSquare className="w-6 h-6 text-black mx-auto" />
          <h4 className="font-bold text-sm text-black">Live Chat</h4>
          <p className="text-xs text-gray-500">Available 24/7</p>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-integral text-xl font-black text-black border-b border-gray-200 pb-4 uppercase">
          FREQUENTLY ASKED QUESTIONS
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-black hover:bg-[#F0F0F0] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-black transition-transform ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="p-4 bg-[#F0F0F0] text-xs text-gray-600 border-t border-gray-200 leading-relaxed">
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
