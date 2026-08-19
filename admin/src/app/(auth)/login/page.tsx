"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "../../../validators/auth.validator";
import { useAuth } from "../../../hooks/useAuth";
import apiClient from "../../../lib/apiClient";
import { ApiResponse } from "../../../types/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-100">AIRAVÉ</h1>
          <p className="text-xs text-zinc-400">Administrative Operations Portal</p>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Email Address</label>
            <input
              type="email"
              {...register("email")}
              placeholder="admin@airave.com"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-[10px] text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
            {errors.password && <p className="mt-1 text-[10px] text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-zinc-100 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Sign In to Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
