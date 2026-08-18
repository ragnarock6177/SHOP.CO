"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mb-20 sm:-mb-24">
      <div className="bg-black text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side Title */}
        <div className="lg:col-span-7">
          <h2 className="font-be-vietnam-pro-black text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight uppercase">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-5 space-y-3">
          {subscribed ? (
            <div className="bg-white/10 border border-white/20 text-white font-be-vietnam-pro p-4 rounded-2xl text-center font-medium text-sm">
              Thank you for subscribing! Check your inbox for exclusive offers.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="bg-white rounded-full px-4 py-3 flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-black placeholder-gray-500 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-gray-100 text-black  font-semibold text-sm py-3 px-6 rounded-full transition-colors shadow-md"
              >
                Subscribe to Newsletter
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
