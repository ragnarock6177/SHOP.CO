"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/validators/auth.validator";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      const response = await apiClient.post<ApiResponse<any>>("/auth/login", data);
      if (response.data.success && response.data.data) {
        const { accessToken, user } = response.data.data;

        login(accessToken, user);

        router.replace(redirectUrl);
      } else {
        setErrorMessage(response.data.message || "Invalid email or password");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed. Please verify credentials.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#f8fafc] px-4 text-slate-900 antialiased overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-3xl font-black uppercase tracking-[0.25em] text-slate-900">AIRAVÉ</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
              Admin
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Sign in to AIRAVÉ Operations Management</p>
        </div>

        {/* Card */}
        <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                {...register("email")}
                placeholder="admin@airave.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
              {errors.email && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
              {errors.password && <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 mt-3 flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Console"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] font-medium text-slate-400">
          Protected & Encrypted AIRAVÉ Enterprise Gateway
        </p>
      </div>
    </div>
  );
}
