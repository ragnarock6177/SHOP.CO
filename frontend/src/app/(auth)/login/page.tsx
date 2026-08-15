"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  RealPhoneInput,
  isValidPhoneNumber,
} from "@/components/ui/RealPhoneInput";
import { FormFieldError } from "@/components/ui/FormFieldError";

// Zod Validation Schemas
const mobileLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Mobile number is required")
    .refine(
      (val) => !!val && isValidPhoneNumber(val),
      "Please enter a valid 10-digit mobile number for selected country",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password cannot exceed 16 characters limit"),
});

const emailLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, "Email address is required")
    .max(100, "Email address cannot exceed 100 characters")
    .email("Please enter a valid email address (e.g. name@example.com)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password cannot exceed 16 characters limit"),
});

type LoginFormData = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const [inputMode, setInputMode] = useState<"mobile" | "email">("mobile");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeSchema =
    inputMode === "mobile" ? mobileLoginSchema : emailLoginSchema;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(activeSchema),
    mode: "onTouched",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const passwordVal = watch("password") || "";

  // Switch between Mobile & Email input mode cleanly
  const handleToggleInputMode = () => {
    const nextMode = inputMode === "mobile" ? "email" : "mobile";
    setInputMode(nextMode);
    reset({ identifier: "", password: "" });
  };

  const onValidLoginSubmit = (data: LoginFormData) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] py-10 sm:py-14">
      {/* Top Left Corner Back to Home Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black transition-all group bg-white border border-gray-200 hover:border-gray-300 rounded-full px-4 py-2.5 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-md mx-auto px-4 pt-12 sm:pt-6 space-y-6 text-black">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-integral text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            WELCOME BACK
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to your AIRAVÉ account to view orders and checkout faster.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-integral text-2xl font-black text-black uppercase">
                  LOGGED IN SUCCESSFULLY!
                </h2>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Welcome back to AIRAVÉ. You are now logged in as{" "}
                  <span className="font-bold text-black">
                    {getValues("identifier") || "User"}
                  </span>
                  .
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-flex w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Go to My Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Google Social Login */}
              <div>
                <button
                  type="button"
                  onClick={() => alert("Google Sign-In clicked!")}
                  className="w-full py-3.5 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs"
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
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold uppercase text-gray-400 absolute">
                  OR
                </span>
              </div>

              {/* Form Validation Summary Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200/80 text-red-700 rounded-2xl p-3.5 text-xs font-medium flex items-center gap-2.5 shadow-2xs animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>
                    Please correct the highlighted fields below to continue.
                  </span>
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit(onValidLoginSubmit)}
                className="space-y-4"
                noValidate
              >
                {/* Default Mobile Input with Country Code Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase text-gray-700">
                      {inputMode === "mobile"
                        ? "Mobile Number"
                        : "Email Address"}
                    </label>
                    <button
                      type="button"
                      onClick={handleToggleInputMode}
                      className="text-[11px] font-semibold text-black hover:text-gray-700 flex items-center gap-1 bg-[#F0F0F0] hover:bg-gray-200 px-2.5 py-1 rounded-full transition-all"
                    >
                      {inputMode === "mobile" ? (
                        <>
                          <Mail className="w-3 h-3 text-gray-600" />
                          <span>Login with Email</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3 h-3 text-gray-600" />
                          <span>Login with Mobile</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    {inputMode === "mobile" ? (
                      <Controller
                        name="identifier"
                        control={control}
                        render={({ field }) => (
                          <RealPhoneInput
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            error={!!errors.identifier}
                            placeholder="Enter mobile number"
                            defaultCountry="IN"
                          />
                        )}
                      />
                    ) : (
                      <>
                        <Mail
                          className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                            errors.identifier ? "text-red-500" : "text-gray-400"
                          }`}
                        />
                        <input
                          type="email"
                          placeholder="enter your email address"
                          {...register("identifier")}
                          className={`w-full bg-[#F0F0F0] rounded-full pl-11 pr-4 py-3 text-xs text-black placeholder-gray-400 focus:outline-none transition-all ${
                            errors.identifier
                              ? "border border-red-500 bg-red-50/40 ring-2 ring-red-500/20 animate-shake shadow-xs shadow-red-500/10"
                              : "focus:ring-2 focus:ring-black/10 focus:bg-white"
                          }`}
                        />
                      </>
                    )}
                  </div>
                  <FormFieldError message={errors.identifier?.message} />
                </div>

                {/* Password Field (With Live Max 16 Indicator) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase text-gray-700 block">
                      Password
                    </label>
                    {passwordVal.length > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold select-none transition-colors ${
                          passwordVal.length === 16
                            ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 animate-pulse"
                            : "text-gray-400"
                        }`}
                      >
                        {passwordVal.length === 16
                          ? "16/16 (Max limit reached!)"
                          : `${passwordVal.length}/16`}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${
                        errors.password ? "text-red-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      maxLength={16}
                      placeholder="enter your password"
                      {...register("password")}
                      className={`w-full bg-[#F0F0F0] rounded-full pl-11 pr-11 py-3 text-xs text-black placeholder-gray-400 focus:outline-none transition-all ${
                        errors.password
                          ? "border border-red-500 bg-red-50/40 ring-2 ring-red-500/20 animate-shake shadow-xs shadow-red-500/10"
                          : passwordVal.length === 16
                            ? "border border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30"
                            : "focus:ring-2 focus:ring-black/10 focus:bg-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FormFieldError message={errors.password?.message} />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-black rounded"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Password reset link sent to your registered address.",
                      )
                    }
                    className="hover:text-black font-semibold text-xs"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isLoading ? "Signing in..." : "Log In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Switch to SignUp */}
        <div className="text-center text-xs text-gray-500">
          Don't have an account yet?{" "}
          <Link href="/signup" className="font-bold text-black underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
