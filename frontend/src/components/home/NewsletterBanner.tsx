"use client";

import React, { useState } from "react";
import { Mail, Check, Copy } from "lucide-react";

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState("");
  const [preference, setPreference] = useState("all");
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("WELCOME20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mb-20 sm:-mb-24">
      <div className="bg-black text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Left Side Title & Description */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-extrabold tracking-widest text-gray-400 uppercase block font-be-vietnam-pro">
            VIP CLUB MEMBERSHIP
          </span>
          <h2 className="font-be-vietnam-pro-black text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight uppercase">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS & DROPS
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg font-be-vietnam-pro">
            Subscribe to receive exclusive access to limited edition drops, seasonal private sales, and an instant <strong>20% discount code</strong> for your first order.
          </p>
        </div>

        {/* Right Side Form / Reward Display */}
        <div className="lg:col-span-5">
          {subscribed ? (
            <div className="bg-white/10 border border-white/20 text-white font-be-vietnam-pro p-6 rounded-2xl text-center space-y-3 backdrop-blur-md">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto font-bold">
                <Check className="w-6 h-6 stroke-3" />
              </div>
              <h4 className="font-be-vietnam-pro-black text-lg font-bold uppercase">
                Welcome to the VIP Club
              </h4>
              <p className="text-xs text-gray-300">
                Here is your 20% OFF discount code for your first purchase:
              </p>
              <div className="flex items-center justify-between bg-white text-black font-mono font-extrabold text-sm px-4 py-2.5 rounded-xl">
                <span>WELCOME20</span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs font-bold text-black underline hover:opacity-75 flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Preferences Selector */}
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
                <span>Preferences:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "mens", label: "Men's" },
                  { id: "womens", label: "Women's" },
                ].map((pref) => (
                  <button
                    type="button"
                    key={pref.id}
                    onClick={() => setPreference(pref.id)}
                    className={`px-3 py-1 rounded-full text-[11px] transition-colors ${
                      preference === pref.id
                        ? "bg-white text-black font-black"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>

              {/* Email Input */}
              <div className="bg-white rounded-full px-4 py-3 flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-black placeholder-gray-500 text-sm focus:outline-none font-medium"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-white hover:bg-gray-200 text-black font-be-vietnam-pro font-black text-sm py-3.5 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer uppercase tracking-wider"
              >
                Subscribe & Get 20% Off
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
