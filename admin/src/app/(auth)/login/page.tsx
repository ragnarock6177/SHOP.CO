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
      const response = await apiClient.post<ApiResponse<{ token: string; user: any }>>("/auth/login", data);
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        login(token, user);
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-neutral-50 px-4 text-neutral-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-3xl font-black uppercase tracking-[0.2em] text-black">AIRAVÉ</span>
            <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-500 tracking-widest">
              Admin
            </span>
          </div>
          <p className="text-sm text-neutral-400">Sign in to the admin panel</p>
        </div>

        {/* Card */}
        <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {errorMessage && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Email Address</label>
              <input
                type="email"
                {...register("email")}
                placeholder="admin@airave.com"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none transition"
              />
              {errors.email && <p className="mt-1 text-[10px] text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Password</label>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none transition"
              />
              {errors.password && <p className="mt-1 text-[10px] text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 active:bg-black disabled:opacity-50 mt-2"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
