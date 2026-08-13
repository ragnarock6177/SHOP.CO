"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Account created successfully for ${fullName}!`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8 text-black">
      <div className="text-center space-y-2">
        <h1 className="font-integral text-3xl font-black text-black uppercase">
          JOIN AIRAVÉ
        </h1>
        <p className="text-xs text-gray-500">
          Create an account and get 20% off your first fashion order.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => alert("Google Sign-Up")}
            className="py-3 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => alert("Apple Sign-Up")}
            className="py-3 px-4 rounded-full bg-black text-white flex items-center justify-center gap-2 text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            <span> Apple</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase text-gray-400 absolute">
            OR
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Must be at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-500">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
                className="accent-black rounded mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link href="#" className="underline text-black font-semibold">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline text-black font-semibold">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-gray-200">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>256-Bit SSL Encrypted Registration</span>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-black underline">
          Log In
        </Link>
      </div>
    </div>
  );
}
